import "dotenv/config";
import { PrismaClient, ProblemDifficulty } from "@prisma/client";

const prisma = new PrismaClient();

interface RequirementData {
  id: string;
  order: number;
  description: string;
}

interface ProblemData {
  title: string;
  difficulty: ProblemDifficulty;
  description: string;
  requirements: RequirementData[];
}

interface RubricData {
  name: string;
  weight: number;
  description: string;
}

const PROBLEMS: ProblemData[] = [
  {
    title: "Parking Lot",
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      "Design an object-oriented parking lot system that can manage vehicles entering, parking, and exiting a parking facility.\n\nThe system should model the parking lot, floors, parking spots, vehicles, parking tickets, and fee calculation while keeping responsibilities well separated.",
    requirements: [
      {
        id: "PARKING-REQ-001",
        order: 1,
        description: "The parking lot can have multiple floors.",
      },
      {
        id: "PARKING-REQ-002",
        order: 2,
        description: "Each floor can contain multiple parking spots.",
      },
      {
        id: "PARKING-REQ-003",
        order: 3,
        description: "The system should support different vehicle types.",
      },
      {
        id: "PARKING-REQ-004",
        order: 4,
        description:
          "Parking spots can have different types/capacities, and only compatible vehicles can use them.",
      },
      {
        id: "PARKING-REQ-005",
        order: 5,
        description:
          "A vehicle entering the parking lot should be assigned an appropriate available spot.",
      },
      {
        id: "PARKING-REQ-006",
        order: 6,
        description: "The system should track a vehicle's parking session/ticket.",
      },
      {
        id: "PARKING-REQ-007",
        order: 7,
        description:
          "A vehicle should be able to exit the parking lot, and its spot should become available again.",
      },
      {
        id: "PARKING-REQ-008",
        order: 8,
        description: "The system should calculate parking fees.",
      },
      {
        id: "PARKING-REQ-009",
        order: 9,
        description:
          "The design should allow new vehicle types, spot types, or pricing strategies to be added without major changes to existing classes.",
      },
    ],
  },
  {
    title: "Vending Machine",
    difficulty: ProblemDifficulty.EASY,
    description:
      "Design an object-oriented vending machine that manages product inventory, accepts payment, dispenses products, and handles transaction failures.\n\nThe design should clearly model the responsibilities involved in selecting a product, processing payment, dispensing an item, and returning/refunding money where appropriate.",
    requirements: [
      {
        id: "VENDING-REQ-001",
        order: 1,
        description: "The vending machine should maintain inventory for multiple products.",
      },
      {
        id: "VENDING-REQ-002",
        order: 2,
        description: "Each product should have a price and available quantity.",
      },
      {
        id: "VENDING-REQ-003",
        order: 3,
        description: "A customer should be able to select a product.",
      },
      {
        id: "VENDING-REQ-004",
        order: 4,
        description: "The machine should accept payment and track the amount inserted.",
      },
      {
        id: "VENDING-REQ-005",
        order: 5,
        description:
          "The machine should prevent dispensing when insufficient payment has been provided.",
      },
      {
        id: "VENDING-REQ-006",
        order: 6,
        description: "The machine should handle sold-out products.",
      },
      {
        id: "VENDING-REQ-007",
        order: 7,
        description: "The machine should dispense the selected product after a successful purchase.",
      },
      {
        id: "VENDING-REQ-008",
        order: 8,
        description: "Any applicable remaining balance should be returned to the customer.",
      },
      {
        id: "VENDING-REQ-009",
        order: 9,
        description:
          "The design should allow payment mechanisms or product types to be extended without heavily modifying the core vending machine logic.",
      },
    ],
  },
  {
    title: "Elevator System",
    difficulty: ProblemDifficulty.MEDIUM,
    description:
      "Design an object-oriented elevator system for a building with multiple floors and multiple elevators.\n\nThe system should model elevator requests, elevator movement/state, and the logic used to assign requests to appropriate elevators.",
    requirements: [
      {
        id: "ELEVATOR-REQ-001",
        order: 1,
        description: "The building can have multiple elevators and multiple floors.",
      },
      {
        id: "ELEVATOR-REQ-002",
        order: 2,
        description: "A user can request an elevator from a floor.",
      },
      {
        id: "ELEVATOR-REQ-003",
        order: 3,
        description: "A user inside an elevator can select a destination floor.",
      },
      {
        id: "ELEVATOR-REQ-004",
        order: 4,
        description: "The system should assign an appropriate elevator to an external request.",
      },
      {
        id: "ELEVATOR-REQ-005",
        order: 5,
        description: "An elevator should maintain its current floor and movement state.",
      },
      {
        id: "ELEVATOR-REQ-006",
        order: 6,
        description: "The system should handle upward and downward movement.",
      },
      {
        id: "ELEVATOR-REQ-007",
        order: 7,
        description: "The system should avoid assigning unavailable elevators to new requests.",
      },
      {
        id: "ELEVATOR-REQ-008",
        order: 8,
        description:
          "The design should separate elevator state/movement from request assignment logic.",
      },
      {
        id: "ELEVATOR-REQ-009",
        order: 9,
        description:
          "The elevator assignment strategy should be replaceable or extensible without heavily modifying the rest of the system.",
      },
    ],
  },
];

