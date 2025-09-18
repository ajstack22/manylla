# The Adversarial Workflow

## Objective

To provide a step-by-step, quality-gated workflow for moving a piece of work from conception to completion. This process ensures that every change meets the Atlas framework's standards before it is merged, preventing defects and maintaining a high-quality codebase.

## Workflow Stages

1.  **Prioritization (PM)**
    -   **Action**: The Product Manager (PM) selects a work item (story, bug fix) from the top of the backlog.
    -   **Exit Criteria**: A work item is chosen and ready for validation.

2.  **Requirement Validation (PM)**
    -   **Action**: The PM reviews the work item to ensure its requirements are clear, complete, and have testable acceptance criteria.
    -   **Exit Criteria**: The work item is deemed ready for implementation.

3.  **Implementation (Developer)**
    -   **Action**: The work item is assigned to a Developer, who implements the required changes according to the framework's standards.
    -   **Exit Criteria**: The Developer has completed the implementation and is ready for self-validation.

4.  **Self-Validation (Developer)**
    -   **Action**: The Developer runs all local validation checks (lint, tests, build) and gathers evidence of completion (screenshots, command outputs).
    -   **Exit Criteria**: The work is ready for review, and a pull request is created with all required evidence.

5.  **Adversarial Review (Peer Reviewer)**
    -   **Action**: The work is assigned to a Peer Reviewer, who executes the formal Adversarial Protocol, attempting to find any and all flaws.
    -   **Exit Criteria**: The Peer Reviewer issues a clear verdict: `REJECTED` or `PASS`.

6.  **The Loop (Decision Point)**
    -   **If REJECTED**: The work goes back to the **Implementation** stage (Step 3). The Developer must address all issues raised by the reviewer.
    -   **If PASSED**: The work proceeds to the Integration stage.

7.  **Integration (DevOps Admin / PM)**
    -   **Action**: The code is merged into the main branch by an authorized party.
    -   **Exit Criteria**: The change is successfully integrated into the codebase.

8.  **Deployment (DevOps Admin / PM)**
    -   **Action**: The integrated changes are deployed to the appropriate environment (staging, production) following the documented deployment process.
    -   **Exit Criteria**: The change is live and verified in the target environment.

## Key Principles of the Workflow

-   **No Skipped Steps**: Every stage is mandatory.
-   **Quality Gates, Not Suggestions**: The validation and review stages are hard gates. Failure stops the process.
-   **Clear Handoffs**: Each stage has a clear owner and clear entry/exit criteria, reducing ambiguity.
-   **Accountability**: The process makes it clear who is responsible for the work at each stage.
