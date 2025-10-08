import uvicorn
from auth_app.main import app

if __name__ == "__main__":
    uvicorn.run(
        "auth_app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )

