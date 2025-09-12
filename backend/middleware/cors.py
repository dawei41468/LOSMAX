from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",  # Vite default dev port
            "http://localhost:4100",  # Vite dev port to mimic production
            "https://los.studiodtw.net",  # Production domain
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )