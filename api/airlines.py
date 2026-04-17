import json
import pandas as pd
from pathlib import Path

# Load data
ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data" / "processed"

try:
    scores = pd.read_csv(DATA_DIR / "airline_safety_scores.csv")
except Exception as e:
    scores = None
    load_error = str(e)

def handler(request):
    # Handle both method access styles
    method = getattr(request, 'method', request.get('method', 'GET'))
    
    if method != 'GET':
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"})
        }

    try:
        if not scores:
            return {
                "statusCode": 503,
                "body": json.dumps({"error": "Data not loaded"})
            }
        
        response = scores[["airline","safety_score","risk_label",
                           "total_incidents","total_fatalities"]].to_dict(orient="records")

        return {
            "statusCode": 200,
            "body": json.dumps(response)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }