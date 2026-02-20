from pydantic import BaseModel

class CropData(BaseModel):
    name: str
    type: str
    location: str
    healthStatus: str | None = "unknown"

class AnalysisResponse(BaseModel):
    prediction: str
    confidence: float
    recommendation: str
