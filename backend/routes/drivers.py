from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('drivers', __name__, url_prefix='/api/drivers')


@bp.route('/', methods=['GET'])
def list_drivers():
    with get_db() as db:
        rows = db.execute("SELECT * FROM drivers ORDER BY id").fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_driver(id):
    with get_db() as db:
        row = db.execute("SELECT * FROM drivers WHERE id = ?", (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_driver():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            """INSERT INTO drivers
               (name, license_number, license_category, license_expiry_date,
                contact_number, safety_score, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data['name'], data['license_number'],
             data.get('license_category'),
             data.get('license_expiry_date'),
             data.get('contact_number'),
             data.get('safety_score', 100.0),
             data.get('status', 'Available'))
        )
        row = db.execute("SELECT * FROM drivers WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_driver(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM drivers WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            """UPDATE drivers SET
               name = ?, license_number = ?, license_category = ?,
               license_expiry_date = ?, contact_number = ?,
               safety_score = ?, status = ?
               WHERE id = ?""",
            (data.get('name', existing['name']),
             data.get('license_number', existing['license_number']),
             data.get('license_category', existing['license_category']),
             data.get('license_expiry_date', existing['license_expiry_date']),
             data.get('contact_number', existing['contact_number']),
             data.get('safety_score', existing['safety_score']),
             data.get('status', existing['status']),
             id)
        )
        row = db.execute("SELECT * FROM drivers WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_driver(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM drivers WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM drivers WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
