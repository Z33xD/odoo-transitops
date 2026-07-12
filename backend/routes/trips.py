from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('trips', __name__, url_prefix='/api/trips')


@bp.route('/', methods=['GET'])
def list_trips():
    with get_db() as db:
        rows = db.execute("""
            SELECT t.*, v.registration_number AS vehicle_reg, d.name AS driver_name
            FROM trips t
            LEFT JOIN vehicles v ON v.id = t.vehicle_id
            LEFT JOIN drivers d ON d.id = t.driver_id
            ORDER BY t.id
        """).fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_trip(id):
    with get_db() as db:
        row = db.execute("""
            SELECT t.*, v.registration_number AS vehicle_reg, d.name AS driver_name
            FROM trips t
            LEFT JOIN vehicles v ON v.id = t.vehicle_id
            LEFT JOIN drivers d ON d.id = t.driver_id
            WHERE t.id = ?
        """, (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_trip():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            """INSERT INTO trips
               (source, destination, vehicle_id, driver_id, cargo_weight,
                planned_distance, actual_distance, odometer_start,
                odometer_end, fuel_consumed, revenue, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (data['source'], data['destination'],
             data.get('vehicle_id'), data.get('driver_id'),
             data.get('cargo_weight'), data.get('planned_distance'),
             data.get('actual_distance'), data.get('odometer_start'),
             data.get('odometer_end'), data.get('fuel_consumed'),
             data.get('revenue', 0),
             data.get('status', 'Draft'))
        )
        row = db.execute("SELECT * FROM trips WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_trip(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM trips WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            """UPDATE trips SET
               source = ?, destination = ?, vehicle_id = ?, driver_id = ?,
               cargo_weight = ?, planned_distance = ?, actual_distance = ?,
               odometer_start = ?, odometer_end = ?, fuel_consumed = ?,
               revenue = ?, status = ?
               WHERE id = ?""",
            (data.get('source', existing['source']),
             data.get('destination', existing['destination']),
             data.get('vehicle_id', existing['vehicle_id']),
             data.get('driver_id', existing['driver_id']),
             data.get('cargo_weight', existing['cargo_weight']),
             data.get('planned_distance', existing['planned_distance']),
             data.get('actual_distance', existing['actual_distance']),
             data.get('odometer_start', existing['odometer_start']),
             data.get('odometer_end', existing['odometer_end']),
             data.get('fuel_consumed', existing['fuel_consumed']),
             data.get('revenue', existing['revenue']),
             data.get('status', existing['status']),
             id)
        )
        row = db.execute("SELECT * FROM trips WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_trip(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM trips WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM trips WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
