from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from database import get_db, dict_from_row

bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400

    with get_db() as db:
        user = db.execute(
            "SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ?",
            (data['email'].strip().lower(),)
        ).fetchone()

    if user is None:
        return jsonify({'error': 'Invalid corporate credentials'}), 401

    if not check_password_hash(user['password_hash'], data['password']):
        return jsonify({'error': 'Invalid corporate credentials'}), 401

    result = {
        'name': user['name'],
        'role': user['role_name']
    }

    if user['role_name'] == 'Driver':
        with get_db() as db:
            driver = db.execute(
                "SELECT id FROM drivers WHERE name = ?", (user['name'],)
            ).fetchone()
            if driver:
                result['driverId'] = driver['id']

    return jsonify(result)
