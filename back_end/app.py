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
from routes.checkout_steps import checkout_steps_bp
from config import Config
import os

# --------------------------- Initialize Flask app ---------------------------
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY  # JWT secret key

# Initialize Bcrypt for password hashing
bcrypt.init_app(app)

# Enable CORS globally for frontend (Angular at localhost:4200)
CORS(app, resources={r"/*": {"origins": "http://localhost:4200"}}, supports_credentials=True)

# Initialize JWT manager
jwt = JWTManager(app)

# --------------------------- Register Blueprints ---------------------------
# Each module (auth, user, profile, cart, products, orders, order details, inventory log) 
# is registered as a blueprint with a URL prefix
app.register_blueprint(auth, url_prefix="/auth")
app.register_blueprint(user, url_prefix="/user")
app.register_blueprint(profile, url_prefix="/profile")
app.register_blueprint(cart, url_prefix="/cart")
app.register_blueprint(products_bp, url_prefix="/products")
app.register_blueprint(orders_bp, url_prefix="/orders")
app.register_blueprint(order_details_bp, url_prefix="/order_details")
app.register_blueprint(inventory_log_bp, url_prefix="/inventory_log")
app.register_blueprint(checkout_steps_bp, url_prefix="/checkout")

# --------------------------- Serve Uploaded Images ---------------------------
# Ensure the uploads folder exists
UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    """
    Serve uploaded images so the frontend can access them.
    Example: http://localhost:5000/uploads/image.jpg
    """
    return send_from_directory("uploads", filename)

# --------------------------- Default Route ---------------------------
@app.route("/")
def home():
    """
    Default route to test if backend is running
    """
    return {"message": "Backend is running!"}

# --------------------------- Run App ---------------------------
if __name__ == "__main__":
    app.run(debug=True)
