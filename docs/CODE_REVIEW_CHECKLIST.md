# 📋 Code Review Checklist - Agenda-QA v3.0

**Purpose:** Standardized quality gate for all code contributions  
**Applies to:** Pull Requests, Feature branches, Hotfixes  
**Enforced by:** Technical Leader + Automated CI  

---

## 🔍 Pre-Review Self-Check (Author Responsibility)

Before submitting PR, author MUST verify:

### ✅ TypeScript Compliance
- [ ] **Strict Mode Enabled:** NoImplicitAny, StrictNullChecks, StrictFunctionTypes
- [ ] **Zero TypeScript Errors:** `npm run type-check` passes
- [ ] **Interfaces Used:** All props/state typed with interfaces
- [ ] **Generic Types:** Properly used where applicable
- [ ] **Union Types:** Discriminated unions for variant props

### ✅ React Best Practices
- [ ] **Functional Components:** No class components
- [ ] **Hooks Rules:** Only call hooks at top level
- [ ] **React.memo:** Applied to components with expensive renders
- [ ] **useCallback:** For event handlers passed to children
- [ ] **useMemo:** For expensive computations
- [ ] **Key Props:** Unique keys in lists
- [ ] **Effect Dependencies:** Correct dependency arrays

### ✅ Testing Requirements
- [ ] **Unit Tests:** 80%+ coverage for new logic
- [ ] **Component Tests:** Snapshot + behavior tests
- [ ] **Integration Tests:** API interactions tested
- [ ] **E2E Tests:** Critical user flows covered
- [ ] **Test Descriptions:** Clear, descriptive test names
- [ ] **Mock Cleanup:** No test pollution between runs

### ✅ Performance Standards
- [ ] **Bundle Impact:** < 10KB increase (check with `npm run analyze`)
- [ ] **Render Optimizations:** No unnecessary re-renders
- [ ] **Lazy Loading:** Large components code-split
- [ ] **Image Optimization:** WebP format, lazy loading
- [ ] **Debouncing:** Applied to search/typeahead
- [ ] **Virtualization:** Lists > 50 items virtualized

### ✅ Security Checklist
- [ ] **Input Sanitization:** All user inputs sanitized
- [ ] **XSS Prevention:** dangerouslySetInnerHTML avoided
- [ ] **CSRF Protection:** Tokens used for mutations
- [ ] **SQL Injection:** Parameterized queries only
- [ ] **Auth Validation:** Server-side permission checks
- [ ] **Secrets Management:** No hardcoded credentials
- [ ] **Dependency Audit:** `npm audit` clean

### ✅ Accessibility (WCAG 2.1 AA)
- [ ] **Semantic HTML:** Proper heading hierarchy
- [ ] **ARIA Labels:** Interactive elements labeled
- [ ] **Keyboard Navigation:** Full tab navigation
- [ ] **Focus Management:** Visible focus indicators
- [ ] **Color Contrast:** 4.5:1 minimum ratio
- [ ] **Screen Reader:** Tested with NVDA/JAWS
- [ ] **Alt Text:** All images have descriptive alt text

### ✅ Code Style & Maintainability
- [ ] **ESLint Passes:** No warnings/errors
- [ ] **Prettier Formatted:** Consistent code style
- [ ] **Naming Conventions:** camelCase, PascalCase followed
- [ ] **Function Length:** < 50 lines (exceptions documented)
- [ ] **Component Props:** Well-documented with JSDoc
- [ ] **Comments:** Explain "why", not "what"
- [ ] **TODO/FIXME:** Issues tracked with ticket numbers

### ✅ Documentation
- [ ] **README Updates:** Feature documentation added
- [ ] **Inline Comments:** Complex logic explained
- [ ] **Type Definitions:** Interfaces documented
- [ ] **API Changes:** OpenAPI spec updated
- [ ] **Migration Guide:** Breaking changes documented

---

## 🧑‍💻 Reviewer Checklist

