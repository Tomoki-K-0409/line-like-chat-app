# LINE Chat App

This is a simple LINE-like chat application built with Next.js (Frontend) and FastAPI (Backend) using SQLite for the database.

## Features

- User registration and login with a simple username.
- Real-time (polling-based) chat message display.
- Send new chat messages.

## Technologies Used

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** FastAPI, SQLAlchemy, Uvicorn
- **Database:** SQLite

## Setup and Run

Follow these steps to set up and run the application locally.

### 1. Clone the repository (if applicable)

```bash
git clone <repository-url>
cd line-chat-app-new
```

### 2. Backend Setup

Navigate to the `backend` directory, create a virtual environment, install dependencies, and run the FastAPI application.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
python main.py
```

The backend server will start at `http://localhost:8000`.

### 3. Frontend Setup

Navigate to the `frontend` directory, install dependencies, and run the Next.js application.

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend development server will start at `http://localhost:3000`.

## Usage

1.  Open your browser and go to `http://localhost:3000`.
2.  Enter a username on the login page and click "チャットルームに入室". If the username doesn't exist, it will be registered. If it exists, you will be logged in.
3.  You will be redirected to the chat room. You can now send and receive messages.

## Project Structure

```
line-chat-app-new/
├── backend/
│   ├── venv/               # Python Virtual Environment
│   ├── chat.db             # SQLite Database (generated after first run)
│   ├── main.py             # FastAPI application code
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── node_modules/       # Node.js dependencies
    ├── public/
    ├── src/
    │   ├── app/
│   │   │   ├── chat/           # Chat room page
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx        # Login page
│   ├── .gitignore
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── postcss.config.mjs
│   ├── README.md
│   └── tailwind.config.ts
```
