# 🍁 CELPIP Daily Trainer

A full-stack web application for CELPIP exam preparation, built for Canadian PR applicants. Features AI-powered writing correction, reading comprehension tasks, progress tracking, user authentication, and an admin dashboard.

---

## ✨ Features

- **AI Writing Feedback** — Spelling errors, grammar corrections, informal language detection, corrected version of your response
- **Reading Comprehension** — CELPIP-style passages with detailed answer explanations
- **Improvement Tasks** — AI-generated targeted exercises based on your weak areas
- **Progress Tracking** — Score history, streaks, and averages across all sessions
- **Authentication** — Register, login, email verification, forgot/reset password
- **Admin Dashboard** — Manage users, view activity, activate/deactivate accounts

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2 + Django REST Framework |
| Frontend | React 18 + Vite |
| Database | PostgreSQL (Supabase recommended) |
| AI | Anthropic Claude API |
| Email | SMTP (Gmail / SendGrid) |
| Auth | JWT (djangorestframework-simplejwt) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL database
- Anthropic API key

---

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/celpip-trainer.git
cd celpip-trainer
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
SECRET_KEY=your-django-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Supabase or local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=CELPIP Trainer <your@gmail.com>

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

Run migrations and create a superuser:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
celpip-trainer/
├── backend/
│   ├── core/               # Django settings, urls, wsgi
│   ├── accounts/           # Auth: register, login, verify email, reset password
│   ├── trainer/            # Progress tracking, sessions
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/          # Login, Register, Dashboard, Admin, etc.
│   │   ├── components/     # Reading, Writing, Tips components
│   │   ├── context/        # Auth context
│   │   └── api.js          # Axios API client
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🔐 Admin Access

After creating a superuser:
1. Go to `/admin` in the frontend
2. Or use Django admin at `http://localhost:8000/admin`

Admin can:
- View all registered users
- Activate / deactivate accounts
- See each user's session history and scores
- View total platform usage stats

---

## 🌍 Deployment

### Backend (Render)
1. Connect your GitHub repo to Render
2. Set build command: `pip install -r requirements.txt && python manage.py migrate`
3. Set start command: `gunicorn core.wsgi:application`
4. Add all environment variables

### Frontend (Vercel / Netlify)
1. Connect your GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add `VITE_API_URL` pointing to your Render backend URL

### Database
Use [Supabase](https://supabase.com) free tier — copy the connection string (Session Pooler mode) into `DATABASE_URL`.

---

## 📧 Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate an app password for "Mail"
4. Use that password as `EMAIL_HOST_PASSWORD`

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT License — free to use and modify.

---

Built with ❤️ to help CELPIP candidates achieve their Canadian PR goals.
