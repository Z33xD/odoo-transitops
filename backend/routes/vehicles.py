from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('vehicles', __name__, url_prefix='/api/vehicles')


@bp.route('/', methods=['GET'])
def list_vehicles():
    with get_db() as db:
        rows = db.execute("SELECT * FROM vehicles ORDER BY id").fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_vehicle(id):
    with get_db() as db:
        row = db.execute("SELECT * FROM vehicles WHERE id = ?", (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_vehicle():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            """INSERT INTO vehicles
               (registration_number, name_model, type, max_load_capacity,
                current_odometer, acquisition_cost, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (data['registration_number'], data['name_model'], data['type'],
             data['max_load_capacity'],
             data.get('current_odometer', 0),
             data.get('acquisition_cost', 0),
             data.get('status', 'Available'))
        )
        row = db.execute("SELECT * FROM vehicles WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_vehicle(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM vehicles WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            """UPDATE vehicles SET
               registration_number = ?, name_model = ?, type = ?,
               max_load_capacity = ?, current_odometer = ?,
               acquisition_cost = ?, status = ?
               WHERE id = ?""",
            (data.get('registration_number', existing['registration_number']),
             data.get('name_model', existing['name_model']),
             data.get('type', existing['type']),
             data.get('max_load_capacity', existing['max_load_capacity']),
             data.get('current_odometer', existing['current_odometer']),
             data.get('acquisition_cost', existing['acquisition_cost']),
             data.get('status', existing['status']),
             id)
        )
        row = db.execute("SELECT * FROM vehicles WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_vehicle(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM vehicles WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM vehicles WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
