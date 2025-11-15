from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.hash import bcrypt
from routes.auth_routes import auth
from routes.user_routes import user
from config import Config

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY

bcrypt.init_app(app)
CORS(app)
jwt = JWTManager(app)

# register blueprints
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(user, url_prefix="/user")

@app.route("/")
def home():
    return {"message": "Backend is running!"}

if __name__ == "__main__":
    app.run(debug=True)
