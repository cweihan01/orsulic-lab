# Orsulic Lab

*DataRes Consulting, Fall 2024 - Winter 2025*

## Database Schema

The current database schema is as follows:

![Database Schema](./assets/db-diagram.png).

## Installation Instructions

### Cloning the repository
```
git clone https://github.com/cweihan01/orsulic-lab.git
cd orsulic-lab
```

## Running the frontend
```
cd frontend
```

Copy the provided `.env` file *into the `frontend` directory* (not the root directory). See `frontend/.env.example` for the required fields.

We use `yarn` as our package manager. To install yarn:
```
npm install --global yarn
```

Install packages and start server:
```
yarn install
yarn start
```

## Running the backend
```
cd backend
```

### Installing and activating virtual environment
```
python -m venv .venv
```

On Windows:
```
.venv/Scripts/Activate.ps1
```

On MacOS:
```
source .venv/bin/activate
```

### Installing/Updating Python packages
```
pip install -r requirements.txt
```

Copy the provided `.env` file *into the `backend` directory* (not the root directory). See `backend/.env.example` for the required fields.

```
python manage.py runserver
```

Navigate to `127.0.0.1:8000` on a browser, and `127.0.0.1:8000/admin` for Django's administrator portal.