const RUBRICS: RubricData[] = [
  {
    name: "Requirement Understanding",
    weight: 15,
    description:
      "Evaluates how thoroughly and accurately the design addresses the stated domain requirements and operational constraints.",
  },
  {
    name: "Class Responsibilities",
    weight: 15,
    description:
      "Evaluates the appropriate separation and assignment of responsibilities across domain entities following the Single Responsibility Principle.",
  },
  {
    name: "Coupling & Cohesion",
    weight: 15,
    description:
      "Evaluates high internal cohesion within components and low, well-managed dependencies between distinct parts of the system.",
  },
  {
    name: "Encapsulation & Interfaces",
    weight: 15,
    description:
      "Evaluates data protection, state hiding, and the definition of clean, minimal public interfaces.",
  },
  {
    name: "Abstraction / Patterns",
    weight: 10,
    description:
      "Evaluates whether chosen abstractions, design patterns, and polymorphic structures are justified, fit for purpose, and avoid unnecessary complexity.",
  },
  {
    name: "Extensibility",
    weight: 15,
    description:
      "Evaluates how easily new entity types, rules, or behavioral strategies can be introduced without modifying existing classes (Open/Closed Principle).",
  },
  {
    name: "Edge Cases & Testability",
    weight: 10,
    description:
      "Evaluates consideration of boundary conditions, failure scenarios, invalid operations, and overall design testability.",
  },
  {
    name: "Quality of Explanation",
    weight: 5,
    description:
      "Evaluates the clarity, organization, and rationale provided for key design decisions and trade-offs.",
  },
];

const PROBLEM_GUIDANCE: Record<string, Record<string, string>> = {
  "Parking Lot": {
    "Requirement Understanding":
      "Evaluate how well vehicle-to-spot compatibility, spot allocation, ticket lifecycle tracking, and fee calculation are handled.",
    "Class Responsibilities":
      "Evaluate separation of responsibilities among ParkingLot, Floor, ParkingSpot, Vehicle, ParkingTicket, and pricing calculation components.",
    "Coupling & Cohesion":
      "Check that spot allocation and fee calculation logic are not tightly coupled to the central parking lot coordinator.",
    "Encapsulation & Interfaces":
      "Verify encapsulation of spot availability, vehicle compatibility, and ticket state through well-defined public operations.",
    "Abstraction / Patterns":
      "Assess whether abstractions such as pricing strategies or spot allocation algorithms are appropriately applied without over-engineering.",
    "Extensibility":
      "Assess the ability to introduce new vehicle types, spot types, or pricing strategies without modifying core domain classes.",
    "Edge Cases & Testability":
      "Examine handling of a full parking lot, incompatible spot assignments, duplicate or invalid ticket exits, and boundary time fee calculations.",
    "Quality of Explanation":
      "Review clarity of design decisions, trade-offs (e.g., lookup performance vs. memory), and structural explanations.",
  },
  "Vending Machine": {
    "Requirement Understanding":
      "Evaluate how well inventory management, product selection, payment acceptance, dispensing, and refund/change return are handled.",
    "Class Responsibilities":
      "Evaluate separation of responsibilities among VendingMachine, Inventory, Product, PaymentProcessor, and Transaction state.",
    "Coupling & Cohesion":
      "Ensure transaction logic, payment handling, and inventory tracking are cohesive and not bundled into a monolithic class.",
    "Encapsulation & Interfaces":
      "Verify proper encapsulation of inventory quantities, inserted money, and safe state transition interfaces.",
    "Abstraction / Patterns":
      "Assess whether state-dependent behavior (e.g., State pattern for idle, accepting money, dispensing) or payment abstractions are justified.",
    "Extensibility":
      "Assess the ability to add new payment mechanisms or product types without heavily modifying core vending machine logic.",
    "Edge Cases & Testability":
      "Examine handling of sold-out products, insufficient payment, invalid selection, cancellation/refund mid-transaction, and exact change shortages.",
    "Quality of Explanation":
      "Review clarity of state transitions, rationale behind chosen abstractions, and discussion of design trade-offs.",
  },
  "Elevator System": {
    "Requirement Understanding":
      "Evaluate modeling of floors, elevators, external dispatch requests, internal destination selections, elevator movement, and assignment.",
    "Class Responsibilities":
      "Evaluate separation of concerns between Elevator car state/movement, Request representation, and request assignment/dispatching logic.",
    "Coupling & Cohesion":
      "Ensure request dispatching algorithms are decoupled from elevator movement, floor tracking, and door mechanics.",
    "Encapsulation & Interfaces":
      "Verify proper encapsulation of elevator car state (current floor, direction, status) and clean dispatching interfaces.",
    "Abstraction / Patterns":
      "Assess whether elevator assignment strategies (e.g., proximity, direction, SCAN/LOOK) are modular and replaceable.",
    "Extensibility":
      "Assess the ability to swap or extend elevator dispatching strategies without rewriting elevator movement or car behavior.",
    "Edge Cases & Testability":
      "Examine handling of out-of-service elevators, simultaneous conflicting requests from multiple floors, boundary floor limits, and idle state.",
    "Quality of Explanation":
      "Review clarity of dispatching rationale, concurrency considerations, design trade-offs, and state management explanation.",
  },
};

