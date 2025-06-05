# Production Staging Steps

Here are the steps to stage your application for production:

## 1. Pre-deployment Checklist:

*   **Environment Configuration:**
    *   Ensure all environment variables for production (e.g., database URLs, API keys, secret keys) are correctly set up on your Tencent Lighthouse server.
        *   For the backend, this involves setting environment variables accessible by the Python application (e.g., via a `.env` file or systemd service configuration). Key variables include:
            *   `DATABASE_URL`: `mongodb://app_user:app_password@111.230.109.143:27017/losmax?authSource=admin`
            *   `JWT_SECRET_KEY`: `1QYMNItvoU1yZpfSTsBs3CYjIzuQJKNoyjwGhDo/Fsa81mS/mTQx0Z+HNGsq2h6q`
        *   For the frontend, ensure `frontend/src/services/api.ts` is configured to point to your production backend API endpoint (e.g., `http://111.230.109.143:8000` if running on port 8000).
*   **Server Setup (OpenCloudOS Server 9):**
    *   Install Python and pip if not already present: `sudo dnf install python3 python3-pip`
    *   `pm2` and `Nginx` are assumed to be pre-installed based on your feedback.
*   **Dependencies:**
    *   Ensure all backend dependencies are listed in `backend/requirements.txt` and frontend dependencies in `frontend/package.json`.
    *   Install production dependencies:
        *   Backend: `pip install -r backend/requirements.txt`
        *   Frontend: `npm install --production` (or `yarn install --production`)
*   **Security:**
    *   Review `backend/middleware/cors.py` to ensure CORS policies are appropriate for your production domain(s).
    *   Ensure all sensitive information (e.g., database credentials, API keys) is stored securely and not hardcoded.
*   **Database Migrations:**
    *   Apply any pending database migrations to your production database. (Assuming you are using a database that requires migrations, e.g., SQLAlchemy with Alembic).
*   **Testing:**
    *   Perform a final round of testing on a staging environment that closely mirrors production.

## 2. Backend Deployment:

*   **Build/Package:**
    *   If your backend requires building (e.g., compiling assets, though Python typically doesn't), perform that step.
    *   Consider packaging your application (e.g., Docker image) for consistent deployment.
*   **Execution:**
    *   Navigate to the backend directory on the server: `cd /root/LOSMAX/backend`
    *   Install backend dependencies: `pip install -r requirements.txt`
    *   Start the backend application using a production-ready WSGI server (e.g., Gunicorn or Uvicorn) and manage it with `pm2` or `systemd`.
        *   Example with Gunicorn and pm2: `pm2 start "gunicorn main:app --workers 4 --bind 0.0.0.0:8000" --name losmax-backend`
        *   Ensure `main:app` points to your FastAPI application instance.
    *   Configure Nginx as a reverse proxy for the backend (e.g., proxying requests from port 80 to port 8000).
*   **Logging & Monitoring:**
    *   Set up robust logging and monitoring for your backend application to track performance and errors.

## 3. Frontend Deployment:

*   **Build:**
    *   Build the frontend application for production. This typically involves:
        *   `cd frontend`
        *   `npm run build` (or `yarn build`)
    *   This command will create an optimized, minified build of your React application, usually in a `frontend/dist` or `frontend/build` directory.
*   **Deployment:**
    *   After running `npm run build` in the `frontend` directory, copy the contents of the `frontend/dist` (or `frontend/build`) directory to your Nginx web root (e.g., `/usr/share/nginx/html` or a custom path).
    *   Configure Nginx to serve these static files.
*   **Caching:**
    *   Implement appropriate caching strategies for static assets to improve load times.

## 4. Post-deployment Verification:

*   **Health Checks:**
    *   Verify that both the frontend and backend services are running and accessible.
    *   Check application logs for any immediate errors or warnings.
*   **Functionality Testing:**
    *   Perform a quick smoke test of key application features (e.g., user login, goal creation, task management) to ensure everything is working as expected in the production environment.
*   **Performance Monitoring:**
    *   Monitor application performance and resource utilization.

## How to use .env files:

*   **For local development:** Ensure the `APP_ENV` environment variable is not set to `production` (or is set to `development`). When you run your backend locally, it will pick up settings from `backend/.env.development`. When you run your frontend locally, it will pick up settings from `frontend/.env.development`.
*   **For production deployment:** On your Tencent Lighthouse server, you will need to set the `APP_ENV` environment variable to `production` before starting your backend application. For example, when using `pm2`, you might configure it like this:
    ```bash
    APP_ENV=production pm2 start "gunicorn main:app --workers 4 --bind 0.0.0.0:8000" --name losmax-backend
    ```
    The frontend build process (`npm run build` in the `frontend` directory) will automatically use `frontend/.env.production` when building for production.