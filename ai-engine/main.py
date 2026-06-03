import os
import time
import traceback
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

# Import analyzer after load_dotenv so env is available
from src.analyzers.dispatcher import analyze_code

ENGINE_VERSION = os.getenv("ENGINE_VERSION", "1.0.0")

app = FastAPI(
    title="Syntax AI Engine",
    description="AST-based code complexity analysis engine",
    version=ENGINE_VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_LANGUAGES = {"javascript", "python", "cpp", "java", "c", "go"}


class AnalysisRequest(BaseModel):
    code: str
    language: str
    analysis_id: str = ""

    @field_validator("language")
    @classmethod
    def validate_language(cls, v):
        v = v.lower().strip()
        if v not in SUPPORTED_LANGUAGES:
            raise ValueError("Unsupported language: " + v + ". Must be one of: " + ", ".join(SUPPORTED_LANGUAGES))
        return v

    @field_validator("code")
    @classmethod
    def validate_code(cls, v):
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > 50000:
            raise ValueError("Code exceeds 50,000 character limit")
        return v


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "syntax-ai-engine",
        "version": ENGINE_VERSION,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    start = time.time()
    logger.info(f"Analyzing [{request.language}] | id={request.analysis_id or 'none'} | len={len(request.code)}")

    try:
        result = analyze_code(request.code, request.language)
        elapsed = round((time.time() - start) * 1000)
        result["engine_version"] = ENGINE_VERSION
        result["analysis_time_ms"] = elapsed
        logger.info(f"Done in {elapsed}ms | complexity={result['complexity']['time']} | score={result.get('overall_score', 0)}")
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Internal AI engine error", "detail": str(exc)},
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"🐍 Syntax AI Engine starting on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True, log_level="info")
