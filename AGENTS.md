# AGENTS.md

Purpose: Fast, low-token project context for AI agents.
Scope: Entire workspace.
Last updated: 2026-03-28

## 1) Project Snapshot
- Name: Family Hub (graduation project)
- Goal: Family management app (auth, tasks, points/rewards, inventory/meal/grocery/location flows)
- Time horizon for upcoming work: about 3 months
- Planned new modules: Budgeting, Planning

## 2) Monorepo Structure
- backend/: Node.js + Express + MongoDB (Mongoose) REST API
- flutter_app/: Main client (Flutter mobile/desktop/web)
- React_frontend/: Secondary web client (in development)

## 3) Primary Runtime
- Main backend entry: backend/server.js
- Express app setup: backend/app.js
- Main client currently active in development: flutter_app/

## 4) Local Run Commands
- Backend dev: cd backend && npm run dev
- Backend prod: cd backend && npm start
- Flutter app: cd flutter_app && flutter run
- Flutter on Windows: cd flutter_app && flutter run -d windows
- Flutter on Chrome: cd flutter_app && flutter run -d chrome
- React frontend: cd React_frontend && npm start

## 5) Existing VS Code Tasks (known)
- Backend: Start Dev Server (nodemon)
- Backend: Start Production Server
- Backend: Install Dependencies
- Flutter: Run App
- Flutter: Run on Chrome (Web)
- Flutter: Run on Windows
- Flutter: Get Dependencies
- Flutter: Clean & Rebuild
- React: Start Dev Server
- React: Install Dependencies
- Start All (Backend + Flutter)

## 6) Backend Architecture Pattern
- Route files in backend/routes map HTTP endpoints to controllers
- Controllers in backend/controllers implement request logic
- Models in backend/models define Mongoose schemas
- Utilities are in backend/Utils

Typical flow:
1. Route receives request
2. Controller validates/parses input
3. Model query/update
4. Controller returns JSON response

## 7) Key Backend Domains (from current files)
- Auth
- Family Account
- Member / Member Type
- Task / Task Category / Task History
- Point Wallet / Point History / Redeem / Wishlist
- Grocery / Inventory / Inventory Alerts / Inventory Category
- Meal / Meal Suggestion / Recipe / Receipt / Leftover
- Location / Location Share / Location Alerts
- Units / Categories

## 8) Flutter App Notes
- App code under flutter_app/lib
- Screens/pages under flutter_app/lib/pages
- Shared/domain code appears under flutter_app/lib/core (features, models, routing, services, styling, widgets)
- Current user open file previously: flutter_app/lib/pages/inventory_screen.dart

## 9) AI Integration Direction (recommended for 3-month cap)
Use hybrid approach:
- Rules first (deterministic constraints)
- User-history retrieval (recent weeks)
- LLM only for explanation/suggestion wording and ranking support

Do NOT train custom large models in this timeline.

### Budgeting AI MVP
- Expense categorization
- Weekly budget suggestions
- Overspending alerts
- Explainable saving tips

### Planning AI MVP
- Meal suggestions from inventory + leftovers + preferences + budget
- Shopping list suggestions
- Task/time planning suggestions

## 10) Data Needed for AI Quality
- Timestamps on transactions/actions
- Family member roles and preferences
- Historical completion/outcome data
- Feedback signals per suggestion (helpful/not helpful)

## 11) Suggested API Contract Style for New AI Endpoints
Prefix all new endpoints under /api/v1/ai

Examples:
- POST /api/v1/ai/budget/weekly-plan
- POST /api/v1/ai/budget/anomaly-check
- POST /api/v1/ai/planning/meal-plan
- POST /api/v1/ai/planning/week-schedule
- POST /api/v1/ai/feedback

Response envelope pattern (recommended):
- success: boolean
- data: object
- meta: object (confidence, version, generatedAt)
- message: optional string

## 12) Constraints and Guardrails
- Privacy first: send minimal required data to external AI providers
- Never expose secrets from .env
- Keep outputs explainable and actionable
- Enforce business rules server-side before returning AI suggestions
- Cache expensive suggestion calls when possible

## 13) Agent Workflow Guidance
When making changes:
1. Prefer minimal diffs
2. Update controller + route + model consistently
3. Keep naming consistent with existing module style
4. Add or update docs when adding endpoints
5. If adding AI logic, isolate provider-specific code behind a service layer

## 14) Definition of Done for AI Features
- Endpoint implemented and callable
- Validation + error handling included
- Basic logging/metrics included
- UI renders suggestion and supports feedback capture
- Manual test path documented

## 15) Fast Onboarding Checklist for Any Agent
1. Read this file first
2. Read root README.md second
3. Inspect target module route/controller/model trio
4. Verify existing task command for runtime
5. Implement smallest safe change

## 16) Maintenance Rule
Keep this file concise.
If a section grows too large, summarize and link to detailed docs.
