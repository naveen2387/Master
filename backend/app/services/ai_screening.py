import re
from collections import Counter


COMMON_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue",
    "node", "django", "flask", "fastapi", "spring", "sql", "nosql", "mongodb",
    "postgresql", "mysql", "redis", "docker", "kubernetes", "aws", "azure",
    "gcp", "git", "ci/cd", "agile", "scrum", "machine learning", "deep learning",
    "nlp", "data science", "analytics", "html", "css", "rest", "graphql",
    "microservices", "linux", "terraform", "jenkins", "jira", "figma",
    "project management", "leadership", "communication", "teamwork",
    "problem solving", "critical thinking", "c++", "c#", ".net", "go", "rust",
    "swift", "kotlin", "flutter", "react native", "tableau", "power bi",
    "excel", "salesforce", "sap", "oracle", "hadoop", "spark", "kafka",
]

EDUCATION_KEYWORDS = [
    "bachelor", "master", "phd", "doctorate", "mba", "b.tech", "m.tech",
    "b.sc", "m.sc", "b.e", "m.e", "bca", "mca", "degree", "university",
    "college", "institute", "certification", "certified",
]

EXPERIENCE_PATTERN = re.compile(r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience)?", re.IGNORECASE)


def extract_skills(text: str) -> list[str]:
    text_lower = text.lower()
    return [skill for skill in COMMON_SKILLS if skill in text_lower]


def extract_experience_years(text: str) -> int:
    matches = EXPERIENCE_PATTERN.findall(text)
    return max((int(m) for m in matches), default=0)


def extract_education(text: str) -> list[str]:
    text_lower = text.lower()
    return [kw for kw in EDUCATION_KEYWORDS if kw in text_lower]


def compute_skill_match(resume_skills: list[str], job_text: str) -> float:
    if not resume_skills:
        return 0.0
    job_lower = job_text.lower()
    matched = [s for s in resume_skills if s in job_lower]
    return len(matched) / max(len(resume_skills), 1)


def screen_resume(
    resume_text: str,
    job_description: str,
    job_requirements: str,
) -> dict:
    if not resume_text.strip():
        return {
            "score": 0.0,
            "summary": "No resume content provided for screening.",
            "strengths": "N/A",
            "weaknesses": "Resume content is empty.",
        }

    job_text = f"{job_description} {job_requirements}"
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_text)
    experience_years = extract_experience_years(resume_text)
    education = extract_education(resume_text)

    # Skill match score (40%)
    if job_skills:
        matched_skills = set(resume_skills) & set(job_skills)
        skill_score = len(matched_skills) / len(set(job_skills))
    else:
        skill_score = min(len(resume_skills) / 5, 1.0)

    # Experience score (25%)
    exp_score = min(experience_years / 8, 1.0)

    # Education score (15%)
    edu_score = min(len(education) / 3, 1.0)

    # Resume quality score (20%) - based on length, structure, keywords
    word_count = len(resume_text.split())
    quality_score = min(word_count / 300, 1.0)

    total_score = round(
        (skill_score * 0.40 + exp_score * 0.25 + edu_score * 0.15 + quality_score * 0.20) * 100, 1
    )
    total_score = min(total_score, 100.0)

    # Generate summary
    strengths_list = []
    weaknesses_list = []

    if resume_skills:
        strengths_list.append(f"Technical skills: {', '.join(resume_skills[:8])}")
    else:
        weaknesses_list.append("No recognizable technical skills found")

    if experience_years > 0:
        strengths_list.append(f"{experience_years}+ years of experience")
    else:
        weaknesses_list.append("No clear experience level mentioned")

    if education:
        strengths_list.append(f"Education: {', '.join(education[:3])}")
    else:
        weaknesses_list.append("No educational qualifications detected")

    if job_skills:
        missing = set(job_skills) - set(resume_skills)
        if missing:
            weaknesses_list.append(f"Missing required skills: {', '.join(list(missing)[:5])}")
        matched = set(resume_skills) & set(job_skills)
        if matched:
            strengths_list.append(f"Matching job skills: {', '.join(list(matched)[:5])}")

    summary = (
        f"Candidate scored {total_score}/100. "
        f"Found {len(resume_skills)} relevant skills, "
        f"{experience_years} years experience. "
        f"{'Strong' if total_score >= 70 else 'Moderate' if total_score >= 40 else 'Weak'} match for the position."
    )

    return {
        "score": total_score,
        "summary": summary,
        "strengths": "; ".join(strengths_list) if strengths_list else "No notable strengths identified",
        "weaknesses": "; ".join(weaknesses_list) if weaknesses_list else "No significant weaknesses found",
    }


def batch_screen_resumes(
    resumes: list[dict],
    job_description: str,
    job_requirements: str,
) -> list[dict]:
    results = []
    for resume in resumes:
        result = screen_resume(
            resume_text=resume.get("resume_text", ""),
            job_description=job_description,
            job_requirements=job_requirements,
        )
        result["candidate_name"] = resume.get("candidate_name", "Unknown")
        results.append(result)
    results.sort(key=lambda x: x["score"], reverse=True)
    return results
