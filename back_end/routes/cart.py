from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.connection import get_db

cart = Blueprint("cart", __name__)

# GET CART ITEMS
@cart.route("/", methods=["GET"])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    db = get_db()
    cur = db.cursor()

    cur.execute("SELECT * FROM cart WHERE user_id = %s", (user_id,))
    items = cur.fetchall()

    return jsonify(items), 200

# ADD TO CART
@cart.route("/add", methods=["POST"])
@jwt_required()
def add_cart():
    data = request.json
    user_id = get_jwt_identity()

    product_id = data.get("product_id")

    db = get_db()
    cur = db.cursor()

    cur.execute("""
        INSERT INTO cart (user_id, product_id)
        VALUES (%s, %s)
    """, (user_id, product_id))

    db.commit()
    return jsonify({"msg": "Added to cart"}), 201

# REMOVE ITEM
@cart.route("/remove/<int:item_id>", methods=["DELETE"])
@jwt_required()
def remove_cart(item_id):
    db = get_db()
    cur = db.cursor()

    cur.execute("DELETE FROM cart WHERE id = %s", (item_id,))
    db.commit()

    return jsonify({"msg": "Item removed"}), 200
