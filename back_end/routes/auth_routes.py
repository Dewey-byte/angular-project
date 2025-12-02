from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from database.connection import get_db
from utils.hash import check_password
import MySQLdb.cursors

auth = Blueprint("auth", __name__)

@auth.route("/login", methods=["POST", "OPTIONS"])
def login():
    # Handle preflight CORS request
    if request.method == "OPTIONS":
        return '', 200

    # Parse JSON body
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    # Connect to database with dictionary cursor
    conn = get_db()
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)

    # Fetch user information including role
    cursor.execute(
        "SELECT User_ID, Email, Password, Role FROM Users WHERE Email = %s",
        (email,)
    )
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    # If no user found with the given email
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    # Validate password using hashing utility
    if not check_password(user["Password"], password):
        return jsonify({"success": False, "message": "Incorrect password"}), 401

    # Generate JWT token including the role as an additional claim
    token = create_access_token(
        identity=str(user["User_ID"]),
        additional_claims={"role": user["Role"]}   # Role stored inside JWT
    )

    # Successful login response
    return jsonify({
        "success": True,
        "token": token,
        "role": user["Role"],        # Frontend uses this to redirect (admin/user)
        "message": "Login successful"
    }), 200
