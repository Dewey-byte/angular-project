from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.hash import bcrypt
from routes.auth_routes import auth
from routes.user_routes import user
from routes.profile_routes import profile
from routes.cart import cart
from routes.products import products_bp
from routes.orders import orders_bp
from routes.order_details import order_details_bp
from routes.inventory_log import inventory_log_bp
from config import Config
import os

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY

bcrypt.init_app(app)

# Global CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}}, supports_credentials=True)

jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(user, url_prefix="/user")
app.register_blueprint(profile, url_prefix="/profile")
app.register_blueprint(cart, url_prefix="/cart")
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(orders_bp, url_prefix="/orders")
app.register_blueprint(order_details_bp, url_prefix="/order_details")
app.register_blueprint(inventory_log_bp, url_prefix="/inventory_log")




# Serve uploaded images
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)

@app.route("/")
def home():
    return {"message": "Backend is running!"}

if __name__ == "__main__":
    app.run(debug=True)
