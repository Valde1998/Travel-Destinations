from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import time

app = Flask(__name__)
CORS(app)

# Database konfiguration
database_url = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:password@mariadb:3306/travel_db')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_pre_ping': True,
    'pool_recycle': 3600,
}

db = SQLAlchemy(app)

# ------------------- DATABASE MODELLER -------------------
class User(db.Model):
    __tablename__ = 'user'  # Explicit table name
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    destinations = db.relationship('TravelDestination', backref='user', lazy=True)

class TravelDestination(db.Model):
    __tablename__ = 'travel_destination'  # Explicit table name
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100))
    country = db.Column(db.String(50))
    date_from = db.Column(db.String(20))
    date_to = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

# ------------------- DATABASE INITIALIZERING -------------------
def init_db():
    """Opretter tabeller med retry hvis databasen ikke er klar"""
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            with app.app_context():
                db.create_all()
                print("✅ Database tabeller oprettet/verificeret!")
                
                # Tjek om tabellerne faktisk findes
                inspector = db.inspect(db.engine)
                tables = inspector.get_table_names()
                print(f"📊 Tabeller i databasen: {tables}")
                
                return True
        except Exception as e:
            retry_count += 1
            print(f"⚠️ Forsøg {retry_count}/{max_retries} fejlede: {e}")
            if retry_count < max_retries:
                print("⏳ Venter 3 sekunder før nyt forsøg...")
                time.sleep(3)
            else:
                print("❌ Kunne ikke oprette tabeller efter 5 forsøg")
                return False

# Kør database initialisering
init_db()

# ------------------- ALLE RUTER -------------------
@app.route('/destinations', methods=['GET'])
def get_destinations():
    destinations = TravelDestination.query.all()
    return jsonify([{
        'id': d.id,
        'title': d.title,
        'location': d.location,
        'country': d.country,
        'date_from': d.date_from,
        'date_to': d.date_to
    } for d in destinations])

@app.route('/destinations/<int:id>', methods=['GET'])
def get_destination(id):
    dest = TravelDestination.query.get_or_404(id)
    return jsonify({
        'id': dest.id,
        'title': dest.title,
        'description': dest.description,
        'location': dest.location,
        'country': dest.country,
        'date_from': dest.date_from,
        'date_to': dest.date_to
    })

@app.route('/destinations', methods=['POST'])
def create_destination():
    data = request.json
    
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    dest = TravelDestination(
        title=data['title'],
        description=data.get('description', ''),
        location=data.get('location', ''),
        country=data.get('country', ''),
        date_from=data.get('date_from'),
        date_to=data.get('date_to')
    )
    
    try:
        db.session.add(dest)
        db.session.commit()
        return jsonify({'message': 'Destination created successfully!', 'id': dest.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/destinations/<int:id>', methods=['PUT'])
def update_destination(id):
    dest = TravelDestination.query.get_or_404(id)
    data = request.json
    
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    
    dest.title = data.get('title', dest.title)
    dest.description = data.get('description', dest.description)
    dest.location = data.get('location', dest.location)
    dest.country = data.get('country', dest.country)
    dest.date_from = data.get('date_from', dest.date_from)
    dest.date_to = data.get('date_to', dest.date_to)
    
    try:
        db.session.commit()
        return jsonify({'message': 'Destination updated successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/destinations/<int:id>', methods=['DELETE'])
def delete_destination(id):
    dest = TravelDestination.query.get_or_404(id)
    
    try:
        db.session.delete(dest)
        db.session.commit()
        return jsonify({'message': 'Destination deleted successfully!'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    existing_user = User.query.filter_by(username=data['username']).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400
    
    user = User(
        username=data['username'],
        password=data['password']
    )
    
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User created successfully!', 'user_id': user.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    
    user = User.query.filter_by(username=data.get('username')).first()
    
    if user and user.password == data.get('password'):
        return jsonify({
            'message': 'Login successful',
            'user_id': user.id,
            'username': user.username
        })
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)