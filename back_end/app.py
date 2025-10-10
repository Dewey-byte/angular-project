from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
import MySQLdb

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

# Secret key for JWT
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'
jwt = JWTManager(app)

# Database connection
db = MySQLdb.connect(
    host="localhost",
    user="root",
    passwd="",    # your password if any
    db="librotrackdb"
)


# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    fullname = data.get("Full_Name")
    email = data.get("Email")
    username = data.get("Username")
    password = bcrypt.generate_password_hash(data.get("Password")).decode("utf-8")
    contact = data.get("Contact_Number")
    address = data.get("Address")
    role = "Customer"

    cur = db.cursor()
    cur.execute("""
        INSERT INTO Users (Full_Name, Email, Username, Password, Role, Contact_Number, Address)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """, (fullname, email, username, password, role, contact, address))
    db.commit()
    cur.close()

    return jsonify({"message": "User registered successfully!"}), 201


# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("Username")
    password = data.get("Password")

    cur = db.cursor()
    cur.execute("SELECT User_ID, Username, Password, Role FROM Users WHERE Username = %s", (username,))
    user = cur.fetchone()
    cur.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    user_id, username_db, password_db, role = user

    if bcrypt.check_password_hash(password_db, password):
        token = create_access_token(identity={"User_ID": user_id, "Username": username_db, "Role": role})
        return jsonify({"token": token, "Role": role})
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# ---------------- PROTECTED PROFILE ----------------
@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    return jsonify({"message": "Welcome!", "user": current_user})


# ---------------- ROOT ----------------
@app.route("/")
def index():
    return "<h3>Flask API running — use /register or /login endpoints.</h3>"


if __name__ == "__main__":
    app.run(debug=True)
