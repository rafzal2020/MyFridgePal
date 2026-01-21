# MyFridgePal 🥗📱

**MyFridgePal** is a smart, AI-powered kitchen assistant that helps you track your inventory, minimize food waste, and hit your nutrition goals.

Using **Google's Gemini AI**, it analyzes your fridge's contents to provide health scores, personalized dietary advice, and recipe suggestions based on ingredients you *actually* have.

![Dashboard Demo](https://github.com/rafzal2020/MyFridgePal/blob/main/dashboard_demo.png "Main Dashboard Menu")

## ✨ Features

### 📦 Smart Inventory
- **Track Items**: Manage quantities, expiration dates, and notes.
- **OCR Scanning**: Upload a photo of a nutrition label to auto-fill macros (Calories, Protein, customized via AI).
- **Expiration Alerts**: Visual indicators (Yellow/Red) for items going bad soon.

### 🧠 AI Nutrition Intelligence
- **Health Report**: Get a 1-10 "Health Score" for your fridge with detailed pros/cons analysis.
- **Goal Coach**: Tell the AI your goal (e.g., "Muscle Gain" or "Low Sugar"), and it will tell you what to **Eat**, **Avoid**, and **Buy** from your current stock.
- **Macro Tracking**: Visual charts for Protein, Carbs, Fat, and Sugar across your entire inventory.

### 👨‍🍳 Recipe Finder
- **Inventory-Based**: Generates recipes using *only* or *mostly* what you have to reduce waste.
- **"Can Make Now"**: Filter for recipes that require 0 extra ingredients.
- **Bookmarking**: Save your favorite AI-generated recipes to your personal cookbook.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts.
- **Backend**: FastAPI (Python), SQLAlchemy, SQLite.
- **AI**: Google Gemini (via `google-genai` SDK), utilizing `gemini-2.0-flash` for high-speed analysis.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.9+
- A [Google Gemini API Key](https://aistudio.google.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/rafzal2020/MyFridgePal.git
cd MyFridgePal
```

### 2. Backend Setup
Navigate to the backend folder:
```bash
cd backend
```

Create a virtual environment (optional but recommended):
```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

**Configuration**:
Create a `.env` file in the `backend` directory and add your API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

Run the server:
```bash
uvicorn main:app --reload
```
The API will run at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal and navigate to the frontend:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
Open `http://localhost:3000` to see the app!

## 🤝 Contributing
Feel free to open issues or submit PRs if you have ideas for new features!

## 📜 License
MIT License.
