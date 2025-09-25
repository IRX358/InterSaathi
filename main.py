from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from recommendation import recommend_internships
import json

app = FastAPI()

# Mount the entire static directory to serve CSS, JS, and images
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

# Render homepage
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Render recommender feature page
@app.get("/recommender", response_class=HTMLResponse)
async def recommender_page(request: Request):
    return templates.TemplateResponse("recmder.html", {"request": request})

# Endpoint to get static data from smplData.json
@app.get("/api/static_data")
async def get_static_data():
    with open("data/smplData.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

# Endpoint to get internships data from internships.json
@app.get("/api/internships")
async def get_internships_data():
    with open("data/internships.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

# Handle form submission from frontend (recmnder.html)
@app.post("/api/recommendations")
async def get_recommendations(
    name: str = Form(...),
    education: str = Form(...),
    skills: str = Form(...),
    internship_type: str = Form(None),
    category: str = Form(None),
    duration: str = Form(None),
):
    skills_list = [s.strip() for s in skills.split(",") if s.strip()]

    # Call your Python script logic
    top_internships = recommend_internships(
        candidate_skills=skills_list,
        education=education,
        internship_type=internship_type,
        category=category,
        duration=duration,
        top_n=5
    )

    return JSONResponse(content={"recommendations": top_internships})
