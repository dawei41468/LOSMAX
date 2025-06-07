module.exports = {
  apps : [{
    name: "losmax-backend",
    script: "venv/bin/gunicorn",
    args: "-k uvicorn.workers.UvicornWorker --workers 4 --bind 0.0.0.0:8000 --timeout 120 main:app",
    cwd: "/root/LOSMAX/backend",
    interpreter: "/root/LOSMAX/backend/venv/bin/python",
    env: {
      "APP_ENV": "production"
    }
  }]
}