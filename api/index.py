import os
import random
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# ---- Pydantic Models for Request / Response ----

class BrandContext(BaseModel):
    brand_name: str
    description: str
    industry: str
    vibe: str
    target_audience: str

class AttachedContext(BaseModel):
    phase: str
    content: str

class GeneratePhaseRequest(BaseModel):
    type: str  # "tagline", "visual_concept", "logo_concept", "marketing_content"
    brandContext: BrandContext
    attachedContext: Optional[List[AttachedContext]] = None
    
class RefinePhaseRequest(BaseModel):
    type: str
    brandContext: BrandContext
    previous_content: str
    user_feedback: str
    attachedContext: Optional[List[AttachedContext]] = None

class RetryPhaseRequest(BaseModel):
    type: str
    brandContext: BrandContext
    phaseConfig: Optional[Dict[str, str]] = None
    attachedContext: Optional[List[AttachedContext]] = None

class GeneratedVariant(BaseModel):
    content: str = Field(description="The main text content generated for the specific brand phase.")
    confidence_score: int = Field(ge=0, le=100, description="Confidence score out of 100 on how well this fits the brand context.")

class GenerationResponse(BaseModel):
    options: List[GeneratedVariant] = Field(description="Exactly 3 distinct variants generated for the user to choose from.")

# ---- Helper Functions ----

def generate_versions(prompt: str, type_name: str) -> GenerationResponse:
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a creative brand architect AI. "
                        "The user needs 3 distinct, high-quality, and creative options for their brand's " + type_name + ". "
                        "Your response must be in strictly valid JSON matching the requested schema. "
                        "The JSON object must contain a single key 'options' holding an array of exactly 3 objects. "
                        "Each object must have exactly two keys: 'content' (a string containing the text) and 'confidence_score' (an integer from 0 to 100)."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )
        # Parse the JSON string from the response choice
        result_json = json.loads(response.choices[0].message.content)
        return GenerationResponse.model_validate(result_json)
    except Exception as e:
        print("Groq API error:", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to generate content: {str(e)}")

def build_context_prompt(req_type: str, context: BrandContext, attached: Optional[List[AttachedContext]] = None, extra_instructions: str = "") -> str:
    prompt = f"Brand Name: {context.brand_name}\n"
    prompt += f"Industry: {context.industry}\n"
    prompt += f"Target Audience: {context.target_audience}\n"
    prompt += f"Brand Vibe: {context.vibe}\n"
    prompt += f"Description: {context.description}\n\n"
    
    if attached:
        prompt += "Previously Approved Assets:\n"
        for item in attached:
            prompt += f"- {item.phase.upper()}: {item.content}\n"
        prompt += "\n"
        
    prompt += f"Task: Generate 3 distinct options for the brand's {req_type}. "
    
    if req_type == "tagline":
        prompt += "Provide short, catchy taglines (1-2 sentences)."
    elif req_type == "visual_concept":
        prompt += "Describe visual layout, colors, typography, imagery, and overall aesthetic vibe."
    elif req_type == "logo_concept":
        prompt += "Describe ideas for a logo including iconic shapes, typography style, and metaphors."
    elif req_type == "marketing_content":
        prompt += "Provide an initial short marketing pitch or social media bio paragraph."
        
    if extra_instructions:
        prompt += f"\n\nAdditional Instructions: {extra_instructions}"
        
    return prompt

# ---- API Endpoints ----

@app.get("/api/hello")
def hello_work():
    return {"message": "Hello Work from FastAPI V2!"}

@app.post("/api/generate-phase")
def generate_phase(req: GeneratePhaseRequest):
    prompt = build_context_prompt(req.type, req.brandContext, req.attachedContext)
    result = generate_versions(prompt, req.type)
    return {"options": [r.model_dump() for r in result.options]}

@app.post("/api/refine-phase")
def refine_phase(req: RefinePhaseRequest):
    extra = f"The user provided this feedback on a previous version ('{req.previous_content}'): '{req.user_feedback}'. Improve upon the previous version based strictly on this feedback. Still provide 3 variants incorporating this feedback."
    prompt = build_context_prompt(req.type, req.brandContext, req.attachedContext, extra_instructions=extra)
    result = generate_versions(prompt, req.type)
    return {"options": [r.model_dump() for r in result.options]}
