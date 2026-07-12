from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('users', __name__, url_prefix='/api/users')


@bp.route('/', methods=['GET'])
def list_users():
    with get_db() as db:
        rows = db.execute("""
            SELECT u.*, r.name AS role_name
            FROM users u
            LEFT JOIN roles r ON r.id = u.role_id
            ORDER BY u.id
        """).fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_user(id):
    with get_db() as db:
        row = db.execute("""
            SELECT u.*, r.name AS role_name
            FROM users u
            LEFT JOIN roles r ON r.id = u.role_id
            WHERE u.id = ?
        """, (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_user():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO users (email, password_hash, name, role_id) VALUES (?, ?, ?, ?)",
            (data['email'], data['password_hash'], data['name'], data['role_id'])
        )
        row = db.execute("SELECT * FROM users WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM users WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            "UPDATE users SET email = ?, password_hash = ?, name = ?, role_id = ? WHERE id = ?",
            (data.get('email', existing['email']),
             data.get('password_hash', existing['password_hash']),
             data.get('name', existing['name']),
             data.get('role_id', existing['role_id']),
             id)
        )
        row = db.execute("SELECT * FROM users WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_user(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM users WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM users WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
