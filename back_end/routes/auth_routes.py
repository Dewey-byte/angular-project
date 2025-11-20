from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from database.connection import get_db
from utils.hash import check_password
import MySQLdb.cursors

auth = Blueprint("auth", __name__)

@auth.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)

    cursor.execute("SELECT * FROM Users WHERE Username = %s", (username,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    if not check_password(user["Password"], password):
        return jsonify({"success": False, "message": "Incorrect password"}), 401

    # FIX: identity must be a STRING
    token = create_access_token(identity=str(user["User_ID"]))

    return jsonify({
        "success": True,
        "token": token,
        "message": "Login successful"
    }), 200
