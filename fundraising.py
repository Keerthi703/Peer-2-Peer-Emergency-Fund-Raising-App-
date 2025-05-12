from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient
from typing import List
from pydantic import BaseModel

import requests  # To call Fraud Detection API

app = FastAPI()

# ✅ Enable CORS for Frontend Communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Connect to MongoDB
MONGO_URI = "mongodb+srv://project701379:6hZsIzc81F8R5uzu@clusternew.snn8v.mongodb.net/fundraising_db"

try:
    client = MongoClient(MONGO_URI)
    db = client["fundraising_db"]  # Database name
    collection = db["campaigns"]  # Collection name
    print("✅ MongoDB Connected Successfully!")
except Exception as e:
    print(f"❌ MongoDB Connection Failed: {e}")

# ✅ Define Request Model
class FundraisingRequest(BaseModel):
    user: str
    amount: float
    description: str
    medical_docs: List[str] = Field(alias="medicaldocs")  # Accepts "medicaldocs" in JSON

# ✅ Root Endpoint

@app.get("/")
async def root():
    return {"message": "Welcome to the Fundraising API!"}

# ✅ Create Fundraising Campaign with Fraud Detection
@app.post("/create-fundraising")
async def create_fundraising(request: FundraisingRequest):
    try:
        campaign_data = request.model_dump()

        # Step 1: Call Fraud Detection API
        fraud_response = requests.post(
            "http://127.0.0.1:8000/fraud-detection", 
            json=campaign_data
        )

        if fraud_response.status_code != 200:
            raise HTTPException(status_code=500, detail="Fraud Detection API Error")

        fraud_result = fraud_response.json()
        campaign_data["fraud_status"] = fraud_result["status"]
        campaign_data["confidence"] = fraud_result["confidence"]

        # Step 2: Store Campaign in MongoDB
        result = collection.insert_one(campaign_data)

        return {
            "message": "✅ Campaign created successfully!",
            "campaign_id": str(result.inserted_id),
            "fraud_status": fraud_result["status"],
            "confidence": fraud_result["confidence"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Internal Server Error: {str(e)}")

# ✅ Fetch All Campaigns
@app.get("/get-campaigns")
async def get_campaigns():
    try:
        campaigns = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB `_id` field
        return {"campaigns": campaigns}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"❌ Error Fetching Campaigns: {str(e)}")
@app.post("/store-transaction")
async def store_transaction(request: TransactionRequest):
    try:
        transaction_data = request.model_dump()
        result = transaction.insert_one(transaction_data)
        return {"status": "success", "message": "Transaction stored successfully!", "transaction_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
















# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from pymongo import MongoClient

# app = FastAPI()

# # Connect to MongoDB
# client = MongoClient("mongodb+srv://project701379:6hZsIzc81F8R5uzu@clusternew.snn8v.mongodb.net/?retryWrites=true&w=majority&appName=ClusterNew")
# db = client["fundraising_db"]  # Database name
# collection = db["campaigns"]  # Collection name

# # Define request model
# class FundraisingRequest(BaseModel):
#     user: str
#     amount: float
#     description: str
#     medical_docs: list[str]

# @app.post("/create-fundraising")
# async def create_fundraising(request: FundraisingRequest):
#     # Store the campaign in MongoDB
#     campaign_data = request.model_dump()

#     result = collection.insert_one(campaign_data)
    
#     return {
#         "message": "Campaign created successfully!",
#         "campaign_id": str(result.inserted_id)
#     }
