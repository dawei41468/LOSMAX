# Adjusted Granular Step-by-Step Plan for LOSMAX MVP

## Phase 1: Project Setup

1. **Create project directory structure**  
   - Create `LOSMAX` directory  
   - Inside `LOSMAX`, create subdirectories: `backend`, `frontend`, `docs`, `certs`  
   - Create `.gitignore` with common Python and Node.js exclusions  
   - Create `LICENSE` with a standard open-source license (e.g., MIT)  
   - Create `README.md` with a basic project description  

2. **Set up backend environment**  
   - Navigate to `backend` directory  
   - Create a Python virtual environment: `python3 -m venv venv`  
   - Activate the virtual environment: `source venv/bin/activate`  
   - Install dependencies: `pip install fastapi uvicorn motor python-dotenv passlib[bcrypt] pyjwt`  
   - Create `main.py` with a simple FastAPI app returning `{"Hello": "World"}` at `/`  
   - Run the server: `uvicorn main:app --reload`  
   - Test the endpoint with a browser or curl at `http://127.0.0.1:8000/`  

3. **Set up frontend environment**  
   - Navigate to `frontend` directory  
   - Initialize a Vite project: `npm create vite@latest . -- --template react-ts`  
   - Install dependencies: `npm install`  
   - Run the development server: `npm run dev`  
   - Verify the default Vite app loads in the browser at `http://localhost:5173`  

## Phase 2: Authentication

4. **Configure backend settings**  
   - Create `config` directory in `backend`  
   - Create `settings.py` to load environment variables using `python-dotenv`  
   - Create `.env` with `MONGODB_URL=mongodb://localhost:27017/losmax` and `SECRET_KEY=your-secret-key`  
   - Create `.env.development` and `.env.production` with similar variables  
   - Test by loading and printing a variable in `main.py`  

5. **Set up database connection in backend**  
   - Create `database.py` in `backend`  
   - Import `motor.motor_asyncio` and settings from `config.settings`  
   - Create an async MongoDB client using `MONGODB_URL`  
   - Test the connection by connecting and printing a success message in `main.py`  

6. **Implement user model in backend**  
   - Create `models` directory in `backend`  
   - Create `user.py` with Pydantic models: `UserCreate` (email, password), `UserInDB` (email, hashed_password)  
   - Test the model by creating a sample instance and validating it in `main.py`  

7. **Implement authentication service in backend**  
   - Create `services` directory in `backend`  
   - Create `auth_service.py` with functions:  
     - Hash a password using `passlib`  
     - Generate a JWT token using `pyjwt`  
   - Test the functions by calling them with sample data in `main.py`  

8. **Update User model for refresh tokens**
    - Add `refresh_tokens` array field to User model
    - Add methods to manage refresh tokens (add, revoke, verify)
    - Ensure refresh tokens are hashed before storage
    - Add token expiration tracking

9. **Extend auth service for refresh tokens**
    - Add methods to generate both access and refresh tokens
    - Implement token rotation logic
    - Add validation for refresh tokens
    - Implement automatic revocation of old refresh tokens

10. **Implement authentication routes in backend**
    - Create `routes` directory with `auth.py`
    - Define POST endpoints:
      - `/register` - User registration
      - `/login` - Returns access + refresh tokens
      - `/refresh` - Exchanges refresh token for new access token
      - `/logout` - Revokes refresh tokens
    - Implement route handlers using auth service
    - Test full token lifecycle with curl/Postman

11. **Set up CORS and CSRF middleware in backend**
   - Create `middleware` directory with `cors.py`  
   - In `cors.py`, configure CORS to allow `http://localhost:5173`  
   - Add CORS middleware to `main.py`  
   - Test by making a cross-origin request from a browser console  

12. **Implement frontend authentication pages**
    - In `frontend/src/pages`, create `AuthPage.tsx`
    - Add a simple login form with email and password fields
    - Add a registration form with email and password fields
    - Test by running the frontend and verifying the forms render

13. **Implement API client in frontend**
    - In `frontend/src/services`, create `api.ts`  
    - Add functions to make POST requests to `/register` and `/login` using `fetch`  
    - Test by calling the functions from the console and checking responses  

14. **Handle authentication state in frontend**
    - In `frontend/src`, create `contexts/AuthContext.tsx`  
    - Use React Context to manage login state (e.g., `isAuthenticated`, `user`)  
    - Update state on successful login from `AuthPage.tsx`  
    - Test by logging in and checking the context state  

15. **Implement protected routes in frontend**
    - In `frontend/src/routes`, create `index.tsx`
    - Use `react-router-dom` (install `npm install react-router-dom`) to define routes
    - Protect a dummy route (e.g., `/goals`) based on `isAuthenticated`
    - Test by navigating to the protected route with and without login

