# AI Usage

AI was used throughout the project as a **design exploration, implementation, and review assistant**. It was particularly useful for proposing initial structures based on common software engineering patterns and for exploring alternatives quickly.

The final architecture was not accepted automatically. I evaluated proposals against the assignment requirements, MVP scope, and the behavior I wanted the platform to support, and made the final design decisions accordingly.

## 1. Practice Domain: Session → Attempt → Submission

### AI suggestion

The initial architecture discussion focused heavily on the `Attempt` as the main practice unit and proposed APIs centered directly around attempts.

### Decision

I introduced `LLDSession` as the practice context for a single problem and modeled the lifecycle as:

```text
Problem
   ↓
LLDSession
   ↓
Attempt
   ↓
Submission
   ↓
Evaluation
```

A learner can create multiple sessions for the same problem, and each session can contain multiple attempts. Each attempt has exactly one submission.

### Why

This better represents the actual practice workflow:

* A session represents the learner practicing a particular problem.
* An attempt represents one try.
* A submission represents the solution produced for that attempt.
* An evaluation represents the feedback generated for that submission.

This also made history and retry behavior natural without introducing a separate concept for "current" versus "historical" attempts.

---

## 2. Structured Submission Instead of a Generic Content Blob

### AI suggestion

A simpler submission model using a generic content field was considered, conceptually similar to:

```json
{
  "content": "..."
}
```

### Decision

I chose a guided, structured submission format:

```json
{
  "requirementsAndAssumptions": "...",
  "design": "...",
  "relationshipsAndInteractions": "...",
  "tradeoffsAndDesignDecisions": "...",
  "edgeCasesAndExtensibility": "..."
}
```

The first three sections are required, while the last two are optional.

### Why

The platform is intended specifically for LLD practice, so the structure should guide the learner toward the evidence that an evaluator needs.

This also avoids treating the entire answer as an opaque string. The application can perform simple deterministic checks such as:

```text
requirementsAndAssumptions is present
design is present
```

without trying to parse an arbitrary block of text.

More importantly, the domain can evolve to support additional submission formats later:

```text
Submission
├── TEXT
├── DIAGRAM
└── CODE
```

without fundamentally changing the attempt lifecycle.

---

## 3. Requirements and Reusable Evaluation Rubrics as Domain Concepts

### Requirements

#### AI suggestion

The initial problem model represented requirements simply as a collection of strings:

```text
requirements: String[]
```

### Decision

I modeled requirements as `ProblemRequirement` records with their own identity, description, ordering, and relationship to a problem.

### Why

A requirement is useful as an addressable domain concept rather than only as text.

This allows the system to associate deterministic signals and evaluation evidence with a specific requirement and gives requirements stable identities independent of their position in an array.

### Evaluation Rubrics

I also chose to model evaluation rubrics as reusable application-level concepts:

```text
Problem
   │
   └── ProblemEvaluationRubric
             │
             ▼
      EvaluationRubric
```

### Why

The evaluation dimensions are platform-level concepts rather than properties that belong exclusively to one problem.

For example, concepts such as modeling, relationships, trade-offs, and extensibility can be reused across Parking Lot, Vending Machine, Elevator System, and future problems.

The join model allows a problem to select the criteria it should be evaluated against while keeping the rubric definitions reusable.

---

## 4. Synchronous Evaluation Instead of Introducing a Queue

### AI suggestion

Production-oriented alternatives such as Redis-backed state, queues, and background workers were considered because LLM evaluation can be slow and external evaluation work is commonly handled asynchronously at scale.

### Decision

I intentionally kept evaluation synchronous for this MVP.

The submission flow is:

```text
POST /submission
       │
       ▼
┌────────────────────┐
│    Transaction     │
│                    │
│ Create Submission  │
│ Attempt →          │
│ EVALUATING         │
└─────────┬──────────┘
          │ committed
          ▼
   EvaluationService
          │
    ┌─────┴─────┐
    ▼           ▼
Deterministic   LLM
   Checks     Evaluator
    │           │
    └─────┬─────┘
          ▼
   EvaluationResult
          │
          ▼
┌──────────────────────┐
│ Persist Evaluation   │
│ Snapshot rubric      │
│ Calculate score      │
└──────────┬───────────┘
           │
           ▼
    Attempt → COMPLETED
```

The submission is durably persisted before evaluation starts.

### Why

The assignment calls for a focused MVP and does not require distributed infrastructure. Adding Redis and a queue would introduce operational complexity without being necessary for the current workload.

Evaluation being synchronous does not mean the learner's entire practice flow is blocked. HTTP requests are independent, so another attempt can be created while an earlier evaluation request is still running:

```text
Session
  │
  ├── Attempt #1
  │      ├── Submission
  │      └── EVALUATING ───────────┐
  │                                │
  └── Attempt #2                   │
         │                         │
         └── IN_PROGRESS           │
                                   │
                         Evaluation finishes
```

If evaluation volume or reliability requirements increase, the evaluation step can later be moved behind a durable queue and worker without changing the core practice domain.

---

## 5. Rubric Snapshotting for Historical Evaluations

### Decision

I chose to snapshot the rubric information used during an evaluation.

An `EvaluationCriterion` stores the criterion's:

* Name
* Description
* Weight
* Guidance

in addition to retaining the reference to the original rubric.

### Why

Evaluation rubrics can evolve over time.

For example, suppose the platform initially evaluates:

```text
Evaluation #1

Coupling & Cohesion
Weight at evaluation time: 15
Score: 12/15
```

Later, the platform changes the rubric:

```text
Evaluation #2

Coupling & Cohesion
Weight at evaluation time: 20
Score: 16/20
```

Without snapshotting, the first evaluation could become difficult to interpret because its historical score might be displayed against the new weight.

Snapshotting preserves the evaluation context that actually existed when the learner was evaluated.

This was a deliberate domain/data-model decision rather than an attempt to optimize the database structure prematurely.

---

## Additional Design Decisions

AI was also used to explore API and UI alternatives. Several proposed structures were deliberately reduced to keep the MVP focused.

For example, a more granular API proposal included separate endpoints for listing and retrieving attempts, updating submissions, submitting attempts, and retrieving evaluations.

I reduced this to the endpoints required by the actual workflow:

```text
GET  /api/problems
GET  /api/problems/:id

POST /api/lld-sessions
GET  /api/lld-sessions

POST /api/lld-sessions/:id/attempts

POST /api/attempts/:id/submission
```

The distinction between creating an attempt and submitting it was intentional. Starting an attempt does not immediately display a large submission form on the session page. The learner enters the editor only when they explicitly start an attempt, and the same active attempt can be resumed if the editor is closed before submission.

The session page also serves as the history and continuation surface, avoiding a separate workflow solely for reviewing previous attempts.

---

## Human Validation of AI-Assisted Work

AI-generated suggestions were treated as proposals rather than authoritative implementation decisions.

For architectural decisions, I evaluated:

* Whether the design directly supported the assignment requirements.
* Whether the abstraction represented a real domain concept.
* Whether the added complexity was justified for the MVP.
* Whether the design could accommodate the specified future changes.
* Whether failure and historical-data behavior were explicit.

Implementation suggestions were also validated by running the application and automated checks.

The final project currently passes:

```text
npm test
npx tsc --noEmit
npm run lint
npm run build
```

The resulting architecture reflects the final decisions made for the assignment rather than an unmodified AI-generated design.