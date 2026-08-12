---
sidebar: aiSidebar
title: Spec-Driven Development
description: 'Cursor''s multi-step task execution:'
keywords:
  - AI programming
  - LLM
  - Workflow
  - Spec-Driven
  - Development
  - Specification-driven development
  - ai
  - basics
  - spec driven development
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
---

# Spec-Driven Development

## Overview

**Spec-Driven Development (SDD)** or **Spec-Driven Coding** is a software development methodology **led by Specification**. Developers first write detailed requirements specifications, and then AI automatically generates code based on the specifications.

> **Core Concept**: Clear specifications → Automatic implementation → Reduce communication costs

---

## Core concepts

### 1. What is Spec?

**Spec** is a **accurate, executable description** of the software's functionality:

```markdown
# User login function specifications

## Function description
Users can log in to the system using their email and password.

## Input
- email: string, consistent with email format
- password: string, 8-32 characters, including letters and numbers

## Output
- Success: Return user information and JWT token
- Failure: Return error message

## Validation rules
- Email must be registered
- Password must be correct
- The account will be locked for 30 minutes after 5 consecutive failures.

## API endpoint
POST /api/auth/login
```

### 2. Spec-Driven vs traditional development

| Development methods         | Process                           | Advantages               | Disadvantages                |
| --------------------------- | --------------------------------- | ------------------------ | ---------------------------- |
| **Traditional development** | Requirements → Design → Coding    | Flexible                 | High communication cost      |
| **Spec-Driven**             | Specification → AI generated code | Automation, traceability | Need to write specifications |
| **Agile Development**       | User Stories → Iteration          | Quick Response           | Missing Documentation        |

---

## Spec-Driven Development process

```
┌─────────────────────────────────────────────────────────┐
│ Spec-Driven Development Process │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Requirements gathering │
│     │                                                   │
│     ▼                                                   │
│ 2. Writing specification (Spec) ┌─────────────────┐ │
│ │ │ Natural Language Specification │ │
│ ├────────────────────▶│ API Specification │ │
│ │ │ Data model specification │ │
│ │ │ UI Specification │ │
│     │                     └─────────────────┘          │
│     │                                                   │
│     ▼                                                   │
│ 3. AI code generation ┌─────────────────┐ │
│     │                     │ Claude Code     │          │
│     ├────────────────────▶│ Cursor Agent    │          │
│     │                     └─────────────────┘          │
│     │                                                   │
│     ▼                                                   │
│ 4. Code review │
│     │                                                   │
│     ▼                                                   │
│ 5. Test verification │
│     │                                                   │
│     ▼                                                   │
│ 6. Deployment and online │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Type of Spec

### 1. Functional specifications

Describe what the software should do:

```markdown
## Function: User registration

### need
Users can register new accounts

### Input field
- username: 3-20 characters, alphanumeric and underlined
- email: valid email address
- Password: at least 8 characters, must contain uppercase and lowercase letters and numbers

### Business rules
- Username must be unique
- The email address must not be registered
- Automatically send verification email after registration
```

### 2. API specification

Description API interface:

```yaml
# OpenAPI specification
openapi: 3.0.0
info:
title: User Authentication API
  version: 1.0.0

paths:
  /auth/login:
    post:
summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        '200':
description: Login successful
```

### 3. Data model specification

Describe the data structure:

```typescript
//TypeScript interface specification
interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}
```

### 4. UI specifications

Describe interface requirements:

```markdown
## Login page UI specification

### Layout
- Centered card layout
- Width 400px

### Components
- Email input box
- Password input box (with show/hide switch)
- "Remember me" checkbox
- "Forgot password" link
- Login button

### Style
- Main color: #3B82F6
- Rounded corners: 8px
- Shadow: 0 4px 6px rgba(0,0,0,0.1)
```

---

## Tools that support Spec-Driven

### 1. Cursor Composer

Cursor's multi-step task execution:

```typescript
// user input
"Implement user authentication functions, including registration, login, and logout"

