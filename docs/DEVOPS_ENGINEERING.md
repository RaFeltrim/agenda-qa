# ⚙️ DevOps Engineering - Agenda-QA v3.0

**Version:** 1.0.0  
**Date:** 2026-01-17  
**Author:** DevOps Engineer  

---

## 🎯 DevOps Vision

Implement robust, scalable infrastructure with:
- **Infrastructure as Code (IaC)** for reproducible deployments
- **Automated CI/CD pipelines** for rapid, reliable releases
- **Comprehensive monitoring** for system health visibility
- **Security-first approach** with automated compliance
- **Cost optimization** without compromising performance

---

## ☁️ Cloud Infrastructure Architecture

### AWS Infrastructure Overview
```
Region: us-east-1 (N. Virginia)
Availability Zones: 3 AZs for high availability

Infrastructure Components:
├── Networking Layer
│   ├── VPC (10.0.0.0/16)
│   ├── Public Subnets (2 AZs)
│   ├── Private Subnets (2 AZs)
│   ├── NAT Gateways (2 AZs)
│   └── Internet Gateway
├── Compute Layer
│   ├── ECS Cluster (Fargate)
│   ├── EC2 Bastion Host
│   └── Lambda Functions
├── Data Layer
│   ├── RDS PostgreSQL (Multi-AZ)
│   ├── ElastiCache Redis (Cluster Mode)
│   └── S3 Buckets
├── Security Layer
│   ├── WAF
│   ├── Shield Advanced
│   └── IAM Roles/Policies
└── Monitoring Layer
    ├── CloudWatch
    ├── X-Ray
    └── EventBridge
```

### Terraform Infrastructure Code
```hcl
# terraform/main.tf
terraform {
  required_version = "~> 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "agenda-qa-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "agenda-qa-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false
  one_nat_gateway_per_az = true

  tags = {
    Environment = "production"
    Project     = "agenda-qa"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "agenda-qa-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Environment = "production"
    Project     = "agenda-qa"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "agenda-qa-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = true

  tags = {
    Environment = "production"
    Project     = "agenda-qa"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgres" {
  identifier             = "agenda-qa-postgres"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t4g.medium"
  allocated_storage      = 20
  storage_type           = "gp3"
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.rds.arn
  
  username               = var.db_username
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  
  multi_az               = true
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot    = false
  final_snapshot_identifier = "agenda-qa-final-snapshot"
  
  performance_insights_enabled = true
  performance_insights_retention_period = 7

  tags = {
    Environment = "production"
    Project     = "agenda-qa"
  }
}

# ElastiCache Redis
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id          = "agenda-qa-redis"
  replication_group_description = "Redis cluster for Agenda-QA"
  node_type                     = "cache.t4g.micro"
  port                          = 6379
  parameter_group_name          = "default.redis7"
  engine_version                = "7.0"
  
  num_cache_clusters            = 2
  automatic_failover_enabled    = true
  multi_az_enabled              = true
  
  subnet_group_name             = aws_elasticache_subnet_group.redis.name
  security_group_ids            = [aws_security_group.redis_sg.id]

  tags = {
    Environment = "production"
    Project     = "agenda-qa"
  }
}

# CloudFront CDN
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB-Origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  aliases = ["app.agenda-qa.com"]

  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "ALB-Origin"
    
    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.main.arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Environment = "production"
    Project     = "agenda-qa"
  }
}
```

---

## 🔄 CI/CD Pipeline Architecture

### GitHub Actions Workflow
```yaml
# .github/workflows/deployment.yml
name: Production Deployment Pipeline

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECS_CLUSTER: agenda-qa-cluster
  ECS_SERVICE: agenda-qa-service
  ECS_TASK_DEFINITION: agenda-qa-task-definition
  CONTAINER_NAME: agenda-qa-app

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run security scans
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  build-and-test:
    needs: security-scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e
          
      - name: Build application
        run: npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.PROD_API_URL }}
          REACT_APP_ENV: production
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-output
          path: dist/

  deploy-infrastructure:
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: 1.6.0
          
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Terraform fmt
        run: terraform fmt -check
        
      - name: Terraform init
        run: terraform init
        
      - name: Terraform validate
        run: terraform validate
        
      - name: Terraform plan
        run: terraform plan -out=tfplan
        
      - name: Terraform apply
        run: terraform apply tfplan

  deploy-application:
    needs: [deploy-infrastructure]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-output
          path: dist/
          
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/agenda-qa:$IMAGE_TAG .
          docker push $ECR_REGISTRY/agenda-qa:$IMAGE_TAG
          
      - name: Fill in the new image ID in the Amazon ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: agenda-qa-app
          image: ${{ steps.login-ecr.outputs.registry }}/agenda-qa:${{ github.sha }}
          
      - name: Deploy Amazon ECS task definition
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: agenda-qa-service
          cluster: agenda-qa-cluster
          wait-for-service-stability: true

  post-deployment:
    needs: deploy-application
    runs-on: ubuntu-latest
    steps:
      - name: Run post-deployment tests
        run: |
          npm run test:smoke
          npm run test:api-contract
          
      - name: Update deployment status
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.repos.createDeploymentStatus({
              owner: context.repo.owner,
              repo: context.repo.repo,
              deployment_id: context.payload.deployment.id,
              state: 'success',
              environment: 'production'
            })
```