### Technical Review
- [ ] **Architecture Alignment:** Follows ADR decisions
- [ ] **State Management:** Appropriate use of Context/Local state
- [ ] **Side Effects:** Proper useEffect cleanup
- [ ] **Error Handling:** Graceful failure cases
- [ ] **Edge Cases:** Boundary conditions handled
- [ ] **Race Conditions:** Concurrent operations considered

### Code Quality
- [ ] **DRY Principle:** No duplicated logic
- [ ] **Single Responsibility:** Functions/components focused
- [ ] **Readability:** Code is self-documenting
- [ ] **Maintainability:** Easy to modify/extend
- [ ] **Performance:** No obvious bottlenecks

### Security Deep Dive
- [ ] **Privilege Escalation:** No bypass of RBAC
- [ ] **Data Exposure:** No sensitive data in logs
- [ ] **Injection Points:** All inputs validated
- [ ] **Authentication:** Session management secure

---

## 🚀 Pre-Merge Gate

All of the following must pass:

### Automated Checks
- [ ] **CI Pipeline:** All jobs green (lint, test, build, e2e)
- [ ] **Code Coverage:** Overall > 85%, New code > 90%
- [ ] **Bundle Size:** Within threshold (+/- 10KB)
- [ ] **Security Scan:** No critical/high vulnerabilities
- [ ] **Performance Budget:** Lighthouse scores > 90

### Manual Verification
- [ ] **Functionality:** Feature works as described
- [ ] **Cross-Browser:** Chrome, Firefox, Safari, Edge
- [ ] **Responsive:** Mobile/tablet/desktop views
- [ ] **Dark Mode:** Theme switching works
- [ ] **Accessibility:** axe-core scan passes
- [ ] **User Experience:** Smooth, intuitive interactions

---

## ⚠️ Red Flags (BLOCK Merge)

PR will be rejected if ANY of these are present:

- ❌ TypeScript errors in build
- ❌ Tests failing or skipped
- ❌ Security vulnerabilities introduced
- ❌ Performance regression > 20%
- ❌ Accessibility violations
- ❌ Breaking public API without migration path
- ❌ Missing documentation for public interfaces
- ❌ Hardcoded secrets or credentials
- ❌ Console errors/warnings in production build

---

## 📊 Review Process Flow

```
1. Author Self-Review → Fix issues
      ↓
2. Submit Pull Request
      ↓
3. Automated Checks Run (10-15 min)
      ↓
4. Code Review Assignment
      ↓
5. Manual Review (30-60 min)
      ↓
6. Address Feedback Loop
      ↓
7. Final Approval + Merge
```

---

## 👥 Review Assignment Matrix

| Change Type | Primary Reviewer | Secondary Reviewer | Time Estimate |
|-------------|------------------|-------------------|---------------|
| Bug Fix | Tech Lead | QA Lead | 30 min |
| Feature | Peer Dev | Tech Lead | 60 min |
| Architecture | Tech Lead | Principal Dev | 90 min |
| Security | Security Champion | Tech Lead | 45 min |
| Performance | Performance Lead | Tech Lead | 45 min |

---

## 📈 Quality Metrics Dashboard

Track these metrics per PR:

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Code Review Time | < 2 hours | TBD | ➜ |
| Comments per PR | 5-15 | TBD | ➜ |
| Revisions per PR | < 2 | TBD | ➜ |
| Defect Rate | < 1% | TBD | ➜ |

---

## 🛠️ Tooling Configuration

### ESLint Rules (.eslintrc.js)
```js
module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
```

### TypeScript Config (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## 📝 PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Performance improvement
- [ ] Security fix

## Testing Performed
- [ ] Unit tests added/updated
- [ ] Integration tests passed
- [ ] E2E tests verified
- [ ] Manual testing completed

## Screenshots (if applicable)

## Checklist
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes OR migration guide provided
```

---

*Last Updated: 2026-01-17 | Maintained by: Technical Leader*