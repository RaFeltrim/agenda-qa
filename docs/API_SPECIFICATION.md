# 🔌 API Specification - Agenda-QA v3.0

**Version:** 1.0.0  
**Format:** OpenAPI 3.0  
**Base URL:** https://your-supabase-url.supabase.co/rest/v1  
**Author:** Senior Backend Engineer  

---

## 📋 Overview

Complete API specification for Agenda-QA Kanban application with full CRUD operations, authentication, real-time features, and audit logging.

---

## 🔐 Authentication

All endpoints require Bearer Token authentication except `/auth/*` endpoints.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Security Schemes

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## 📍 API Endpoints

### Authentication Endpoints

#### POST `/auth/login`
User login with email/password

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Responses:**
- `200 OK`: Successful login
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "editor",
    "token": "jwt-token"
  }
}
```
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limited

#### POST `/auth/register`
Register new user

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Responses:**
- `201 Created`: User registered
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

#### POST `/auth/logout`
Logout current user

**Responses:**
- `200 OK`: Successfully logged out
- `401 Unauthorized`: Not authenticated

---

### Tasks (Cards) Endpoints

#### GET `/api/tasks`
List tasks with optional filtering

**Parameters:**
- `status` (query): Filter by status (backlog|em-progresso|bloqueado|concluido)
- `sprint_id` (query): Filter by sprint
- `user_id` (query): Filter by assigned user
- `urgente` (query): Filter urgent tasks (true|false)
- `limit` (query): Pagination limit (default: 50)
- `offset` (query): Pagination offset (default: 0)

**Responses:**
- `200 OK`: Array of tasks
```json
[
  {
    "id": "uuid",
    "titulo": "Implement login feature",
    "descricao": "Create authentication system",
    "status": "em-progresso",
    "sprint_id": "uuid",
    "created_by": "uuid",
    "responsavel": ["user1@example.com"],
    "urgente": false,
    "prazo": "2026-02-01T10:00:00Z",
    "tags": ["frontend", "auth"],
    "version": 2,
    "created_at": "2026-01-15T14:30:00Z",
    "updated_at": "2026-01-16T09:15:00Z"
  }
]
```
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions

#### POST `/api/tasks`
Create new task

**Request:**
```json
{
  "titulo": "New task title",
  "descricao": "Detailed description",
  "status": "backlog",
  "sprint_id": "uuid",
  "responsavel": ["user1@example.com", "user2@example.com"],
  "urgente": false,
  "prazo": "2026-02-01T10:00:00Z",
  "tags": ["feature", "priority"]
}
```

**Responses:**
- `201 Created`: Task created successfully
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions

#### GET `/api/tasks/{id}`
Get specific task by ID

**Responses:**
- `200 OK`: Task details
- `404 Not Found`: Task doesn't exist
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: No access to this task

#### PATCH `/api/tasks/{id}`
Update existing task (with optimistic locking)

**Request:**
```json
{
  "titulo": "Updated title",
  "descricao": "Updated description",
  "status": "em-progresso",
  "version": 2
}
```

**Responses:**
- `200 OK`: Task updated
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: Version mismatch (concurrent edit)
```json
{
  "error": "Conflict",
  "message": "Task was modified by another user",
  "current_version": 3,
  "current_data": { /* current task data */ }
}
```

#### DELETE `/api/tasks/{id}`
Delete task

**Responses:**
- `204 No Content`: Task deleted
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Task doesn't exist

---

### Sprint Endpoints

#### GET `/api/sprints`
List sprints

**Parameters:**
- `active_only` (query): Show only active sprints
- `team_id` (query): Filter by team
- `limit` (query): Pagination
- `offset` (query): Pagination

**Responses:**
- `200 OK`: Array of sprints

#### POST `/api/sprints`
Create new sprint

**Request:**
```json
{
  "name": "Sprint 1 - Q1 2026",
  "start_date": "2026-01-15",
  "end_date": "2026-01-29",
  "team_id": "uuid",
  "goal": "Deliver core authentication features"
}
```

**Responses:**
- `201 Created`: Sprint created
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required

#### GET `/api/sprints/{id}`
Get sprint details

**Responses:**
- `200 OK`: Sprint with associated tasks
- `404 Not Found`: Sprint doesn't exist

#### PATCH `/api/sprints/{id}`
Update sprint

#### DELETE `/api/sprints/{id}`
Delete sprint (only if no tasks assigned)

---

### Audit Log Endpoints

#### GET `/api/audit-logs`
Retrieve audit trail (admin only)

**Parameters:**
- `card_id` (query): Filter by card
- `user_id` (query): Filter by user
- `action_type` (query): Filter by action (CREATE|UPDATE|DELETE|TRANSITION)
- `start_date` (query): Date range start
- `end_date` (query): Date range end

**Responses:**
- `200 OK`: Array of audit entries
```json
[
  {
    "id": "uuid",
    "card_id": "uuid",
    "action": "UPDATE",
    "changed_by": "uuid",
    "old_values": {"status": "backlog"},
    "new_values": {"status": "em-progresso"},
    "ip_address": "192.168.1.100",
    "user_agent": "Mozilla/5.0...",
    "created_at": "2026-01-16T10:30:00Z"
  }
]
```
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Admin access required

---

### AI Service Endpoints

#### POST `/api/ai/suggestions`
Get AI-powered task suggestions

**Request:**
```json
{
  "task_text": "Implement user authentication with JWT tokens",
  "context": {
    "project_type": "web_application",
    "team_size": 5,
    "technology_stack": ["React", "Node.js", "PostgreSQL"]
  }
}
```

**Responses:**
- `200 OK`: AI suggestions
```json
{
  "suggestions": {
    "subtasks": [
      "Setup JWT library and configuration",
      "Create user registration endpoint",
      "Implement login/logout endpoints",
      "Add token refresh mechanism",
      "Integrate with frontend authentication"
    ],
    "tags": ["auth", "backend", "security"],
    "priority": "high",
    "estimated_hours": 16,
    "dependencies": []
  }
}
```
- `400 Bad Request`: Invalid input
- `429 Too Many Requests`: Rate limit exceeded
- `503 Service Unavailable`: AI service temporarily down

#### POST `/api/ai/predict-bugs`
Predict potential issues in task description

**Request:**
```json
{
  "task_description": "Allow users to upload profile pictures",
  "technical_details": "Using AWS S3 for storage"
}
```

**Responses:**
- `200 OK`: Risk assessment
```json
{
  "risk_score": 75,
  "potential_issues": [
    "File size validation needed",
    "Image format security concerns",
    "Storage cost implications",
    "Backup and recovery requirements"
  ],
  "recommendations": [
    "Implement file size limits (5MB max)",
    "Validate MIME types server-side",
    "Consider CloudFront for caching",
    "Setup automated backup policies"
  ]
}
```

---

### User Management Endpoints

#### GET `/api/users/profile`
Get current user profile

#### PATCH `/api/users/profile`
Update user profile

#### GET `/api/users/team-members`
List team members (for assignment)

---

### Analytics Endpoints

#### GET `/api/analytics/sprint-metrics/{sprint_id}`
Get sprint performance metrics

**Responses:**
```json
{
  "sprint_id": "uuid",
  "velocity": 24,
  "completed_tasks": 18,
  "total_tasks": 20,
  "burndown_data": [
    {"date": "2026-01-15", "remaining": 20},
    {"date": "2026-01-16", "remaining": 18}
  ],
  "cycle_time_avg": 2.5,
  "blockers_count": 2
}
```

#### GET `/api/analytics/team-performance`
Get team-wide performance data

---

## 🔄 Real-time Subscriptions

### WebSocket Channels

#### `realtime:tasks`
Subscribe to task updates

```javascript
const channel = supabase
  .channel('tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'cards'
  }, (payload) => {
    console.log('Task change:', payload)
  })
  .subscribe()
