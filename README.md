py# 🚀 AI Personalized Learning Path Generator

An AI-powered web application that creates **personalized 4-week learning roadmaps** based on user goals, skill level, and learning preferences.

Users can enter a learning objective (for example, **"Learn Quantum Physics"** or **"Master Data Structures & Algorithms"**) and receive a structured AI-generated roadmap with weekly plans, recommended resources, and progress tracking.

---

## ✨ Features

✅ User Authentication (Login / Signup)

✅ Personalized Goal-Based Learning Paths

✅ Difficulty Selection

* Beginner
* Intermediate
* Advanced

✅ AI-Generated 4-Week Learning Roadmaps

✅ Weekly Learning Breakdown

✅ Resource Recommendations

✅ Progress Tracking Dashboard

✅ Regenerate Roadmap Feature

✅ Interactive Modern UI

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

* OpenAI API

### Database

* PostgreSQL

### Authentication

* Django Authentication System

---

## 🏗 System Architecture

Frontend (React + Vite)

↓

REST API Requests

↓

Backend (Django REST Framework)

↓

OpenAI API (Roadmap Generation)

↓

PostgreSQL Database (User Data + Learning Plans)

---

## 📂 Project Structure

```plaintext
AI-Personalized-Learning-Path-Generator/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── settings.py
│   ├── urls.py
│   └── apps/
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/rajeshwari0104/AI-Personalized-Learning-Path-Generator.git
cd AI-Personalized-Learning-Path-Generator
```

---

### 2. Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Create a `.env` file inside backend:

```env
OPENAI_API_KEY=your_api_key
DATABASE_URL=your_postgresql_url
SECRET_KEY=your_django_secret_key
```

Run migrations:

```bash
python manage.py migrate
python manage.py runserver
```

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

npm install

npm run dev
```

## 🔮 Future Scope

* Adaptive Recommendation Engine
* AI Difficulty Adjustment
* Personalized Learning Analytics
* PDF / Notes Upload Support
* AWS Cloud Deployment
* Resource Discovery & Recommendation Enhancement
* Learning Performance Insights

---

## 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

Fork the repository and create a pull request.