export async function seed() {
  console.log("Starting database seed...");

  // 1. Seed Evaluation Rubrics
  console.log("Seeding Evaluation Rubrics...");
  const rubricRecords = new Map<string, { id: string; name: string }>();

  for (const rubric of RUBRICS) {
    const record = await prisma.evaluationRubric.upsert({
      where: { name: rubric.name },
      update: {
        description: rubric.description,
        weight: rubric.weight,
      },
      create: {
        name: rubric.name,
        description: rubric.description,
        weight: rubric.weight,
      },
    });
    rubricRecords.set(record.name, record);
    console.log(`  ✓ Rubric: ${record.name} (weight: ${record.weight})`);
  }

  // 2. Seed Problems & Requirements
  console.log("Seeding Problems and Requirements...");
  for (const problemData of PROBLEMS) {
    // Check if problem already exists by title
    let problem = await prisma.problem.findFirst({
      where: { title: problemData.title },
    });

    if (problem) {
      problem = await prisma.problem.update({
        where: { id: problem.id },
        data: {
          description: problemData.description,
          difficulty: problemData.difficulty,
        },
      });
      console.log(`  ✓ Updated Problem: ${problem.title} (${problem.difficulty})`);
    } else {
      problem = await prisma.problem.create({
        data: {
          title: problemData.title,
          description: problemData.description,
          difficulty: problemData.difficulty,
        },
      });
      console.log(`  ✓ Created Problem: ${problem.title} (${problem.difficulty})`);
    }

    // Upsert requirements with stable IDs
    for (const req of problemData.requirements) {
      await prisma.problemRequirement.upsert({
        where: { id: req.id },
        update: {
          order: req.order,
          description: req.description,
          problemId: problem.id,
        },
        create: {
          id: req.id,
          order: req.order,
          description: req.description,
          problemId: problem.id,
        },
      });
      console.log(`    ✓ Requirement: ${req.id} (#${req.order})`);
    }

    // Upsert ProblemEvaluationRubric associations
    const guidanceMap = PROBLEM_GUIDANCE[problemData.title];
    for (const rubric of RUBRICS) {
      const rubricRecord = rubricRecords.get(rubric.name);
      if (!rubricRecord) {
        throw new Error(`Rubric record not found for: ${rubric.name}`);
      }
      const guidance = guidanceMap?.[rubric.name] ?? null;

      await prisma.problemEvaluationRubric.upsert({
        where: {
          problemId_rubricId: {
            problemId: problem.id,
            rubricId: rubricRecord.id,
          },
        },
        update: {
          guidance,
        },
        create: {
          problemId: problem.id,
          rubricId: rubricRecord.id,
          guidance,
        },
      });
    }
    console.log(`    ✓ Associated 8 rubrics with problem-specific guidance`);
  }

  console.log("Database seed completed successfully.");
}

async function main() {
  try {
    await seed();
  } catch (error) {
    console.error("Error during database seed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (process.argv[1]?.includes("seed")) {
  main();
}
