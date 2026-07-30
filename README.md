# 🚀 AI Personalized Learning Path Generator

An AI-powered web application that creates **personalized learning roadmaps**, conducts **mock interviews**, and **optimizes your CV** based on your specific career goals and skill level. 

Users can enter a learning objective (for example, **"Learn Quantum Physics"** or **"Master Data Structures & Algorithms"**) and receive a structured AI-generated roadmap with weekly plans, recommended resources, and progress tracking.

---

## ✨ Features

✅ **Personalized Goal-Based Learning Paths** (Beginner, Intermediate, Advanced)

✅ **Live Interactive AI Mock Interviews** (Technical, Analytical, Rapid Fire, Soft Skills)

✅ **Smart Resume ATS Audit & CV Optimizer** (Line-by-line feedback)

✅ **AI-Generated Learning Roadmaps** (with resource recommendations & dynamic duration)

✅ **Gamified Progress Tracking** (XP, Daily Streaks, Mastery Badges)

✅ **Robust API Fallback System** (Groq Primary → Groq Fallback → OpenRouter) to prevent rate limit crashes

✅ **Shareable Learning Roadmaps**

✅ **Interactive Modern UI** with Light & Dark Modes

✅ User Authentication (Login / Signup)

---

## 🛠 Tech Stack

### Frontend
* React.js
* Vite
* Tailwind CSS

### Backend
* Django
* Django REST Framework (DRF)

### AI Integration
* Groq API (Primary: `llama-3.3-70b-versatile`, Backup: `llama-3.1-8b-instant`)
* OpenRouter API (Secondary Backup)

### Database
* SQLite (Default) / PostgreSQL

---

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/samad-00/AI-Personalised-Learning-Path-Generator.git
cd AI-Personalised-Learning-Path-Generator
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_URL=your_postgresql_url
SECRET_KEY=your_django_secret_key
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver 8007
```

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

---

## 🔮 Future Scope

* Adaptive Recommendation Engine
* AI Difficulty Adjustment
* PDF / Notes Upload Support
* AWS Cloud Deployment

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.
Fork the repository and create a pull request.

