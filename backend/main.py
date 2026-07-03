"""
main.py
--------
This is the FastAPI backend for our AI Chatbot.

What this file does:
1. Creates a FastAPI app
2. Enables CORS so our Next.js frontend can talk to this backend
3. Defines a POST /chat endpoint that:
   - Accepts a user message
   - Sends that message to the Gemini API
   - Returns the AI's reply back to the frontend
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------------------------------------------------
# 1. Load environment variables from the .env file
# ---------------------------------------------------------
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

if not GEMINI_API_KEY:
    # We don't crash immediately here so the server can still start
    # and give a clear error message when /chat is actually called.
    print("WARNING: GEMINI_API_KEY is not set. Please add it to your .env file.")

# Configure the Gemini client with our API key
genai.configure(api_key=GEMINI_API_KEY)

# ---------------------------------------------------------
# 2. Create the FastAPI app
# ---------------------------------------------------------
app = FastAPI(title="AI Chatbot Backend")

# ---------------------------------------------------------
# 3. Add CORS middleware
# ---------------------------------------------------------
# CORS (Cross-Origin Resource Sharing) is needed because our frontend
# (e.g. http://localhost:3000) and backend (http://localhost:8000)
# run on different "origins". Without CORS, the browser would block
# the frontend from calling the backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For a real production app, replace "*" with your exact frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# 4. Define request and response models using Pydantic
# ---------------------------------------------------------
class ChatRequest(BaseModel):
    message: str  # The message typed by the user


class ChatResponse(BaseModel):
    reply: str  # The AI-generated reply


# ---------------------------------------------------------
# 5. A simple health-check route (optional but useful)
# ---------------------------------------------------------
@app.get("/")
def read_root():
    return {"status": "AI Chatbot backend is running"}


# ---------------------------------------------------------
# 6. The main chat endpoint
# ---------------------------------------------------------
@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Receives a user message, sends it to Gemini, and returns the reply.
    """

    # Basic validation: don't call the API with an empty message
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Server is missing GEMINI_API_KEY. Please set it in the .env file.",
        )

    try:
        # Create the Gemini model instance
        model = genai.GenerativeModel(GEMINI_MODEL)

        # Send the user's message to Gemini and get a response
        result = model.generate_content(request.message)

        # Extract the text reply from Gemini's response
        ai_reply = result.text

        return ChatResponse(reply=ai_reply)

    except Exception as e:
        # If anything goes wrong when calling Gemini, return a clean error
        # instead of crashing the server.
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")
