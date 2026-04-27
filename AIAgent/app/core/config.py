from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    anthropic_api_key: str
    anthropic_model: str = "claude-opus-4-5"
    core_platform_url: str
    agent_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()
