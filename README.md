# LLD Practice Platform

A focused full-stack platform for practicing **Low-Level Design (LLD)** problems through structured attempts, automated evaluation, and reviewable feedback.

The platform follows a simple practice loop:

**Choose a problem → Design a solution → Submit → Get feedback → Review → Try again**

## Core Features

### 🧩 LLD Problem Practice

* 3 curated LLD problems:

  * Parking Lot
  * Vending Machine
  * Elevator System
* Problems include difficulty, description, and structured requirements.
* Each problem can be practiced through multiple independent sessions.

### ✍️ Structured Solution Submission

Learners submit their design using five sections:

* Requirements & Assumptions
* Design
* Relationships & Interactions
* Trade-offs & Design Decisions
* Edge Cases & Extensibility

The first three sections are required; the final two are optional.

### 🔄 Multi-Attempt Practice

* Each practice session supports multiple attempts.
* Every attempt has its own submission and evaluation.
* An unfinished attempt can be resumed.
* Previous attempts remain available for review.
* A new attempt can be started while an earlier attempt is being evaluated.

### 🤖 Automated Evaluation

Evaluation combines:

* Deterministic requirement checks
* Rubric-based LLM evaluation
* Structured and validated evaluator output
* Application-controlled score calculation

Feedback includes:

* Overall score
* Strengths
* Improvement priorities
* Criterion-level scores
* Evidence
* Concerns
* Suggestions
* Evaluation confidence

### 📚 Practice History

* View previous practice sessions.
* Review attempts and their evaluation results.
* Track completed and failed evaluations.
* Retry a problem through a new attempt without losing previous work.

---

## Practice Flow

```text
Problem
   │
   ▼
Create Practice Session
   │
   ▼
Start Attempt
   │
   ▼
Write Structured Solution
   │
   ▼
Submit
   │
   ▼
Submission Persisted
   │
   ▼
Attempt → EVALUATING
   │
   ├── Deterministic Checks
   │
   └── LLM Evaluation
           │
           ▼
     Validate Result
           │
      ┌────┴────┐
      ▼         ▼
 COMPLETED    FAILED
      │
      ▼
 Review Feedback
      │
      ▼
   Try Again
```

A submission is persisted before evaluation begins. Evaluation currently runs synchronously within the submission request, while separate attempts can still be created through independent requests.

---

## Architecture

The application uses a **modular monolith** built with Next.js.

```text
┌─────────────────────────────────────────────┐
│                 Next.js App                 │
│                                             │
│  ┌─────────────┐      ┌─────────────────┐  │
│  │   Problems  │      │  LLD Sessions   │  │
│  └─────────────┘      └─────────────────┘  │
│                                             │
│  ┌─────────────┐      ┌─────────────────┐  │
│  │   Attempts  │─────▶│  Submissions    │  │
│  └─────────────┘      └────────┬────────┘  │
│                                │            │
│                                ▼            │
│                       ┌─────────────────┐   │
│                       │   Evaluation    │   │
│                       │                 │   │
│                       │ Deterministic + │   │
│                       │      LLM        │   │
│                       └────────┬────────┘   │
└────────────────────────────────┼────────────┘
                                 │
                                 ▼
                         PostgreSQL
```

The codebase is organized by domain modules rather than by a single global controller/service structure.

```text
src/server/
├── modules/
│   ├── auth/
│   ├── problems/
│   ├── lld-sessions/
│   ├── attempts/
│   ├── submissions/
│   └── evaluations/
│
└── shared/
    ├── auth/
    ├── config/
    ├── errors/
    ├── http/
    └── lib/
```

---

## Domain Model

```text
User
 │
 └── LLDSession
       │
       ├── Problem
       │     ├── ProblemRequirement
       │     └── ProblemEvaluationRubric
       │
       └── Attempt
             │
             └── Submission
                   │
                   └── Evaluation
                         │
                         └── EvaluationCriterion
```

### Main Domain Responsibilities

| Entity                    | Responsibility                           |
| ------------------------- | ---------------------------------------- |
| `User`                    | Authentication and ownership             |
| `Problem`                 | LLD problem definition                   |
| `ProblemRequirement`      | Structured problem requirements          |
| `EvaluationRubric`        | Reusable evaluation criterion definition |
| `ProblemEvaluationRubric` | Associates rubrics with problems         |
| `LLDSession`              | Practice context for one problem         |
| `Attempt`                 | One learner attempt within a session     |
| `Submission`              | Structured learner solution              |
| `Evaluation`              | Overall evaluation result                |
| `EvaluationCriterion`     | Criterion-level feedback and evidence    |

---

## Evaluation & Feedback

Evaluation is intentionally **hybrid**.

### 1. Deterministic Checks

Before LLM evaluation, the application calculates simple signals such as:

* Whether required submission sections are present.
* Whether problem requirements appear to be addressed using a lightweight keyword/word-overlap check.

These signals are supporting evidence rather than proof of design understanding.

### 2. LLM Evaluation

The evaluator receives:

* Problem description
* Problem requirements
* Evaluation rubrics
* Rubric guidance
* Complete submission
* Deterministic signals

The LLM produces structured criterion-level results.

The evaluator is exposed through an application-level interface:

```text
Evaluator
    │
    └── evaluate(EvaluationInput)
            │
            ▼
       EvaluationResult
```

This keeps the practice flow independent from the specific evaluation mechanism and allows another evaluator implementation to be introduced later.

### 3. Validation & Scoring

LLM output is validated using Zod.

The application also verifies that:

* Every rubric is evaluated exactly once.
* Criterion scores do not exceed their configured weights.
* The evaluator cannot directly determine the final overall score.

The overall score is calculated by the application from the individual criterion scores.

