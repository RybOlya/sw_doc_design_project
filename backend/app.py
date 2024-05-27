from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from models import db
from routes import register_blueprints

app = Flask(__name__)
app.config.from_object('config.Config')

CORS(app, resources={r"/*": {"origins": "*"}})

jwt = JWTManager(app)

db.init_app(app)
migrate = Migrate(app, db)

register_blueprints(app)

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            app.logger.error('Database connection failed: %s', e)
    app.run(debug=True)
