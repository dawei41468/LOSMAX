module.exports = {
  apps: [{
    name: "los-backend",
    cwd: "/home/ubuntu/LOS/backend",
    script: "/home/ubuntu/LOS/backend/venv/bin/gunicorn",
    args: "-k uvicorn.workers.UvicornWorker --workers 4 --bind 127.0.0.1:4000 --timeout 120 main:app",
    interpreter: "none",
    env: {
      APP_ENV: "production",
      PYTHONPATH: "/home/ubuntu/LOS/backend",
    }
  }]
}
