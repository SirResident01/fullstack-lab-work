import os
import uvicorn
from app.main import app

if __name__ == "__main__":
    # Читаем PORT из переменных окружения или используем 8080 по умолчанию
    port = int(os.getenv("PORT", 8080))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,  # Отключаем reload в production
        log_level="info"
    )

