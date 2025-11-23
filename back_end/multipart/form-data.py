from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
from werkzeug.utils import secure_filename
from database.connection import get_db

profile = Blueprint("profile", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@profile.route("/profile/edit", methods=["PUT"])
@jwt_required()
def edit_profile():
    user_id = get_jwt_identity()

    # Check if form-data has a file
    if "image" in request.files:
        file = request.files["image"]
        if file and allowed_file(file.filename):
            filename = f"user_{user_id}_{secure_filename(file.filename)}"
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            image_url = filename
        else:
            image_url = None
    else:
        # If no file uploaded, check JSON data
        data = request.get_json()
        image_url = data.get("image", None)
    
    # Other fields from JSON
    data = request.form if request.form else request.get_json()
    full_name = data.get("Full_Name")
    email = data.get("Email")
    contact = data.get("Contact_Number")
    address = data.get("Address")

    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        UPDATE Users
        SET Full_Name=%s, Email=%s, Contact_Number=%s, Address=%s, Image_URL=%s
        WHERE User_ID=%s
    """, (full_name, email, contact, address, image_url, user_id))
    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": "Profile updated successfully", "image_url": image_url})
