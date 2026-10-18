# AutoSphere: Best Cars National Dealership & Customer Reviews Platform

## Repository Details
- **Repository Name:** `dealership-reviews-capstone`
- **Public Repository URL:** [https://github.com/myaz3d/dealership-reviews-capstone](https://github.com/myaz3d/dealership-reviews-capstone)
- **Primary Branch:** `main`

## Descriptive Project Title
**AutoSphere: Enterprise Cloud-Native Car Dealership Directory & Customer Review Portal with AI Sentiment Analysis**

---

## Executive Summary & Overview
**AutoSphere** is a modern, enterprise-grade, full-stack cloud-native web platform developed for **Best Cars Dealership**, a national automobile retailer with branches distributed across the United States. The platform centralizes dealership discovery, car make/model inventory exploration, user authentication, customer review submission, and automated sentiment analysis in real time.

Built on a robust microservices architecture, AutoSphere decouples frontend presentation from backend persistence and analytical services, leveraging Docker containerization, Kubernetes orchestration, and continuous integration/continuous delivery (CI/CD) pipelines.

---

## Architecture & Technology Stack

```
                                  +---------------------------------------+
                                  |         Client Web Browser            |
                                  |   (React 18 SPA + Bootstrap 5 UI)    |
                                  +-------------------+-------------------+
                                                      |
                                                      | HTTP / JSON (Port 8000)
                                                      v
                                  +---------------------------------------+
                                  |       Django Web Backend & Proxy      |
                                  |     (Python 3.11 / Django 5.x)       |
                                  +---------+-------------------+---------+
                                            |                   |
                     REST Proxy (Port 3030) |                   | REST Sentiment API (Port 5050)
                                            v                   v
                     +--------------------------+   +-------------------------------+
                     | Node.js / Express Server |   | Python Flask Microservice     |
                     | (MongoDB Mongoose ODM)   |   | (NLTK VADER Sentiment Analyzer)
                     +-------------+------------+   +-------------------------------+
                                   |
                                   v
                     +--------------------------+
                     | MongoDB Database         |
                     | (Dealerships & Reviews)  |
                     +--------------------------+
```

### 1. Frontend Layer
- **React.js 18 & Vanilla JavaScript (ES6+)**: Single-Page Application (SPA) components for dynamic rendering (`Dealers`, `DealerDetail`, `PostReview`, `Register`, `Login`, `Navbar`).
- **Bootstrap 5 & Custom CSS**: Responsive design system, modern cards, badge indicators, and navigation components.
- **Static Assets**: High-performance static HTML pages for `About Us` and `Contact Us`.

### 2. Primary Backend & Proxy Layer
- **Django 5.x / Python 3.11**: Handles user authentication (session/token management), admin site management, relational vehicle catalog models (`CarMake`, `CarModel`), and API reverse-proxying.
- **SQLite Database**: Relational datastore for car makes, models, and administrative user credentials.

### 3. Database & Inventory Microservice
- **Node.js & Express.js**: High-throughput REST API serving dealership branch coordinates, state filtering, and customer reviews.
- **MongoDB & Mongoose ODM**: Document database storing nationwide dealership profiles and review records.

### 4. AI Sentiment Analysis Microservice
- **Python Flask & NLTK (Natural Language Toolkit)**: VADER sentiment analysis engine analyzing incoming review texts to classify sentiments as `positive`, `neutral`, or `negative`.

### 5. DevOps, Containerization & CI/CD
- **Docker & Docker Compose**: Multi-container service definitions for local development and staging environments.
- **Kubernetes**: Production deployment manifests with declarative service definitions.
- **GitHub Actions**: Automated continuous integration running linting (`flake8`), code formatting checks, and automated tests.

---

## Key Features

1. **Nationwide Dealership Directory**:
   - Filter dealerships by state dynamically via interactive dropdowns.
   - Search and explore branch locations, addresses, zip codes, and state affiliations.

2. **Customer Review Ecosystem & Sentiment Badges**:
   - Comprehensive customer reviews displayed per dealership branch.
   - Real-time sentiment extraction labeling reviews as Positive, Neutral, or Negative with visual badges.

3. **Secure User Authentication & Session Management**:
   - User registration with validation (`Username`, `First Name`, `Last Name`, `Email`, `Password`).
   - Secure login, session persistence, and instant logout alerts.
   - Role-based permissions: anonymous users browse dealerships and reviews; authenticated users post reviews.

4. **Car Inventory & Model Management**:
   - Relational database schema linking Car Makes (e.g., Toyota, Honda, Ford, BMW, Audi) with multiple Car Models.
   - Comprehensive Django Admin portal for dealership fleet management.

---

## API Endpoints Reference

| Service | Method | Endpoint | Description |
|---|---|---|---|
| **Django** | `POST` | `/djangoapp/login` | Authenticate user credentials |
| **Django** | `GET` | `/djangoapp/logout` | Terminate user session |
| **Django** | `POST` | `/djangoapp/register` | Register new user account |
| **Django** | `GET` | `/djangoapp/get_cars` | Retrieve all car makes and models |
| **Django** | `GET` | `/djangoapp/get_dealers` | Proxy all dealerships |
| **Django** | `GET` | `/djangoapp/get_dealers/<state>` | Proxy dealerships filtered by state |
| **Django** | `GET` | `/djangoapp/dealer/<id>` | Proxy specific dealership details |
| **Django** | `GET` | `/djangoapp/reviews/dealer/<id>` | Proxy reviews with sentiment scores |
| **Django** | `POST` | `/djangoapp/add_review` | Submit new customer review |
| **Node/Express** | `GET` | `/fetchDealers` | Fetch all dealership documents |
| **Node/Express** | `GET` | `/fetchDealers/:state` | Fetch dealerships by US state |
| **Node/Express** | `GET` | `/fetchDealer/:id` | Fetch dealership by ID |
| **Node/Express** | `GET` | `/fetchReviews/dealer/:id` | Fetch reviews by dealer ID |
| **Node/Express** | `POST` | `/insert_review` | Insert new review document |
| **Flask Microservice** | `GET` | `/analyze/<input_txt>` | Analyze sentiment of input string |

---

## Local Development & Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Docker and Docker Compose (optional for containerized deployment)

### 1. Setup Django Backend
```bash
cd server
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py shell < djangoapp/populate.py
python manage.py runserver 8000
```

### 2. Setup Node.js / Express Microservice
```bash
cd server/database
npm install
node app.js
```

### 3. Setup Sentiment Analyzer Microservice
```bash
cd server/djangoapp/microservices
pip install -r requirements.txt
python app.py
```

### 4. Setup React Frontend
```bash
cd server/frontend
npm install
npm run build
```

---

## Continuous Integration & Deployment

The repository includes automated GitHub Actions workflows located in `.github/workflows/main.yml` that validate Python code quality using `flake8`, verify JavaScript packaging, and test microservices integration.

---

## Authors & Acknowledgments
- **Lead Developer:** Mohd Yazid Bin Mohd Halim ([@myaz3d](https://github.com/myaz3d))
- **Course:** IBM Full Stack Software Developer Capstone Project
- **Organization:** IBM Developer Skills Network & Coursera