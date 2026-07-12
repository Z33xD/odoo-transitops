from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('fuel_logs', __name__, url_prefix='/api/fuel-logs')


@bp.route('/', methods=['GET'])
def list_fuel_logs():
    with get_db() as db:
        rows = db.execute("""
            SELECT f.*, v.registration_number AS vehicle_reg
            FROM fuel_logs f
            LEFT JOIN vehicles v ON v.id = f.vehicle_id
            ORDER BY f.id
        """).fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_fuel_log(id):
    with get_db() as db:
        row = db.execute("""
            SELECT f.*, v.registration_number AS vehicle_reg
            FROM fuel_logs f
            LEFT JOIN vehicles v ON v.id = f.vehicle_id
            WHERE f.id = ?
        """, (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_fuel_log():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO fuel_logs (vehicle_id, litres, cost, date, trip_id) VALUES (?, ?, ?, ?, ?)",
            (data['vehicle_id'], data['litres'], data['cost'],
             data['date'], data.get('trip_id'))
        )
        row = db.execute("SELECT * FROM fuel_logs WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_fuel_log(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM fuel_logs WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            """UPDATE fuel_logs SET
               vehicle_id = ?, litres = ?, cost = ?, date = ?, trip_id = ?
               WHERE id = ?""",
            (data.get('vehicle_id', existing['vehicle_id']),
             data.get('litres', existing['litres']),
             data.get('cost', existing['cost']),
             data.get('date', existing['date']),
             data.get('trip_id', existing['trip_id']),
             id)
        )
        row = db.execute("SELECT * FROM fuel_logs WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_fuel_log(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM fuel_logs WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM fuel_logs WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
