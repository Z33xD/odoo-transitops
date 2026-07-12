from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')


@bp.route('/', methods=['GET'])
def list_expenses():
    with get_db() as db:
        rows = db.execute("""
            SELECT e.*, v.registration_number AS vehicle_reg
            FROM expenses e
            LEFT JOIN vehicles v ON v.id = e.vehicle_id
            ORDER BY e.id
        """).fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_expense(id):
    with get_db() as db:
        row = db.execute("""
            SELECT e.*, v.registration_number AS vehicle_reg
            FROM expenses e
            LEFT JOIN vehicles v ON v.id = e.vehicle_id
            WHERE e.id = ?
        """, (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_expense():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO expenses (vehicle_id, trip_id, description, amount, date, category) VALUES (?, ?, ?, ?, ?, ?)",
            (data.get('vehicle_id'), data.get('trip_id'),
             data['description'], data['amount'],
             data['date'], data.get('category'))
        )
        row = db.execute("SELECT * FROM expenses WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_expense(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM expenses WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            """UPDATE expenses SET
               vehicle_id = ?, trip_id = ?, description = ?,
               amount = ?, date = ?, category = ?
               WHERE id = ?""",
            (data.get('vehicle_id', existing['vehicle_id']),
             data.get('trip_id', existing['trip_id']),
             data.get('description', existing['description']),
             data.get('amount', existing['amount']),
             data.get('date', existing['date']),
             data.get('category', existing['category']),
             id)
        )
        row = db.execute("SELECT * FROM expenses WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_expense(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM expenses WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM expenses WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
