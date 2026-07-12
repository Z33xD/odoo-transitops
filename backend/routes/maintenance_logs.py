from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('maintenance_logs', __name__, url_prefix='/api/maintenance-logs')


@bp.route('/', methods=['GET'])
def list_maintenance_logs():
    with get_db() as db:
        rows = db.execute("""
            SELECT m.*, v.registration_number AS vehicle_reg
            FROM maintenance_logs m
            LEFT JOIN vehicles v ON v.id = m.vehicle_id
            ORDER BY m.id
        """).fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_maintenance_log(id):
    with get_db() as db:
        row = db.execute("""
            SELECT m.*, v.registration_number AS vehicle_reg
            FROM maintenance_logs m
            LEFT JOIN vehicles v ON v.id = m.vehicle_id
            WHERE m.id = ?
        """, (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_maintenance_log():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            """INSERT INTO maintenance_logs
               (vehicle_id, description, start_date, end_date, cost, status)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (data['vehicle_id'], data['description'],
             data['start_date'], data.get('end_date'),
             data.get('cost', 0), data.get('status', 'Open'))
        )
        row = db.execute("SELECT * FROM maintenance_logs WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_maintenance_log(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM maintenance_logs WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            """UPDATE maintenance_logs SET
               vehicle_id = ?, description = ?, start_date = ?,
               end_date = ?, cost = ?, status = ?
               WHERE id = ?""",
            (data.get('vehicle_id', existing['vehicle_id']),
             data.get('description', existing['description']),
             data.get('start_date', existing['start_date']),
             data.get('end_date', existing['end_date']),
             data.get('cost', existing['cost']),
             data.get('status', existing['status']),
             id)
        )
        row = db.execute("SELECT * FROM maintenance_logs WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_maintenance_log(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM maintenance_logs WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM maintenance_logs WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
