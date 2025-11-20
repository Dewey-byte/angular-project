from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.hash import bcrypt
from routes.auth_routes import auth
from routes.user_routes import user
from routes.profile_routes import profile
from routes.cart import cart   # ✅ FIXED
from config import Config

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY

bcrypt.init_app(app)

# Global CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}}, supports_credentials=True)

jwt = JWTManager(app)

# register blueprints
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(user, url_prefix="/user")
app.register_blueprint(profile, url_prefix="/profile")
app.register_blueprint(cart, url_prefix="/cart")  # now this works

@app.route("/")
def home():
    return {"message": "Backend is running!"}

if __name__ == "__main__":
    app.run(debug=True)
