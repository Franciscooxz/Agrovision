from fastapi import FastAPI
from schemas import CropData, AnalysisResponse
from model import analyze_crop

app = FastAPI(title="AgroVision AI Service")

@app.get("/")
def root():
    return {"message": "AI Service Running"}

@app.post("/analyze", response_model=AnalysisResponse)
def analyze(data: CropData):
    result = analyze_crop(data)
    return result
