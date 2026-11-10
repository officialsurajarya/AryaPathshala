# MASTER PROMPT — COMPLETE ARYA PATHSHALA FULL-STACK WEBSITE

## 1. Project Objective

Act as a senior full-stack software engineer, backend architect, database designer, UI/UX developer, security engineer, and deployment specialist.

My project is **Arya Pathshala**. I already have an existing codebase with some frontend work completed. Your task is to finish the remaining frontend, develop the complete backend and database, integrate everything, test the entire application, and prepare it for production deployment on Hostinger.

**This is an existing project, not a new project.** Do not blindly recreate the application or replace working features. First inspect the repository and identify exactly what is complete, incomplete, broken, or missing.

## 2. Technology Stack

Use the following stack unless the existing project has a necessary compatible implementation that should be preserved.

### Frontend
- React.js
- Vite
- JavaScript or TypeScript, following the existing project
- Bootstrap 5 for responsive styling
- React Icons for icons
- React Router for navigation
- Axios or a centralized API client for backend requests

### Backend
- Node.js
- Express.js
- REST API architecture
- Prisma ORM
- MySQL or MariaDB database compatible with Hostinger
- Secure authentication using established libraries
- Environment variables for configuration

### Hosting
- Hostinger for production deployment
- Hostinger MySQL/MariaDB for the database
- GitHub for version control and deployment workflow
- Configure frontend and backend according to the capabilities of my actual Hostinger hosting plan.

**Important:** Do not use MongoDB. Do not introduce an unrelated database or replace the existing React/Vite frontend without a compelling technical reason.

## 3. Phase One — Audit the Existing Project

Before writing code, inspect the entire project.

1. Examine the folder structure, package.json files, routes, components, assets, styles, configuration, and existing documentation.
2. Identify every existing frontend page and feature.
3. Determine which pages are complete, partially implemented, missing, or non-functional.
4. Identify placeholder content, dead buttons, non-working forms, mock data, hardcoded arrays, and incomplete integrations.
5. Check whether a backend already exists. Extend it if possible rather than creating a conflicting second backend.
6. Inspect the existing authentication flow, API configuration, database code, and deployment setup.
7. Identify dependencies, build errors, runtime errors, broken imports, and inconsistent styling.
8. Create a checklist of remaining work and prioritize it.

Preserve the current branding, logo, content, reusable components, and working functionality.

Do not delete existing files, overwrite working modules, or perform destructive database operations without a clear technical reason.

If the repository is inaccessible, stop and request the project files or access needed. Never pretend to have inspected code that you cannot access.

## 4. Phase Two — Complete the Remaining Frontend

Finish every incomplete or missing frontend feature discovered during the audit.

Requirements:

- Complete all existing pages and navigation.
- Create any missing pages required by the existing project.
- Make layouts responsive across mobile phones, tablets, laptops, and desktops.
- Maintain consistent typography, spacing, colors, buttons, forms, cards, and navigation.
- Implement proper loading indicators, empty states, error messages, and success notifications.
- Add client-side validation while enforcing security-critical validation on the server.
- Remove unnecessary duplicate components and styles.
- Ensure every button, link, menu, form, and interactive element performs its intended action.
- Integrate real backend APIs instead of relying on fake data or local-only functionality.
- Add appropriate error handling when the backend or network is unavailable.
- Avoid unnecessary animations, excessive gradients, clutter, and unrelated redesigns.
- Use accessible HTML, semantic elements, labels, and keyboard-friendly interactions.
- Include appropriate page titles, meta descriptions, and SEO essentials where relevant.

Do not assume which features are missing. Determine that from the existing codebase and implement the required work.

## 5. Phase Three — Develop the Complete Backend

Create or complete a properly structured Express backend.

Use a maintainable architecture such as:

backend/
  src/
    app.js
    server.js
    routes/
    controllers/
    services/
    middleware/
    validators/
    utils/
  prisma/
    schema.prisma
    migrations/
  tests/
  package.json
  .env.example

