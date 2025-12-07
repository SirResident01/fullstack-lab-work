import os
import uvicorn

if __name__ == "__main__":
    # Читаем PORT из переменных окружения или используем 8000 по умолчанию
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port
    )

