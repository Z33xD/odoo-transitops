from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('roles', __name__, url_prefix='/api/roles')


@bp.route('/', methods=['GET'])
def list_roles():
    with get_db() as db:
        rows = db.execute("SELECT * FROM roles ORDER BY id").fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_role(id):
    with get_db() as db:
        row = db.execute("SELECT * FROM roles WHERE id = ?", (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_role():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO roles (name, description) VALUES (?, ?)",
            (data['name'], data.get('description'))
        )
        row = db.execute("SELECT * FROM roles WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_role(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM roles WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            "UPDATE roles SET name = ?, description = ? WHERE id = ?",
            (data.get('name', existing['name']),
             data.get('description', existing['description']),
             id)
        )
        row = db.execute("SELECT * FROM roles WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_role(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM roles WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM roles WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
