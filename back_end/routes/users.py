from flask import Blueprint, Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from config import Config  # make sure this imports your DB settings

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

users_bp = Blueprint("users", __name__)
CORS(users_bp)  # Enable CORS for this blueprint too (optional)

# ================= Database Connection Helper =================
def get_db_connection():
    return mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )

# ================= GET ALL USERS =================
@users_bp.route('/', methods=['GET'])
def get_all_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor() 
        query = """
            SELECT 
                User_ID,
                Full_Name,
                Email,
                Username,
                Role,
                Contact_Number,
                Address,
                image_url
            FROM users
        """
        cursor.execute(query)
        users = cursor.fetchall()  # this is now a list of dicts

        cursor.close()
        conn.close()

        return jsonify({"status": "success", "users": users}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ================= DELETE USER =================
@users_bp.route('/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        query = "DELETE FROM users WHERE User_ID = %s"
        cursor.execute(query, (user_id,))
        conn.commit()

        cursor.close()
        conn.close()

        if cursor.rowcount == 0:
            return jsonify({"status": "error", "message": "User not found"}), 404

        return jsonify({"status": "success", "message": f"User {user_id} deleted"}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ================= REGISTER BLUEPRINT =================
app.register_blueprint(users_bp, url_prefix='/users')

if __name__ == "__main__":
    app.run(debug=True)