```

#### `realtime:sprints`
Subscribe to sprint updates

#### `realtime:audit-logs`
Subscribe to audit events (admin only)

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "error": "Error code",
  "message": "Human-readable error message",
  "details": "Additional context (optional)",
  "timestamp": "2026-01-17T10:30:00Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Request data failed validation
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource doesn't exist
- `CONFLICT`: Version mismatch or resource conflict
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server-side error

---

## 📊 Rate Limiting

| Endpoint Category | Requests/Minute | Requests/Hour |
|------------------|----------------|---------------|
| Auth endpoints | 10 | 100 |
| Read operations | 100 | 1000 |
| Write operations | 50 | 500 |
| AI endpoints | 20 | 200 |

---

## 🔒 Security Headers

All responses include:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

---

## 🧪 Example Usage

### JavaScript/TypeScript Client
```typescript
// Get tasks for current sprint
const response = await fetch('/api/tasks?sprint_id=current&status=em-progresso', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const tasks = await response.json();

// Create new task
const newTask = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    titulo: 'Setup CI/CD pipeline',
    descricao: 'Configure automated testing and deployment',
    status: 'backlog',
    urgente: true
  })
});
```

### Python Client
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Get tasks
response = requests.get(
    f'{BASE_URL}/api/tasks',
    params={'status': 'em-progresso'},
    headers=headers
)

tasks = response.json()
```

---

## 📈 Performance Benchmarks

| Operation | Avg Response Time | 95th Percentile | Max Expected |
|-----------|------------------|----------------|--------------|
| GET /api/tasks | 150ms | 300ms | 500ms |
| POST /api/tasks | 200ms | 400ms | 800ms |
| PATCH /api/tasks/{id} | 180ms | 350ms | 600ms |
| GET /api/audit-logs | 250ms | 500ms | 1000ms |
| POST /api/ai/suggestions | 800ms | 1500ms | 3000ms |

---

## 🛠️ API Versioning

Current version: `v1`  
Future versions will be available at `/api/v2/`  
Deprecation notice: 3 months advance warning for breaking changes

---

*API Specification - Maintained by Senior Backend Engineer*  
*Last Updated: 2026-01-17*