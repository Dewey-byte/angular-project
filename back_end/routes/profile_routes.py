from flask import Flask, Blueprint, jsonify, request, send_from_directory
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS
import MySQLdb
import os

app = Flask(__name__)

# --------------------------- Config ---------------------------
app.config["JWT_SECRET_KEY"] = "your-secret-key"  # JWT secret key
app.config["UPLOAD_FOLDER"] = "uploads"           # Folder to store uploaded profile images

jwt = JWTManager(app)

# Allow requests from Angular frontend running at localhost:4200
CORS(app, origins="http://localhost:4200")

# Ensure uploads folder exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")

# --------------------------- Database connection ---------------------------
def get_db_connection():
    """
    Connect to the MySQL database and return the connection object.
    """
    return MySQLdb.connect(
        host="localhost",
        user="root",
        passwd="",
        db="librotrackdb",
        charset="utf8mb4"
    )

profile = Blueprint("profile", __name__)

# ------------------------------------------------------------------------
# GET PROFILE
# ------------------------------------------------------------------------
@profile.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """
    Get the profile information of the logged-in user.
    JWT is used to get user_id.
    Returns:
        JSON object with user profile data or 404 if user not found.
    """
    user_id = get_jwt_identity()
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("""
        SELECT User_ID, Username, Full_Name, Email, Role, Contact_Number, Address, Image_URL
        FROM Users WHERE User_ID = %s
    """, (user_id,))
    row = cursor.fetchone()
    cursor.close()
    db.close()

    if row:
        return jsonify({
            "user": {
                "User_ID": row[0],
                "Username": row[1],
                "Full_Name": row[2],
                "Email": row[3],
                "Role": row[4],
                "Contact_Number": row[5],
                "Address": row[6],
                "image": row[7]
            }
        })

    return jsonify({"error": "User not found"}), 404

# ------------------------------------------------------------------------
# UPLOAD / EDIT PROFILE
# ------------------------------------------------------------------------
@profile.route("/profile/edit", methods=["PUT", "OPTIONS"])
@jwt_required()
def edit_profile():
    """
    Update the profile of the logged-in user.
    Supports:
        - Updating Full_Name, Email, Contact_Number, Address
        - Uploading a new profile image
    Steps:
        1. Check if an image file is uploaded and save it to UPLOAD_FOLDER
        2. If no new image, keep the old image
        3. Update the Users table in MySQL
    Returns:
        JSON message with updated image URL
    """
    if request.method == "OPTIONS":
        return '', 200

    user_id = get_jwt_identity()

    full_name = request.form.get("Full_Name")
    username = request.form.get("Username")
    contact = request.form.get("Contact_Number")
    address = request.form.get("Address")

    # --------------------------- Handle File Upload ---------------------------
    image_url = None
    if "image" in request.files:
        file = request.files["image"]
        if file.filename != "":
            filename = file.filename
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)

            # Save uploaded file
            file.save(filepath)
            image_url = f"http://localhost:5000/uploads/{filename}"

    # If no new image is uploaded, use the existing one
    if not image_url:
        image_url = request.form.get("Current_Image")

    # --------------------------- Update database ---------------------------
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("""
        UPDATE Users
        SET Full_Name=%s, Username=%s, Contact_Number=%s, Address=%s, Image_URL=%s
        WHERE User_ID=%s
    """, (full_name, username, contact, address, image_url, user_id))

    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Profile updated successfully", "image_url": image_url}), 200


if __name__ == "__main__":
    app.run(debug=True)