---

## 📊 Monitoring and Observability

### CloudWatch Dashboard Configuration
```json
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ECS", "CPUUtilization", "ServiceName", "agenda-qa-service", "ClusterName", "agenda-qa-cluster" ],
          [ ".", "MemoryUtilization", ".", ".", ".", "." ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Application Resources",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "agenda-qa-postgres" ],
          [ ".", "FreeableMemory", ".", "." ],
          [ ".", "ReadIOPS", ".", "." ],
          [ ".", "WriteIOPS", ".", "." ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Database Performance",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/agenda-qa-alb/*" ],
          [ ".", "HTTPCode_Target_2XX_Count", ".", "." ],
          [ ".", "HTTPCode_Target_4XX_Count", ".", "." ],
          [ ".", "HTTPCode_Target_5XX_Count", ".", "." ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "Application Traffic",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/CloudFront", "Requests", "Region", "Global", "DistributionId", "*" ],
          [ ".", "4xxErrorRate", ".", ".", ".", "." ],
          [ ".", "5xxErrorRate", ".", ".", ".", "." ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "us-east-1",
        "title": "CDN Performance",
        "period": 300
      }
    }
  ]
}
```

### Application Monitoring with Prometheus
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert-rules.yml"

scrape_configs:
  - job_name: 'agenda-qa-app'
    static_configs:
      - targets: ['app.agenda-qa.com:9090']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'agenda-qa-database'
    static_configs:
      - targets: ['rds-monitoring.agenda-qa.com:9187']
    scrape_interval: 60s

  - job_name: 'agenda-qa-redis'
    static_configs:
      - targets: ['redis-exporter.agenda-qa.com:9121']
    scrape_interval: 30s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager.agenda-qa.com:9093']
```

### Custom Application Metrics
```javascript
// src/metrics/application-metrics.js
const prometheus = require('prom-client');

// Custom metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const activeUsers = new prometheus.Gauge({
  name: 'active_users_count',
  help: 'Number of currently active users'
});

const databaseQueryDuration = new prometheus.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

const apiRateLimit = new prometheus.Counter({
  name: 'api_rate_limit_exceeded_total',
  help: 'Total number of rate limit exceeded events',
  labelNames: ['endpoint', 'user_id']
});

class MetricsCollector {
  static observeHttpRequest(method, route, statusCode, duration) {
    httpRequestDuration.labels(method, route, statusCode).observe(duration);
  }

  static setActiveUsers(count) {
    activeUsers.set(count);
  }

  static observeDatabaseQuery(queryType, table, duration) {
    databaseQueryDuration.labels(queryType, table).observe(duration);
  }

  static incrementRateLimit(endpoint, userId) {
    apiRateLimit.labels(endpoint, userId).inc();
  }

  static getMetrics() {
    return prometheus.register.metrics();
  }
}

module.exports = MetricsCollector;
```

---

## 🔒 Security Implementation

### Security Headers Configuration
```javascript
// middleware/security-headers.js
const helmet = require('helmet');

const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "api.agenda-qa.com"],
      objectSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
});