Adapt this structure to the current repository instead of duplicating an existing architecture unnecessarily.

### Backend requirements

- Centralized Express application and server configuration.
- RESTful API routes with consistent request and response formats.
- Controllers and services separated where appropriate.
- Input validation and sanitization.
- Centralized error-handling middleware.
- Authentication and authorization middleware.
- Secure password hashing.
- Role-based access control wherever the application requires different user permissions.
- Pagination, filtering, sorting, and search for applicable data lists.
- Correct HTTP status codes.
- Request logging without exposing passwords, tokens, or sensitive information.
- API health-check endpoint.
- CORS configured for the actual production frontend domain.
- Rate limiting and other appropriate protections for sensitive endpoints.
- Secure handling of uploaded files if uploads are part of the existing application.
- Database transactions for operations that must succeed or fail together.
- No hardcoded credentials, secret keys, production passwords, or private tokens.

Build APIs for the actual features found in the existing frontend. Do not create unrelated endpoints just to make the backend appear complete.

## 6. Phase Four — Build the Complete MySQL Database

Use MySQL/MariaDB with Prisma ORM.

### Database requirements

1. Inspect the existing application to determine the actual entities and relationships.
2. Design normalized tables with appropriate primary keys, foreign keys, unique constraints, indexes, and timestamps.
3. Define clear relationships and deletion/update behavior.
4. Use suitable data types and enforce important constraints at the database level.
5. Store passwords only as secure hashes.
6. Avoid duplicate records and inconsistent relationships.
7. Use migrations to track schema changes.
8. Provide seed scripts only for legitimate development or initial setup data.
9. Add pagination and indexed queries where needed for performance.
10. Handle transactions, uniqueness conflicts, and database errors correctly.

Create the Prisma schema based on the actual application requirements, not assumptions about features that may not exist.

Provide:
- Prisma schema.
- Initial migration and subsequent schema migrations.
- Database setup instructions.
- Development seed script, if required.
- Example environment configuration.
- Instructions for connecting to Hostinger MySQL/MariaDB.
- Backup and restore instructions.

Do not automatically drop, reset, or erase a production database. Inspect existing data and migrations before making changes.

## 7. Phase Five — Authentication and Permissions

First determine which authentication features the existing project needs.

If user accounts are part of the application, implement the relevant features:

- Registration.
- Login and logout.
- Secure password hashing.
- Password reset, if required.
- Email or OTP verification, if required.
- Session or token management using a secure, appropriate approach.
- Protected frontend routes.
- Protected backend endpoints.
- Role-based permissions for administrative functionality.
- Account validation and appropriate authentication error handling.

Use secure cookie settings where cookie-based authentication is chosen. If tokens are used, implement storage, expiration, refresh, and revocation safely.

Never trust a role, user ID, or permission supplied by the frontend. Verify authorization on the server for every protected operation.

Do not add unnecessary authentication features or external services without checking whether they are required and configured.

## 8. Phase Six — Frontend and Backend Integration

Connect the completed frontend to the backend.

- Create a centralized API service.
- Use environment-based API URLs.
- Replace mock data with real database-backed API requests.
- Implement create, read, update, and delete operations wherever the application requires them.
- Connect forms to the correct API endpoints.
- Display real records returned by the database.
- Handle loading, validation, authorization, network, and server errors.
- Keep the frontend and database consistent after updates.
- Prevent duplicate submissions where appropriate.
- Verify that protected pages and APIs remain protected after refresh and direct URL access.

Every feature must work end to end, from the user interface to the API and database, and back.

## 9. Phase Seven — Hostinger Production Deployment

Before choosing a deployment architecture, inspect the actual Hostinger plan and available features.

