# Integration Plan for New Goal-Setting Features

This document outlines the step-by-step plan for integrating the interactive SMARTER goal-setting workflow and the AI-powered goal breakdown mechanism into the application.

## Phase 1: Backend Implementation

1.  **Extend the `Goal` Model:**
    *   Add the following fields to the `Goal` model in `backend/models/goal.py`:
        *   `evaluation_frequency`: (string, nullable)
        *   `readjustment_acknowledged`: (boolean, default: false)
    *   Update the database schema to reflect these changes.

2.  **Implement the AI Goal Breakdown Endpoint:**
    *   Create a new route, `POST /goals/breakdown`, in `backend/routes/goals.py`.
    *   Implement a new service function in `backend/services/goal_service.py` to handle the logic of calling the AI service.
    *   Integrate with an AI service client library (e.g., `openai`).
    *   Add error handling for the AI service integration.

## Phase 2: Frontend Implementation

1.  **Create the SMARTER Goal-Setting Wizard:**
    *   Create a new component, `SmarterGoalDialog`, that implements the multi-step wizard described in `smarter_goal_workflow.md`.
    *   This component will replace the existing `GoalDialog` for creating new goals.
    *   The `GoalDialog` will still be used for editing existing goals.

2.  **Integrate the AI Goal Breakdown Feature:**
    *   Add a "Break Down with AI" button to the `GoalCard` component.
    *   When this button is clicked, the frontend will call the new `/goals/breakdown` endpoint.
    *   Create a new component, `GoalBreakdownDialog`, to display the suggested weekly goals and daily tasks.
    *   Implement the logic to create new goals and tasks based on the user's selection.

## Phase 3: Testing and Deployment

1.  **Unit and Integration Testing:**
    *   Write unit tests for the new backend and frontend components.
    *   Perform end-to-end integration testing to ensure that the new features work as expected.

2.  **Deployment:**
    *   Deploy the backend and frontend changes to the production environment.

## Timeline

This project is estimated to take **3-4 weeks** to complete, with the following breakdown:

*   **Phase 1 (Backend):** 1 week
*   **Phase 2 (Frontend):** 2 weeks
*   **Phase 3 (Testing & Deployment):** 1 week