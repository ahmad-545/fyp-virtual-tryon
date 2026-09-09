# AI Server (Mock Version for Local System)

This directory contains the FastAPI server for the Virtual Try-On pipeline.
Since you are currently training the model on Kaggle and don't have a high-end GPU locally, this server is designed as a **Mock Server**. It exposes the required API endpoints and simulates the delay of the deep learning models (SAM, SCHP, DensePose, IDM-VTON) so you can build and test your Node.js backend integration immediately.

Once your Kaggle training is done, you can replace the mock code in `main.py` with your actual PyTorch model inference code.

## Requirements

1. Install Python (3.9 or higher recommended).
2. Open a terminal in this `ai_server` folder.

## Installation

Create a virtual environment (optional but recommended):
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the FastAPI server using Uvicorn:
```bash
uvicorn main:app --reload
```
The server will start at `http://localhost:8000`.

## Testing the API
FastAPI automatically generates an interactive documentation page. 
Open your browser and navigate to:
**[http://localhost:8000/docs](http://localhost:8000/docs)**

From there, you can test both the `POST /process-garment` and `POST /try-on` endpoints directly from your browser.
