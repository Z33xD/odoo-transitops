import os
from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from routes.roles import bp as roles_bp
from routes.users import bp as users_bp
from routes.vehicles import bp as vehicles_bp
from routes.drivers import bp as drivers_bp
from routes.trips import bp as trips_bp
from routes.maintenance_logs import bp as maintenance_bp
from routes.fuel_logs import bp as fuel_logs_bp
from routes.expenses import bp as expenses_bp
from routes.vehicle_documents import bp as vehicle_documents_bp
from routes.auth import bp as auth_bp
from routes.reminders import bp as reminders_bp

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')


def create_app():
    app = Flask(__name__, static_folder=None)
    CORS(app)

    app.register_blueprint(roles_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(vehicles_bp)
    app.register_blueprint(drivers_bp)
    app.register_blueprint(trips_bp)
    app.register_blueprint(maintenance_bp)
    app.register_blueprint(fuel_logs_bp)
    app.register_blueprint(expenses_bp)
    app.register_blueprint(vehicle_documents_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(reminders_bp)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path:
            file_path = os.path.join(FRONTEND_DIR, path)
            if os.path.isfile(file_path):
                return send_from_directory(FRONTEND_DIR, path)
        return send_from_directory(FRONTEND_DIR, 'index.html')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
