from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import datetime

from flask_cors import CORS

app = Flask(__name__, static_folder='.', static_url_path='')

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# Add this debug print
print("Setting up CORS...")

# Most permissive CORS setup for debugging
CORS(app, 
     resources={r"/*": {  # Notice this is /* not /api/*
         "origins": ["http://localhost:3000"],
         "methods": ["GET", "POST", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization"],
         "expose_headers": ["Content-Type", "Authorization"],
         "supports_credentials": True,
         "send_wildcard": False  # Important for credentials
     }})

# Add another print to confirm
print("CORS setup complete")
# Mock database (replace with your actual database)
users = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            # Check if the header starts with 'Bearer '
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode the token with the same parameters used for encoding
            data = jwt.decode(
                jwt=token,
                key=str(app.config['SECRET_KEY']),
                algorithms=["HS256"]
            )
            current_user = users.get(data['email'])
            if not current_user:
                raise Exception('User not found')
        except Exception as e:
            print(f"Token verification failed: {str(e)}")  # Debug print
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print("Received signup data:", data)
    
    if not data:
        return jsonify({'message': 'No data received'}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email:
        return jsonify({'message': 'Email is required'}), 400
    if not password:
        return jsonify({'message': 'Password is required'}), 400
    
    if email in users:
        return jsonify({'message': 'Email already registered'}), 400
    
    hashed_password = generate_password_hash(password)
    users[email] = {
        'email': email,
        'password': hashed_password
    }
    
    # Make sure to pass a string as the secret key
    token = jwt.encode(
        payload={
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        key=str(app.config['SECRET_KEY']),  # Ensure it's a string
        algorithm="HS256"
    )
    
    # If token is returned as bytes, decode it
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    
    return jsonify({'token': token})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = users.get(email)
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = jwt.encode(
        payload={
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        key=str(app.config['SECRET_KEY']),  # Ensure it's a string
        algorithm="HS256"
    )
    
    # If token is returned as bytes, decode it
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    
    return jsonify({'token': token})

@app.route('/api/verify-token')
@token_required
def verify_token(current_user):
    return jsonify({'email': current_user['email']})

@app.route('/api/user')
@token_required
def get_user(current_user):
    if current_user['email']=='marthascheo@gmail.com':
        events = {
            'items': [
                {
                    "title": "Morning Meeting",
                    "days": "MWF",
                    "date": "2024-12-24T10:00:00",
                    "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                    "info": "short desc",
                    "full": True,
                    "registered": False,
                    "students_signed_up": [
                        {"id": "student-0", "name": "ellie"},
                        {"id": "student-1", "name": "andreas"}
                    ]
                },
                {
                    "title": "Class",
                    "days": "MWF",
                    "date": "2024-12-24T12:30:00",
                    "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                    "info": "short desc",
                    "full": False,
                    "registered": False,
                    "students_signed_up": [
                        {"id": "student-0", "name": "shalini"},
                        {"id": "student-1", "name": "anjuli"}
                    ]
                },
                {
                    "title": "Class",
                    "days": "MWF",
                    "date": "2024-12-25T09:00:00",
                    "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                    "info": "short desc",
                    "full": False,
                    "registered": False,
                    "students_signed_up": [
                        {
                            "id": "student-0",
                            "name": "beavis"
                        },
                        {
                            "id": "student-1",
                            "name": "butthead" 
                        }
                    ]
                },
                {
                    "title": "Lunch with Team",
                    "days": "MWF",
                    "date": "2024-12-25T12:30:00",
                    "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                    "info": "short desc",
                    "full": False,
                    "registered": False,
                    "students_signed_up": [
                        {
                            "id": "student-0",
                            "name": "stan"
                        },
                        {
                            "id": "student-1", 
                            "name": "kristin"
                        }
                    ]
                },
                {
                    "title": "Martha's",
                    "days": "MWF",
                    "date": "2024-12-26T12:30:00",
                    "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                    "info": "short desc",
                    "full": True,
                    "registered": False,
                    "students_signed_up": [
                        {"id": "student-0", "name": "bobby"},
                        {"id": "student-1", "name": "joe"},
                        {"id": "student-2", "name": "rudolph"},
                        {"id": "student-3", "name": "santa"}
                    ]
                }
            ],
            'uname': 'root'
        }
        return events
    else:
        events = {'items':[
            {
                "title": "Morning Meeting",
                "days": "MWF",
                "date": "2024-12-24T10:00:00",
                "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                "info": "short desc",
                "full": True,
                "registered": True
            },
            {
                "title": "Class",
                "days": "MWF",
                "date": "2024-12-24T12:30:00",  # Include time in the date
                "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                "info": "short desc",
                "full": False,
                "registered": True
            },
            {
                "title": "Class",
                "days": "MWF",
                "date": "2024-12-25T09:00:00",
                "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                "info": "short desc",
                "full": False,
                "registered": False
            },
            {
                "title": "Lunch with Team",
                "days": "MWF",
                "date": "2024-12-25T12:30:00",
                "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                "info": "short desc",
                "full": False,
                "registered": False
            },
            {
                "title": "Martha's",
                "days": "MWF",
                "date": "2024-12-26T12:30:00",
                "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
                "info": "short desc",
                "full": True,
                "registered": False
            }
        ],'uname':current_user['email']}

        return jsonify(events)

@app.route('/api/default')
def routeit():
    events = [
        {
            "title": "Morning Meeting",
            "days": "MWF",
            "date": "2024-12-24T10:00:00",
            "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
            "info": "short desc",
            "full": True,
            "registered": False
        },
        {
            "title": "Class",
            "days": "MWF",
            "date": "2024-12-24T12:30:00",  # Include time in the date
            "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
            "info": "short desc",
            "full": False,
            "registered": False
        },
        {
            "title": "Class",
            "days": "MWF",
            "date": "2024-12-25T09:00:00",
            "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
            "info": "short desc",
            "full": False,
            "registered": False
        },
        {
            "title": "Lunch with Team",
            "days": "MWF",
            "date": "2024-12-25T12:30:00",
            "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
            "info": "short desc",
            "full": False,
            "registered": False
        },
        {
            "title": "Martha's",
            "days": "MWF",
            "date": "2024-12-26T12:30:00",
            "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
            "info": "short desc",
            "full": True,
            "registered": False
        }
    ]
    return jsonify(events)

if __name__ == '__main__':
    app.run(debug=True)