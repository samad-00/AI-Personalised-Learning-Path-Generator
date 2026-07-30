# Learning Path

An AI-powered web application that creates **personalized learning roadmaps**, conducts **mock interviews**, and **analyzes your CV** based on your specific career goals and skill level. 

Users can enter a learning objective (for example, **"Learn Quantum Physics"** or **"Master Data Structures & Algorithms"**) and receive a structured AI-generated roadmap with weekly plans, recommended resources, and progress tracking.

url- https://ai-learnpath.vercel.app/
---

## ✨ Features

✅ **Personalized Goal-Based Learning Paths** (Beginner, Intermediate, Advanced)

✅ **Live Interactive AI Mock Interviews** (Technical, Analytical, Rapid Fire, Soft Skills)

✅ **Smart Resume ATS Audit**

✅ **AI-Generated Learning Roadmaps** (with resource recommendations & dynamic duration)

✅ **Gamified Progress Tracking** (XP, Daily Streaks, Mastery Badges)

✅ **Robust API Fallback System** (Groq Primary → Groq Fallback → OpenRouter) to prevent rate limit crashes

✅ **Real Email OTP Authentication System** (Secure Registration & Login with 30-sec resend timers)

✅ **Premium HTML Animated Emails** (Stunning light/dark theme embedded GIF emails)

✅ **Shareable Learning Roadmaps**

✅ **Interactive Modern UI** with Light & Dark Modes

✅ **Throttled & Secured API Endpoints**

---

## 🛠 Tech Stack

### Frontend
* React.js
* Vite
* Vanilla CSS / Premium Glassmorphism UI

### Backend
* Django
* Django REST Framework (DRF)
* SMTP Email Integration

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

### 2. Local Backend Setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DEBUG=True
SECRET_KEY=your_django_secret_key

# AI Keys
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key # Optional backup

# Email SMTP Setup (For OTP Authentication)
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

Run migrations and start the server:

```bash
python manage.py migrate
python manage.py runserver 8007
```

---

### 3. Local Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

---

### 4. Production Deployment 🚀

**1. Database (Supabase):**
- Create a PostgreSQL database on [Supabase](https://supabase.com).
- Copy the **Connection Pooling URL** (port `6543`, e.g. `postgresql://...pooler.supabase.com:6543/postgres`). *Note: The standard direct connection (port 5432) will fail on Render's free tier.*

**2. Backend (Render):**
- Create a new Web Service on [Render](https://render.com), linked to your repository.
- Set Root Directory to `backend`
- Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start Command: `gunicorn core.wsgi:application`
- Add Environment Variables:
  - `DEBUG`: `False`
  - `DATABASE_URL`: Your Supabase Connection Pooling URL (delete `?pgbouncer=true` from the end if it exists)
  - `GROQ_API_KEY`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
  - `ALLOWED_HOSTS`: `.onrender.com`
  - `CORS_ALLOWED_ORIGINS` & `CSRF_TRUSTED_ORIGINS`: Your Vercel frontend URL (e.g. `https://your-app.vercel.app`) - **Important: Do not include a trailing slash `/` at the end!**

**3. Frontend (Vercel):**
- Import the repository into [Vercel](https://vercel.com).
- Set the **Root Directory** to `frontend`.
- Add an Environment Variable: 
  - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com`).
- Click **Deploy**!


## 🔮 Future Scope

* Adaptive Recommendation Engine
* AI Difficulty Adjustment
* PDF / Notes Upload Support
* AWS Cloud Deployment

---
## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.
Fork the repository and create a pull request.

