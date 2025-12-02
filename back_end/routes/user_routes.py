import MySQLdb
from flask import Blueprint, request, jsonify
from flask_cors import CORS, cross_origin
from database.connection import get_db  # MySQL connection helper
from flask_bcrypt import Bcrypt

user = Blueprint("user", __name__)
bcrypt = Bcrypt()  # Initialize Bcrypt for password hashing

# ------------------------------------------------------------------------
# REGISTER USER
# ------------------------------------------------------------------------
@user.route("/register", methods=["POST", "OPTIONS"])
def register():
    """
    Register a new user.
    Accepts JSON data:
        - full_name
        - email
        - username
        - password
        - contact_number
        - address
    Steps:
        1. Handle CORS preflight OPTIONS request
        2. Get data from JSON request
        3. Hash the password using bcrypt
        4. Insert user data into the Users table
        5. Return success message
    """
    # --------------------------- Handle CORS preflight ---------------------------
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS OK"}), 200

    # --------------------------- Get request data ---------------------------
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    contact_number = data.get("contact_number")
    address = data.get("address")

    # --------------------------- Hash the password ---------------------------
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # --------------------------- Insert user into database ---------------------------
    conn = get_db()
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("""
        INSERT INTO Users (Full_Name, Email, Username, Password, Contact_Number, Address)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (full_name, email, username, hashed_password, contact_number, address))

    conn.commit()
    cursor.close()
    conn.close()

    # --------------------------- Return success response ---------------------------
    return jsonify({"success": True, "message": "User registered successfully"}), 201