// Cursor automatic planning
1. Analyze requirements → generate specifications
2. Design data model
3. Implement API endpoints
4. Create UI components
5. Write test cases
```

### 2. Claude Code CLI

Define specifications via CLAUDE.md:

```markdown
# Project specifications

## Coding specifications
- Use TypeScript strict mode
- Follow ESLint rules
- Use functional declarations for components

## API Specification
- RESTful style
- Unified error handling
- JWT authentication

## Test specifications
- Unit test coverage > 80%
- Use Vitest
```

---

## Spec Writing Best Practices

### 1. SMART principle

| Principles     | Description        | Examples                                                         |
| -------------- | ------------------ | ---------------------------------------------------------------- |
| **Specific**   | Specific and clear | "User can log in" rather than "implement authentication"         |
| **Measurable** | Measurable         | "Password 8-32 characters" rather than "Password complex enough" |
| **Achievable** | Achievable         | Consider technical limitations                                   |
| **Relevant**   | Relevance          | Alignment with business goals                                    |
| **Time-bound** | Time-bound         | "Complete within 2 seconds"                                      |

### 2. Structural specification

```markdown
## Function Overview
Describe the function in one sentence

## User Stories
As [role], I want [feature] for [purpose]

## Acceptance criteria
- [ ] Scenario 1: Description
- [ ] Scenario 2: Description

## Technical specifications
### Data model
### API interface
### Business logic

## Non-functional requirements
### Performance: response time < 200ms
### Security: HTTPS + JWT
### Compatible: supports mainstream browsers
```

### 3. Use specification language

- Use **natural language** but keep it structured
- Avoid ambiguous words ("as much as possible", "probably")
- Use **specific numbers** ("3 times" instead of "many")
- Contains **boundary conditions** ("null value", "overlong input")

---

## Spec-Driven vs other development methods

### Spec-Driven vs Vibe Coding

| Dimensions               | Spec-Driven             | Vibe Coding                   |
| ------------------------ | ----------------------- | ----------------------------- |
| **Planning**             | Detailed specifications | Feel free to play             |
| **Traceability**         | High                    | Low                           |
| **Teamwork**             | Easy                    | Hard                          |
| **AI Participation**     | Core                    | Auxiliary                     |
| **Applicable scenarios** | Large projects, teams   | Prototypes, personal projects |

### Spec-Driven vs Test-Driven Development

| Dimensions         | Spec-Driven        | TDD                    |
| ------------------ | ------------------ | ---------------------- |
| **Starting Point** | Specifications     | Testing                |
| **Sequence**       | Spec → Code → Test | Test → Code            |
| **AI Friendly**    | Yes                | No                     |
| **Combinable**     | Composable         | Relatively independent |

---

## Implementation suggestions

### 1. Standard template

```markdown
# [function name] specification

## background
Why do you need this feature

## Target
What effect does this function want to achieve?

## Function description
Detailed function description

## Acceptance criteria
How to judge function completion

## Technical considerations
- Performance requirements
- Security considerations
- Compatibility requirements

## Dependencies
Other functions or modules that depend on
```

### 2. Tool configuration

```json
// .claude/spec-template.json
{
"template": "# Functional Specification\n\n## Function Overview\n{summary}\n\n## Requirements\n{requirements}\n\n## Acceptance Criteria\n{acceptance}",
  "requiredFields": ["summary", "requirements"],
  "outputFormat": "markdown"
}
```

### 3. Version management

```
specs/
├── v1.0/
│   ├── auth-spec.md
│   ├── user-spec.md
│   └── api-spec.md
├── v1.1/
│ ├── auth-spec.md (updated)
│ └── payment-spec.md (new)
```

---

## Reference resources

### Related tools

- [Cursor Composer](https://cursor.com/docs/composer)
- [OpenAPI Specification](https://swagger.io/specification/)

### Related methodologies

- [Behavior-Driven Development (BDD)](https://en.wikipedia.org/wiki/Behavior-driven_development)
- [Feature-Driven Development (FDD)](https://en.wikipedia.org/wiki/Feature-driven_development)

---

**Document updated: December 2025**
