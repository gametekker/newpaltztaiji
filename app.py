from flask import Flask, request, jsonify, send_from_directory, make_response
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import datetime

from flask_cors import CORS
blob='name1'
count=1
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
        print(f"Request method: {request.method}")  # Debug print
        
        # Handle OPTIONS differently
        if request.method == 'OPTIONS':
            print("Handling OPTIONS request")  # Debug print
            response = make_response()
            response.headers['Access-Control-Allow-Methods'] = 'POST'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
            response.headers['Access-Control-Allow-Origin'] = '*'  # Or your specific origin
            return response, 200  # Explicitly return 200 for OPTIONS
        
        print("Processing non-OPTIONS request")  # Debug print
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(
                jwt=token,
                key=str(app.config['SECRET_KEY']),
                algorithms=["HS256"]
            )
            current_user = users.get(data['email'])
            if not current_user:
                raise Exception('User not found')
            result = f(current_user, *args, **kwargs)
            print(f"Function result: {result}")  # Debug print
            return result
        except Exception as e:
            print(f"Token verification failed: {str(e)}")
            return jsonify({'message': 'Token is invalid'}), 401
        
    return decorated

@app.route('/api/update-class', methods=['POST', 'OPTIONS'])
@token_required
def change(current_user):
    print("NOW2")
    if current_user and current_user['email']=='marthascheo@gmail.com':
        globals()['blob']=f"name{globals()['count']}"
        globals()['count']+=1
        return jsonify({'message': 'Update successful'}), 200  # Add this
    return jsonify({'message': 'Unauthorized'}), 401  # Add this for non-matching users

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
    print("NOW")
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
            'uname': 'root',
            'series': [{
                    "title": blob,
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
                },{
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
                }]
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
    events = {'items':[
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
    ],'uname':'','series':[{
            "title": "Martha's",
            "days": "MWF",
            "date": "2024-12-26T12:30:00",
            "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
            "info": "short desc",
            "full": True,
            "registered": False
        },{
            "title": blob,
            "days": "MWF",
            "date": "2024-12-26T12:30:00",
            "times": [["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"], ["09:00:00", "01:00:00"]],
            "info": "short desc",
            "full": True,
            "registered": False
        }]}
    return jsonify(events)

if __name__ == '__main__':
    app.run(debug=True)

