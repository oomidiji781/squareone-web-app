
# SquareOne Student Progress Management Dashboard

## Project Overview

This project is a student progress management dashboard developed as part of the SquareOne Software Development Program.

The goal is to explore a centralized system that could help SquareOne staff view student information, monitor assignments, and track student progress.

The project is currently in development and uses sample student and assignment data.

## Features

### Staff Dashboard
- Overview of total students and assignments
- Completed and pending task counts
- Recent student activity

### Students
- Student names and email addresses
- Individual progress percentages
- Student status information

### Assignments
- Assignment titles
- Assigned students
- Due dates
- Assignment statuses

### Progress
- Student assignment completion summaries
- Progress percentages
- Progress status indicators

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend (In Development)**
- Python
- Django
- Django REST Framework

**Additional Tools**
- PostgreSQL
- Docker
- Git and GitHub
- Figma

## Current Development Status

- [x] Created initial dashboard designs in Figma
- [x] Implemented the four main frontend screens
- [x] Added navigation between Dashboard, Students, Assignments, and Progress
- [x] Added sample student and assignment information
- [x] Completed a successful frontend production build
- [ ] Connect frontend screens to backend API endpoints
- [ ] Replace sample information with database records
- [ ] Implement staff authentication and authorization
- [ ] Add assignment management functionality
- [ ] Test the integrated application

## Project Structure

```text
squareone-web-app/
├── backend/
│   ├── api/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
└── docker-compose.yml
```

## Running the Frontend Locally

Install Node.js and npm before proceeding.

```bash
git clone https://github.com/oomidiji781/squareone-web-app.git
cd squareone-web-app/frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal, typically:

http://localhost:5173/

To verify the frontend production build:

```bash
npm run build
```

## Future Development

The next phase will focus on connecting the React frontend to the Django REST API, integrating persistent student and assignment data, and implementing the functionality needed to manage student progress.

## Note

This is a development prototype using fictional sample data. Its features and requirements are subject to feedback and validation from SquareOne.

## Developer

Oluwapelumi Omidiji

SquareOne Software Development Program
