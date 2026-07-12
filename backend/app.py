from flask import Flask
from flask_cors import CORS

from routes.roles import bp as roles_bp
from routes.users import bp as users_bp
from routes.vehicles import bp as vehicles_bp
from routes.drivers import bp as drivers_bp
from routes.trips import bp as trips_bp
from routes.maintenance_logs import bp as maintenance_bp
from routes.fuel_logs import bp as fuel_logs_bp
from routes.expenses import bp as expenses_bp
from routes.vehicle_documents import bp as vehicle_documents_bp


def create_app():
    app = Flask(__name__)
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

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