module.exports = securityHeaders;
```

### WAF Rules Configuration
```json
{
  "name": "Agenda-QA-WAF",
  "scope": "CLOUDFRONT",
  "defaultAction": {
    "allow": {}
  },
  "rules": [
    {
      "name": "AWSManagedRulesCommonRuleSet",
      "priority": 1,
      "overrideAction": {
        "none": {}
      },
      "statement": {
        "managedRuleGroupStatement": {
          "vendorName": "AWS",
          "name": "AWSManagedRulesCommonRuleSet"
        }
      },
      "visibilityConfig": {
        "sampledRequestsEnabled": true,
        "cloudWatchMetricsEnabled": true,
        "metricName": "CommonRuleSet"
      }
    },
    {
      "name": "RateLimitRule",
      "priority": 2,
      "action": {
        "block": {}
      },
      "statement": {
        "rateBasedStatement": {
          "limit": 1000,
          "aggregateKeyType": "IP"
        }
      },
      "visibilityConfig": {
        "sampledRequestsEnabled": true,
        "cloudWatchMetricsEnabled": true,
        "metricName": "RateLimitRule"
      }
    },
    {
      "name": "SQLInjectionRule",
      "priority": 3,
      "action": {
        "block": {}
      },
      "statement": {
        "sqliMatchStatement": {
          "fieldToMatch": {
            "body": {}
          },
          "textTransformations": [
            {
              "priority": 0,
              "type": "URL_DECODE"
            }
          ]
        }
      },
      "visibilityConfig": {
        "sampledRequestsEnabled": true,
        "cloudWatchMetricsEnabled": true,
        "metricName": "SQLInjectionRule"
      }
    }
  ]
}
```

---

## 💰 Cost Optimization Strategy

### Resource Sizing Recommendations
```yaml
# Cost-optimized resource configuration
resources:
  # Frontend (React SPA)
  frontend:
    compute: S3 + CloudFront
    estimated_cost: $10-50/month
    
  # Backend (Node.js API)
  backend:
    compute: ECS Fargate (t4g.small)
    instances: 2 (autoscaling)
    estimated_cost: $100-200/month
    
  # Database (PostgreSQL)
  database:
    instance: db.t4g.medium (Multi-AZ)
    storage: 20GB gp3
    estimated_cost: $150-250/month
    
  # Cache (Redis)
  cache:
    nodes: 2 (cache.t4g.micro)
    estimated_cost: $30-50/month
    
  # Monitoring
  monitoring:
    cloudwatch: Included in AWS free tier
    estimated_cost: $20-40/month

# Total estimated monthly cost: $310-590
# (Significantly lower than traditional VM-based deployment)
```

### Auto-scaling Configuration
```json
{
  "ScalableDimension": "ecs:service:DesiredCount",
  "ServiceNamespace": "ecs",
  "ResourceId": "service/agenda-qa-cluster/agenda-qa-service",
  "MinCapacity": 2,
  "MaxCapacity": 10,
  "TargetTrackingScalingPolicies": [
    {
      "PolicyName": "CPU-Scaling-Policy",
      "TargetValue": 70.0,
      "PredefinedMetricSpecification": {
        "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
      },
      "ScaleOutCooldown": 300,
      "ScaleInCooldown": 300
    },
    {
      "PolicyName": "Memory-Scaling-Policy",
      "TargetValue": 75.0,
      "CustomizedMetricSpecification": {
        "MetricName": "MemoryUtilization",
        "Namespace": "AWS/ECS",
        "Dimensions": [
          {
            "Name": "ServiceName",
            "Value": "agenda-qa-service"
          }
        ],
        "Statistic": "Average"
      },
      "ScaleOutCooldown": 300,
      "ScaleInCooldown": 300
    }
  ]
}
```

---

## 🚨 Incident Response Procedures

### Critical Alert Response
```bash
#!/bin/bash
# scripts/incident-response.sh

# Critical incident response playbook
handle_critical_incident() {
    local incident_type=$1
    local severity=$2
    
    case $incident_type in
        "database_down")
            echo "Executing database recovery procedure..."
            # Promote read replica
            aws rds promote-read-replica --db-instance-identifier agenda-qa-postgres-standby
            # Update DNS records
            aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch file://dns-update.json
            ;;
            
        "high_cpu")
            echo "Scaling application capacity..."
            aws ecs update-service --cluster agenda-qa-cluster --service agenda-qa-service --desired-count 4
            ;;
            
        "security_breach")
            echo "Activating security incident response..."
            # Block malicious IPs
            aws wafv2 update-ip-set --scope CLOUDFRONT --id $IP_SET_ID --lock-token $LOCK_TOKEN --addresses $MALICIOUS_IPS
            # Enable detailed logging
            aws cloudtrail update-trail --name agenda-qa-trail --include-global-service-events
            ;;
    esac
    
    # Notify stakeholders
    send_notification "Incident: $incident_type (Severity: $severity)" "pagerduty,slack,email"
}

# Health check monitoring
monitor_application_health() {
    local health_endpoint="https://app.agenda-qa.com/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" $health_endpoint)
    
    if [ $response -ne 200 ]; then
        handle_critical_incident "application_unhealthy" "HIGH"
    fi
}
```

---

## 📈 Performance Benchmarks

### Target SLAs
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Application Uptime** | 99.9% | TBD | ⚪ |
| **API Response Time** | < 200ms (p95) | TBD | ⚪ |
| **Page Load Time** | < 1.5s | TBD | ⚪ |
| **Database Query Time** | < 50ms (p95) | TBD | ⚪ |
| **Deployment Frequency** | Weekly | TBD | ⚪ |
| **Mean Time to Recovery** | < 30 min | TBD | ⚪ |

---

*DevOps Engineering - Maintained by DevOps Engineer*  
*Last Updated: 2026-01-17*