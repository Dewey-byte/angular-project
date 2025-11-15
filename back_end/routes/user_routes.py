from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.connection import get_db

user = Blueprint("user", __name__)

@user.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = get_jwt_identity()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT User_ID, Full_Name, Email, Username, Role, Contact_Number, Address
        FROM Users WHERE User_ID = %s
    """, (user_id,))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if result:
        return jsonify({"success": True, "user": result})

    return jsonify({"success": False, "message": "User not found"}), 404
