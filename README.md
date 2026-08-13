# 🏠 EstateHub — AI-Powered Real Estate Valuation Platform

EstateHub is a full-stack real estate platform that combines property buying/selling with an ensemble Machine Learning model (**HistGradientBoosting**, **RandomForest**, and **VotingRegressor**) achieving **96.30% $R^2$ valuation accuracy** ($MAPE = 7.69\%$) across Tier-1 and Tier-2 Indian metro cities.

---

## 🌟 Key Features

* **🤖 AI Price Prediction**: Instant automated property valuation based on location tier, floor premium, builder reputation, age decay, road width, and amenity density.
* **👤 Multi-Role Dashboard Systems**:
  * **Admin**: Platform oversight, user management, system metrics, property approvals, ML engine telemetry.
  * **Seller**: Property listing creation with drag-and-drop images, analytics, inquiry management, AI price estimator.
  * **Buyer**: Smart search filtering, interactive Leaflet maps, saved wishlist, budget capacity calculator, inquiry messaging.
* **🔐 Security & Production Ready**: JWT authentication with refresh token rotation, CORS filtering, rate limiting, and security headers.
* **📖 Interactive API Documentation**: Swagger UI (`/swagger/`) and ReDoc (`/redoc/`).

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Chart.js, React-Leaflet |
| **Backend** | Python 3.12, Django 4.2 REST Framework |
| **Database** | SQLite3 (Django ORM) & PyMongo (MongoDB Prediction Telemetry) |
| **Machine Learning** | Scikit-Learn (HistGradientBoostingRegressor, VotingRegressor), Pandas, NumPy |
| **Auth** | djangorestframework-simplejwt (JWT Access/Refresh tokens) |

---

## 🔑 Demo Accounts & Credentials

Run `python seed_data.py` inside `backend/` to populate these test accounts:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| 🔴 **Admin** | `admin@estatehub.ai` | `Admin@12345` | Platform metrics, user delete/management, ML telemetry |
| 🟢 **Seller** | `seller@test.com` | `Test@12345` | Add/edit properties, manage buyer inquiries, price estimator |
| 🔵 **Buyer** | `buyer@test.com` | `Test@12345` | Browse properties, send inquiries, wishlist, budget calculator |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.10+**
* **Node.js 18+**

---

### 1️⃣ Backend Setup (Django REST)

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
.\venv\Scripts\activate      # Windows
# source venv/bin/activate   # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed data
python manage.py migrate
python seed_data.py

# Start Django development server
python manage.py runserver
```
Backend server will run at: `http://localhost:8000`

---

### 2️⃣ Frontend Setup (Vite React)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend application will run at: `http://localhost:5173`

---

## 🤖 ML Model Training

To retrain the ML model on new dataset distributions:

```bash
cd backend
python ml_scripts/train_model.py
```
Model artifacts will be generated in `backend/ml_scripts/models/` (`model.pkl`, `scaler.pkl`, `encoders.pkl`, `feature_cols.pkl`).

---

## 📂 Project Structure

```text
Real-Estate/
├── backend/
│   ├── authentication/      # JWT auth, user profile, OTP reset
│   ├── properties/          # Property listings, media uploads, seller stats
│   ├── inquiries/           # Buyer-seller messaging system
│   ├── cities/              # Metro city seed data & search filters
│   ├── ml_engine/           # Real-time ML prediction inference service
│   ├── ml_scripts/          # Dataset generator & ML model trainer pipeline
│   ├── core/                # Project settings, URLs, security config
│   ├── seed_data.py         # One-click database seeder
│   ├── .env.example         # Production environment template
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Navbar, Modals, StatCards)
│   │   ├── context/         # AuthContext state manager
│   │   ├── pages/           # Admin, Seller, Buyer & Public pages
│   │   ├── services/        # Axios API client services
│   │   └── utils/           # Formatters & helper utilities
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---