Evaluation records also snapshot the rubric name, description, weight, and guidance used at the time of evaluation so that historical feedback remains understandable if rubric definitions change later.

---

## Attempt Lifecycle

```text
IN_PROGRESS
     │
     ▼
 EVALUATING
    / \
   /   \
  ▼     ▼
COMPLETED FAILED
```

### Failure Handling

If evaluation fails after submission has been persisted:

* The submission is retained.
* The attempt is marked `FAILED`.
* No incomplete evaluation is presented as successful.
* The learner can create another attempt.

Duplicate submission of an attempt that is no longer `IN_PROGRESS` is rejected.

---

## API Overview

| Method | Endpoint                         | Purpose                                    |
| ------ | -------------------------------- | ------------------------------------------ |
| `POST` | `/api/auth/login`                | Login or create an account for a new email |
| `POST` | `/api/auth/logout`               | Log out                                    |
| `GET`  | `/api/auth/me`                   | Restore the authenticated user             |
| `GET`  | `/api/problems`                  | List available LLD problems                |
| `GET`  | `/api/problems/:id`              | Get problem details and requirements       |
| `POST` | `/api/lld-sessions`              | Create a practice session                  |
| `GET`  | `/api/lld-sessions`              | List the authenticated user's sessions     |
| `POST` | `/api/lld-sessions/:id/attempts` | Create an attempt                          |
| `POST` | `/api/attempts/:id/submission`   | Submit and evaluate an attempt             |

Evaluation does not have a separate public API endpoint. It is an internal consequence of submitting a solution.

---

## Tech Stack

| Area             | Technology                        |
| ---------------- | --------------------------------- |
| Framework        | Next.js 16                        |
| Language         | TypeScript                        |
| UI               | React 19                          |
| Styling          | Tailwind CSS                      |
| Data Fetching    | TanStack Query                    |
| Database         | PostgreSQL                        |
| ORM              | Prisma 6                          |
| Validation       | Zod                               |
| Authentication   | JWT + HttpOnly Cookie             |
| Password Hashing | bcrypt                            |
| LLM              | Google Gemini via `@google/genai` |
| Testing          | Vitest                            |

---

## Getting Started

### Prerequisites

* Node.js
* npm
* PostgreSQL database
* Gemini API key for LLM evaluation

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"

GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-3.6-flash"
```

Optional variables supported by the application:

```env
NODE_ENV="development"
PORT="3000"
CLIENT_URL="http://localhost:3000"
```

### Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npm run db:seed
```

The seed creates the required LLD problems, requirements, evaluation rubrics, and problem-rubric associations.

### Run the Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## Testing

The project uses **Vitest** for automated domain-level tests.

Run:

```bash
npm test
```

The current test suite covers the most important submission/evaluation invariants:

* Successful submission and evaluation lifecycle
* Duplicate submission protection
* Attempt ownership enforcement
* Evaluation failure handling
* Invalid evaluator output handling

Additional quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Key Engineering Decisions

### Modular Monolith

The application uses a modular monolith because the MVP does not justify the operational complexity of separate services.

The domain boundaries still allow individual components to evolve independently if the system grows.

### Persist Before Evaluation

Submission persistence and the transition to `EVALUATING` happen before invoking the evaluator.

This prevents learner work from being lost if evaluation fails.

### Hybrid Evaluation

Deterministic checks provide predictable signals while the LLM handles the qualitative aspects of LLD evaluation.

Neither mechanism is treated as a complete replacement for the other.

### Application-Controlled Scoring

The LLM evaluates individual criteria, but the application calculates the final score. This keeps scoring bounded by the configured rubric weights.

### Rubric Snapshotting

Evaluation records retain the rubric information used during evaluation so historical feedback remains interpretable when the current rubric changes.

### Multiple Independent Attempts

A learner can start another attempt while an earlier evaluation request is still running. This avoids unnecessarily blocking the practice workflow.

### Simple Infrastructure

The MVP intentionally avoids infrastructure that is not required for the current scale, such as:

* Message brokers
* Background worker infrastructure
* Microservices
* Kubernetes
* Distributed caches
* Vector databases

These can be introduced when there is a concrete requirement for them.

---

## Limitations & Future Evolution

Current limitations include:

* Three fixed seeded problems.
* Text-based solution submission only.
* Evaluation currently runs synchronously.
* Deterministic requirement matching uses a lightweight word-overlap heuristic.
* No administrative problem-management interface.
* No interactive UML/class-diagram editor.
* No code execution or compilation environment.
* Authentication is intentionally minimal for the MVP.
* Evaluation currently depends on the configured Gemini API.

Potential future evolution:

* Class diagram or other submission formats through a submission-format abstraction.
* Background evaluation using a durable queue and worker.
* Additional evaluator implementations such as rule-based or human evaluation.
* More sophisticated requirement and design analysis.
* Larger problem library and problem-management workflows.
* Richer attempt analytics and progress tracking.

---

## Project Structure

```text
src/
├── app/
│   ├── (routes)/
│   ├── api/
│   └── shared/
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── clear-db.ts
│
└── server/
    ├── modules/
    │   ├── auth/
    │   ├── problems/
    │   ├── lld-sessions/
    │   ├── attempts/
    │   ├── submissions/
    │   └── evaluations/
    │
    └── shared/
        ├── auth/
        ├── config/
        ├── errors/
        ├── http/
        └── lib/

tests/
└── submission-evaluation.test.ts
```

---

## Assignment Scope

This project is intentionally scoped as a focused LLD practice MVP.

The primary goal is to demonstrate:

* Clear domain modeling
* Separation of responsibilities
* A practical submission/evaluation lifecycle
* Explainable feedback
* Safe handling of evaluation failures
* Extensibility without premature infrastructure
* Meaningful automated tests
* Appropriate use of AI within a controlled engineering workflow