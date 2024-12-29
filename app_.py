from flask import Flask, request, jsonify, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
import datetime
from flask_cors import CORS
import logging
from datetime import datetime, timedelta
import sys

app = Flask(__name__, static_folder='newpaltztaiji/build/', static_url_path='')

# Set up logging configuration at the top of your file, after imports
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s.%(msecs)03d %(levelname)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler('auth.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app.config['SECRET_KEY'] = 'mysupersecretkey123'

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

# Mock database (replace with your actual database)
users = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            logger.debug(f"Received auth header: {auth_header[:30]}...")  # Log first 30 chars
            # Check if the header starts with 'Bearer '
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                logger.debug(f"Extracted token: {token[:30]}...")  # Log first 30 chars        

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

# Then modify your signup route:
@app.route('/api/signup', methods=['POST'])
def signup():
    logger.info('Received signup request')
    data = request.get_json()
    logger.debug(f"Signup data received: {data.get('email')}")
    
    if not data:
        logger.warning('No data received in signup request')
        return jsonify({'message': 'No data received'}), 400
        
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        logger.warning(f'Missing credentials - email: {bool(email)}, password: {bool(password)}')
        return jsonify({'message': 'Email and password are required'}), 400
    
    if email in users:
        logger.info(f'Signup failed - email already exists: {email}')
        return jsonify({'message': 'Email already registered'}), 400
    
    logger.debug('Generating password hash')
    start_time = datetime.now()
    hashed_password = generate_password_hash(password)
    hash_duration = datetime.now() - start_time
    logger.debug(f'Password hash generated in {hash_duration.total_seconds():.3f} seconds')
    
    users[email] = {
        'email': email,
        'password': hashed_password
    }
    logger.debug(f'User created: {email}')
    
    try:
        start_time = datetime.now()
        token = jwt.encode(
            payload={
                'email': email,
                'exp': datetime.utcnow() + timedelta(hours=24)
            },
            key=str(app.config['SECRET_KEY']),
            algorithm="HS256"
        )
        token_duration = datetime.now() - start_time
        logger.debug(f'Token generated in {token_duration.total_seconds():.3f} seconds')
        
        if isinstance(token, bytes):
            token = token.decode('utf-8')
            
        logger.info(f'Signup successful for user: {email}')
        return jsonify({'token': token})
    except Exception as e:
        logger.error(f'Token generation failed: {str(e)}')
        return jsonify({'message': 'Error during signup'}), 500

# And your login route:
@app.route('/api/login', methods=['POST'])
def login():
    logger.info('Received login request')
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    logger.debug(f'Attempting login for user: {email}')
    
    start_time = datetime.now()
    user = users.get(email)
    if not user:
        logger.warning(f'Login failed - user not found: {email}')
        return jsonify({'message': 'Invalid credentials'}), 401
        
    if not check_password_hash(user['password'], password):
        logger.warning(f'Login failed - invalid password for user: {email}')
        return jsonify({'message': 'Invalid credentials'}), 401
    
    auth_duration = datetime.now() - start_time
    logger.debug(f'Password verification completed in {auth_duration.total_seconds():.3f} seconds')
    
    try:
        start_time = datetime.now()
        token = jwt.encode(
            payload={
                'email': email,
                'exp': datetime.utcnow() + timedelta(hours=24)
            },
            key=str(app.config['SECRET_KEY']),
            algorithm="HS256"
        )
        token_duration = datetime.now() - start_time
        logger.debug(f'Token generated in {token_duration.total_seconds():.3f} seconds')
        
        if isinstance(token, bytes):
            token = token.decode('utf-8')
            
        logger.info(f'Login successful for user: {email}')
        return jsonify({'token': token})
    except Exception as e:
        logger.error(f'Token generation failed: {str(e)}')
        return jsonify({'message': 'Error during login'}), 500

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