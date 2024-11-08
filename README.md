# Orsulic Lab

*DataRes Consulting, Fall 2024*

## Installation instructions

### Cloning the repository
```
git clone https://github.com/cweihan01/orsulic-lab.git
cd orsulic-lab
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

## Running the backend

Copy the provided `.env` file *into the `backend` directory* (not the root directory). See `backend/.env.example` for the required fields.

```
cd backend
python manage.py runserver
```

Navigate to `127.0.0.1:8000` on a browser