16. ✅ **Implement refresh token handling in frontend** [Completed]
    - In `frontend/src/services/auth.ts`:
      - Add refresh token storage in localStorage
      - Implement token refresh function
      - Handle token rotation when enabled
    - In `frontend/src/services/api.ts`:
      - Add axios interceptor to:
        - Check token expiration (5 minute buffer)
        - Automatically refresh when needed
        - Retry failed requests with new token
    - In `frontend/src/services/websocket.ts`:
      - Handle token refresh events from server
      - Maintain WebSocket connection during refresh
      - Reconnect if WebSocket fails during refresh
    - Test full token lifecycle:
      - Verify automatic refresh before expiration
      - Verify token rotation works
      - Verify WebSocket remains connected during refresh
      - Verify failed refresh triggers logout

## Phase 2.5: Real-time Updates

17. **Implement WebSocket using FastAPI's native support**
    - In `backend/routes`, create `websocket.py`
    - Implement WebSocket endpoint using FastAPI's `WebSocket` class
    - Add JWT token verification for WebSocket connections
    - Test by connecting with valid and invalid tokens

18. **Implement frontend WebSocket client**
    - In `frontend/src/services`, create `websocket.ts`
    - Implement simple WebSocket connection with token handling
    - Handle automatic reconnection on failure
    - Test by connecting and verifying connection state

19. **Simplify WebSocket integration**
    - Remove custom connection manager implementation
    - Use FastAPI's built-in WebSocket support
    - Update auth flow to work without WebSocket broadcasts

## Phase 3: Goals Management

21. **Implement category constants in backend**
    - In `backend/utils`, create `constants.py` with `CATEGORIES = ["Family", "Work", "Health", "Personal"]`  
    - Test by importing and printing `CATEGORIES` in `main.py`  

22. **Implement Goal model in backend**
    - In `backend/models`, create `goal.py` with fields: `id`, `user_id`, `title`, `description`, `category` (must be in `CATEGORIES`), `status` (active or completed), `created_at`, `updated_at`  
    - Use Pydantic for validation, ensuring `category` is one of the allowed values  
    - Test the model by validating a sample goal in `main.py`  

23. **Implement Goal service in backend**
    - In `backend/services`, create `goal_service.py`  
    - Add functions:  
      - `create_goal`: Check if the user has fewer than 3 active goals in the selected category before creating  
      - `get_goals_by_user`: Retrieve goals for a specific user  
      - `update_goal`: Allow updates to `title`, `description`, and `status` (category is immutable)  
      - `delete_goal`: Remove a goal  
    - Test each function with sample data in `main.py`  

24. **Implement Goal routes in backend**
    - In `backend/routes`, create `goals.py` with endpoints: `/goals` (POST, GET), `/goals/{id}` (GET, PUT, DELETE)
    - Implement route handlers to call `goal_service` methods directly
    - Protect endpoints with authentication (e.g., verify JWT)
    - Test endpoints with curl or Postman

25. **Implement Goals page in frontend**
    - In `frontend/src/pages`, create `GoalsPage.tsx`  
    - Fetch and display goals grouped by category  
    - Add a form to create a new goal with a dropdown for category selection  
    - Handle errors if the user tries to create more than 3 active goals in a category  
    - Test by creating goals and ensuring the limit is enforced  

## Phase 4: Task Management

26. **Implement Task model in backend**
    - In `backend/models`, create `task.py` with fields: `id`, `user_id`, `goal_id`, `title`, `description`, `status` (todo, in_progress, done), `created_at`, `updated_at`  
    - Test the model by validating a sample task in `main.py`  

27. **Implement Task service in backend**
    - In `backend/services`, create `task_service.py`  
    - Add CRUD functions: create, read, update, delete tasks  
    - Ensure `goal_id` exists and belongs to the user  
    - Test each function with sample data in `main.py`  

28. **Implement Task routes in backend**
    - In `backend/routes`, create `task.py` with endpoints: `/tasks` (POST, GET), `/tasks/{id}` (GET, PUT, DELETE)
    - Route handlers should directly call `task_service` methods
    - Protect endpoints with authentication
    - Test endpoints with curl or Postman

29. **Implement Tasks page in frontend**
    - In `frontend/src/pages`, create `TasksPage.tsx`  
    - Fetch and display tasks, optionally grouped by goal  
    - Add a form to create a new task with a dropdown to select an active goal  
    - Test by creating tasks and associating them with goals  

30. **Integrate goals and tasks in frontend**
    - On the `GoalsPage.tsx`, optionally display associated tasks or task counts for each goal  
    - Ensure tasks are only created for active goals  
    - Test the integration by creating goals and tasks  

## Phase 5: Mobile-First Design

31. **Implement responsive design**
    - Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer`  
    - Initialize Tailwind: `npx tailwindcss init -p`  
    - Configure `tailwind.config.js` and add directives to `index.css`  
    - Update `AuthPage.tsx`, `GoalsPage.tsx`, and `TasksPage.tsx` with responsive Tailwind classes  
    - Test on different screen sizes using browser dev tools  

32. **Optimize performance for mobile**
    - In `TasksPage.tsx` and `GoalsPage.tsx`, lazy load components using `React.lazy`  
    - Minimize re-renders with `React.memo` on list items  
    - Test performance by checking load times on a mobile emulator