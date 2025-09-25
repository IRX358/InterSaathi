import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load internships data from JSON
with open("data/internships.json", "r", encoding="utf-8") as f:
    internships = json.load(f)

def recommend_internships(candidate_skills, education, internship_type=None, category=None, duration=None, top_n=5):
    """
    candidate_skills: list of skills from form
    education: string
    internship_type: 'Online' or 'Onsite' (optional)
    category: string (optional)
    duration: string or number (optional)
    top_n: number of internships to return
    """
    recommendations = []

    # Convert candidate skills list to a single string
    candidate_skills_str = " ".join(candidate_skills).lower()

    for intern in internships:
        score = 0

        # ---- Skills match (AI/NLP part) ----
        intern_skills = intern.get("eligibility", {}).get("skills_required", [])
        intern_skills_str = " ".join(intern_skills).lower()

        # TF-IDF + Cosine similarity
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([candidate_skills_str, intern_skills_str])
        cos_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        score += cos_sim * 5  # weight for skills match

        # ---- Education match ----
        required_edu = intern.get("eligibility", {}).get("required_qualification", "").lower()
        if education.lower() in required_edu:
            score += 2

        # ---- Internship type match ----
        if internship_type:
            title = intern.get("title", "").lower()
            if internship_type.lower() in title:
                score += 1

        # ---- Category / sector match ----
        if category:
            title = intern.get("title", "").lower()
            if category.lower() in title:
                score += 1

        # ---- Duration match ----
        if duration:
            if str(duration) in intern.get("duration", ""):
                score += 1

        # Store score with internship info
        recommendations.append((score, intern))

    # Sort by score descending and pick top_n
    recommendations.sort(key=lambda x: x[0], reverse=True)
    top_internships = [intern for score, intern in recommendations[:top_n]]

    return top_internships
