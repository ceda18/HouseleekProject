from fastapi import FastAPI
from app.api.router import router

app = FastAPI(title="Houseleek AIAgent Service")

app.include_router(router)