Verify:
- Whether Node.js applications are supported.
- Available Node.js versions and application startup configuration.
- MySQL/MariaDB database creation and connection settings.
- Whether SSH access and command-line tools are available.
- Whether Prisma migrations can run in the production environment.
- How environment variables and domain routing are configured.
- Whether the frontend can be deployed as static files.
- Whether the backend requires a separate subdomain or application route.

Do not assume that every Hostinger shared hosting plan supports a continuously running Express server.

Prepare the appropriate deployment plan based on verified capabilities. If the current plan cannot run the required backend, explain the exact limitation and propose the smallest compatible change.

Deployment requirements:

1. Build the frontend for production.
2. Configure the production API URL.
3. Configure the Express application to start correctly.
4. Connect to the production MySQL database using the supplied Hostinger connection details.
5. Run safe production migrations.
6. Configure environment variables securely.
7. Configure HTTPS, CORS, cookies, and domain settings as required.
8. Add health checks and basic operational logging.
9. Document deployment, rollback, backup, and restoration procedures.
10. Test the deployed website and APIs.

Never expose database credentials or environment files in GitHub, frontend bundles, public logs, or browser code.

## 10. Phase Eight — Testing and Quality Assurance

Do not stop after generating code.

Run the available checks and fix the problems they reveal.

### Frontend checks
- Install dependencies.
- Run linting and type checks if configured.
- Run the production build.
- Check routing and direct page refreshes.
- Test forms and validation.
- Test responsive layouts.
- Check API integration and error states.

### Backend checks
- Install dependencies.
- Validate the Prisma schema.
- Run migrations against a safe development database.
- Run unit and integration tests where available.
- Test authentication and authorization.
- Test CRUD operations.
- Test invalid input and duplicate records.
- Test database failure and server error handling.
- Check that secrets are not exposed.

### End-to-end checks
- Verify complete user workflows.
- Confirm that created and updated records persist after refresh.
- Confirm that unauthorized users cannot access protected resources.
- Check frontend/backend compatibility.
- Verify the production build and deployment configuration.

Do not claim that a test passed unless you actually ran it and checked its result.

## 11. Development Rules

Follow these rules throughout the project:

- Work directly in the existing project.
- Inspect before modifying.
- Make incremental, focused changes.
- Reuse existing components and dependencies where appropriate.
- Keep the application architecture maintainable.
- Avoid unnecessary packages and duplicate implementations.
- Do not leave important features as TODOs or placeholder responses.
- Do not hardcode database records to simulate a working application.
- Never expose secrets or request that I paste private credentials into source code.
- Provide `.env.example` files with placeholder values only.
- Preserve existing Git history and unrelated files.
- Do not commit secrets or production database exports.
- Explain any required configuration that I must complete manually.
- Ask for clarification only when a genuinely necessary requirement or credential-free configuration detail is missing.

If a feature requires an external service, identify the service, implement the integration safely, and clearly state what configuration is still required.

## 12. Required Final Deliverables

When development is complete, provide:

1. A summary of the existing project audit.
2. A list of completed and remaining frontend features.
3. The final backend structure and implemented APIs.
4. The Prisma schema and database migrations.
5. The database tables and relationships.
6. Authentication and authorization details.
7. Frontend/backend integration details.
8. Environment variable documentation.
9. Local development setup instructions.
10. Hostinger-specific deployment instructions.
11. Test results, including any tests that could not be run.
12. Known limitations and external configuration still required.
13. A concise list of changed and newly created files.

## 13. Execution Instructions

Start by auditing the repository and producing a prioritized implementation checklist.

Then proceed through the frontend, backend, database, integration, testing, and deployment phases.

Do not stop after providing a plan. Begin implementing the first phase immediately, then continue with the next phases whenever the required files and environment are available.

If a blocking issue arises, explain the exact issue and request only the minimum information needed to proceed.

**Final objective:** Deliver a complete, secure, responsive, database-driven Arya Pathshala website, built on the existing codebase, with all required frontend features functional, a fully integrated backend, a properly designed MySQL/MariaDB database, and a verified deployment path for Hostinger.