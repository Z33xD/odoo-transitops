from flask import Blueprint, request, jsonify
from database import get_db, dict_from_row

bp = Blueprint('vehicle_documents', __name__, url_prefix='/api/vehicle-documents')


@bp.route('/', methods=['GET'])
def list_vehicle_documents():
    with get_db() as db:
        rows = db.execute("""
            SELECT d.*, v.registration_number AS vehicle_reg
            FROM vehicle_documents d
            LEFT JOIN vehicles v ON v.id = d.vehicle_id
            ORDER BY d.id
        """).fetchall()
    return jsonify([dict_from_row(r) for r in rows])


@bp.route('/<int:id>', methods=['GET'])
def get_vehicle_document(id):
    with get_db() as db:
        row = db.execute("""
            SELECT d.*, v.registration_number AS vehicle_reg
            FROM vehicle_documents d
            LEFT JOIN vehicles v ON v.id = d.vehicle_id
            WHERE d.id = ?
        """, (id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(dict_from_row(row))


@bp.route('/', methods=['POST'])
def create_vehicle_document():
    data = request.get_json()
    with get_db() as db:
        cur = db.execute(
            "INSERT INTO vehicle_documents (vehicle_id, document_type, file_path, expiry_date) VALUES (?, ?, ?, ?)",
            (data['vehicle_id'], data['document_type'],
             data.get('file_path'), data.get('expiry_date'))
        )
        row = db.execute("SELECT * FROM vehicle_documents WHERE id = ?", (cur.lastrowid,)).fetchone()
    return jsonify(dict_from_row(row)), 201


@bp.route('/<int:id>', methods=['PUT'])
def update_vehicle_document(id):
    data = request.get_json()
    with get_db() as db:
        existing = db.execute("SELECT * FROM vehicle_documents WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute(
            """UPDATE vehicle_documents SET
               vehicle_id = ?, document_type = ?, file_path = ?, expiry_date = ?
               WHERE id = ?""",
            (data.get('vehicle_id', existing['vehicle_id']),
             data.get('document_type', existing['document_type']),
             data.get('file_path', existing['file_path']),
             data.get('expiry_date', existing['expiry_date']),
             id)
        )
        row = db.execute("SELECT * FROM vehicle_documents WHERE id = ?", (id,)).fetchone()
    return jsonify(dict_from_row(row))


@bp.route('/<int:id>', methods=['DELETE'])
def delete_vehicle_document(id):
    with get_db() as db:
        existing = db.execute("SELECT * FROM vehicle_documents WHERE id = ?", (id,)).fetchone()
        if existing is None:
            return jsonify({'error': 'Not found'}), 404
        db.execute("DELETE FROM vehicle_documents WHERE id = ?", (id,))
    return jsonify({'message': 'Deleted'})
