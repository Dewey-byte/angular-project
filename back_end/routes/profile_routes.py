import MySQLdb
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

profile = Blueprint("profile", __name__)

def get_db_connection():
    return MySQLdb.connect(
        host="localhost",
        user="root",
        passwd="",
        db="librotrackdb",
        charset="utf8mb4"
    )

@profile.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    
    if request.method == "OPTIONS":
        return jsonify({"message": "CORS OK"}), 200
    
    user_id = get_jwt_identity()
    

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""
        SELECT User_ID, Username, Full_Name, Email, Role, Contact_Number, Address
        FROM Users WHERE User_ID = %s
    """, (user_id,))

    row = cursor.fetchone()
    cursor.close()
    db.close()

    if row:
        return jsonify({
            "User_ID": row[0],
            "Username": row[1],
            "Full_Name": row[2],
            "Email": row[3],
            "Role": row[4],
            "Contact_Number": row[5],
            "Address": row[6],
        })

    return jsonify({"error": "User not found"}), 404
