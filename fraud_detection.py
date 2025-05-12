from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import string

# Define FastAPI app
app = FastAPI()

# Define fraud keywords
fraud_keywords = {"win", "lottery", "prize", "money", "click", "offer", "claim", "free", "guaranteed"}

# Define request model
class FraudCheckRequest(BaseModel):
    user: str
    amount: float
    description: str
    medical_docs: List[str]

# Function to clean and normalize text
def clean_text(text):
    text = text.lower().translate(str.maketrans("", "", string.punctuation))  # Remove punctuation and convert to lowercase
    words = set(text.split())  # Convert to a set of words
    return words

# Fraud detection function
def detect_fraud(text):
    words = clean_text(text)  # Process text
    fraud_matches = words & fraud_keywords  # Find matching words
    confidence = len(fraud_matches) / len(words) if words else 0.0  # Confidence score

    if fraud_matches:
        return "Fraud", round(confidence, 2)  # Round confidence for better readability
    return "Genuine", 0.0

# API Endpoint for Fraud Detection
@app.post("/fraud-detection")
async def fraud_detection(request: FraudCheckRequest):
    if not request.description.strip():  # Check for empty descriptions
        raise HTTPException(status_code=400, detail="Description cannot be empty")

    fraud_status, confidence = detect_fraud(request.description)

    return {
        "status": fraud_status,
        "confidence": confidence
    }

# Root endpoint for testing
@app.get("/")
def home():
    return {"message": "Fraud Detection API is Running!"}


 


