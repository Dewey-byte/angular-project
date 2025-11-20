import MySQLdb
from flask import Blueprint, request, jsonify
from flask_cors import CORS, cross_origin
from database.connection import get_db
from flask_bcrypt import Bcrypt

user = Blueprint("user", __name__)
bcrypt = Bcrypt()  # Initialize Bcrypt

@user.route("/register", methods=["POST", "OPTIONS"])
def register():
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS OK"}), 200

    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    contact_number = data.get("contact_number")
    address = data.get("address")

    # Hash the password using Flask-Bcrypt
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    conn = get_db()
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("""
        INSERT INTO Users (Full_Name, Email, Username, Password, Contact_Number, Address)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (full_name, email, username, hashed_password, contact_number, address))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"success": True, "message": "User registered successfully"}), 201
