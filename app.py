from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_session import Session
from flask_bcrypt import Bcrypt
from datetime import datetime
import os
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'din-hemmelige-nogle-her-skift-den'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
CORS(app)
Session(app)
bcrypt = Bcrypt(app)

database_url = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:password@mariadb:3306/travel_db')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    @property
    def password(self):
        raise AttributeError('password not readable')
    
    @password.setter
    def password(self, plain_password):
        self.password_hash = bcrypt.generate_password_hash(plain_password).decode('utf-8')
    
    def verify_password(self, plain_password):
        return bcrypt.check_password_hash(self.password_hash, plain_password)

class TravelDestination(db.Model):
    __tablename__ = 'travel_destination'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(100))
    country = db.Column(db.String(50))
    date_from = db.Column(db.String(20))
    date_to = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

def init_db():
    for i in range(5):
        try:
            with app.app_context():
                db.create_all()
                print("Database tabeller oprettet")
                return
        except Exception as e:
            print(f"Forsøg {i+1}/5 fejlede: {e}")
            time.sleep(3)

init_db()

@app.route('/')
def index():
    return render_template('index.html', logged_in='user_id' in session)

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/signup')
def signup_page():
    return render_template('signup.html')

@app.route('/create')
def create_page():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('create.html', logged_in=True)

@app.route('/destination/<int:id>')
def destination_page(id):
    return render_template('destination.html', logged_in='user_id' in session)

@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    if 'user_id' not in session:
        return jsonify([])
    dests = TravelDestination.query.filter_by(user_id=session['user_id']).all()
    return jsonify([{
        'id': d.id, 'title': d.title, 'location': d.location,
        'country': d.country, 'date_from': d.date_from, 'date_to': d.date_to
    } for d in dests])

@app.route('/api/destinations/<int:id>', methods=['GET'])
def get_destination(id):
    d = TravelDestination.query.get_or_404(id)
    if 'user_id' not in session or d.user_id != session['user_id']:
        return jsonify({'error': 'Not authorized'}), 403
    return jsonify({
        'id': d.id, 'title': d.title, 'description': d.description,
        'location': d.location, 'country': d.country,
        'date_from': d.date_from, 'date_to': d.date_to
    })

@app.route('/api/destinations', methods=['POST'])
def create_destination():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    data = request.json
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    d = TravelDestination(
        title=data['title'], description=data.get('description',''),
        location=data.get('location',''), country=data.get('country',''),
        date_from=data.get('date_from'), date_to=data.get('date_to'),
        user_id=session['user_id']
    )
    try:
        db.session.add(d)
        db.session.commit()
        return jsonify({'message': 'Created', 'id': d.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/destinations/<int:id>', methods=['PUT'])
def update_destination(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    d = TravelDestination.query.get_or_404(id)
    if d.user_id != session['user_id']:
        return jsonify({'error': 'You can only update your own destinations'}), 403
    data = request.json
    if not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400
    d.title = data.get('title', d.title)
    d.description = data.get('description', d.description)
    d.location = data.get('location', d.location)
    d.country = data.get('country', d.country)
    d.date_from = data.get('date_from', d.date_from)
    d.date_to = data.get('date_to', d.date_to)
    try:
        db.session.commit()
        return jsonify({'message': 'Updated'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/destinations/<int:id>', methods=['DELETE'])
def delete_destination(id):
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'}), 401
    d = TravelDestination.query.get_or_404(id)
    if d.user_id != session['user_id']:
        return jsonify({'error': 'You can only delete your own destinations'}), 403
    try:
        db.session.delete(d)
        db.session.commit()
        return jsonify({'message': 'Deleted'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username exists'}), 400
    user = User(username=data['username'], password=data['password'])
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User created'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username')).first()
    if user and user.verify_password(data.get('password')):
        session['user_id'] = user.id
        session['username'] = user.username
        return jsonify({'message': 'Login successful', 'user_id': user.id, 'username': user.username})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)