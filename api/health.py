import json

def handler(request):
    # Handle both method access styles
    method = getattr(request, 'method', request.get('method', 'GET'))
    
    if method != 'GET':
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "Method not allowed"})
        }

    return {
        "statusCode": 200,
        "body": json.dumps({"status": "ok"})
    }