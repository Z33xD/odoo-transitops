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


@bp.route('/dispatch', methods=['POST'])
def dispatch_trip():
    data = request.get_json()
    source = data.get('source')
    destination = data.get('destination')
    vehicle_id = data.get('vehicle_id')
    driver_id = data.get('driver_id')
    cargo_weight = data.get('cargo_weight')

    if not all([source, destination, vehicle_id, driver_id, cargo_weight is not None]):
        return jsonify({'error': 'source, destination, vehicle_id, driver_id, cargo_weight are required'}), 400

    with get_db() as db:
        vehicle = db.execute("SELECT * FROM vehicles WHERE id = ?", (vehicle_id,)).fetchone()
        if not vehicle:
            return jsonify({'error': 'Invalid vehicle selection'}), 400
        if vehicle['status'] in ('In Shop', 'Retired'):
            return jsonify({'error': f"Vehicle {vehicle['registration_number']} is currently In Shop or Retired"}), 400

        driver = db.execute("SELECT * FROM drivers WHERE id = ?", (driver_id,)).fetchone()
        if not driver:
            return jsonify({'error': 'Invalid driver selection'}), 400
        if driver['status'] in ('Suspended', 'Off Duty'):
            return jsonify({'error': f"Driver {driver['name']} is currently Off Duty or Suspended"}), 400

        if cargo_weight > vehicle['max_load_capacity']:
            return jsonify({'error': f"Overweight Alert: Cargo Weight exceeds max load capacity ({vehicle['max_load_capacity']} lbs)"}), 400

        planned_distance = round(100 + __import__('random').random() * 800)

        cur = db.execute(
            "INSERT INTO trips (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status) VALUES (?, ?, ?, ?, ?, ?, 'Dispatched')",
            (source, destination, vehicle_id, driver_id, cargo_weight, planned_distance)
        )
        db.execute("UPDATE vehicles SET status = 'On Trip' WHERE id = ?", (vehicle_id,))
        db.execute("UPDATE drivers SET status = 'On Trip' WHERE id = ?", (driver_id,))

        row = db.execute("SELECT * FROM trips WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>/complete', methods=['POST'])
def complete_trip(id):
    with get_db() as db:
        trip = db.execute("SELECT * FROM trips WHERE id = ?", (id,)).fetchone()
        if not trip:
            return jsonify({'error': 'Trip not found'}), 404

        db.execute("UPDATE trips SET status = 'Completed' WHERE id = ?", (id,))
        if trip['vehicle_id']:
            db.execute("UPDATE vehicles SET status = 'Available' WHERE id = ?", (trip['vehicle_id'],))
        if trip['driver_id']:
            db.execute("UPDATE drivers SET status = 'Available' WHERE id = ?", (trip['driver_id'],))

        row = db.execute("SELECT * FROM trips WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))
