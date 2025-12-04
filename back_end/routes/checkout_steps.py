from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from database.connection import get_db

checkout_steps_bp = Blueprint("checkout", __name__)
CORS(checkout_steps_bp, origins="http://localhost:4200")  # Allow Angular frontend

# ================================
# STEP 1: SAVE SHIPPING INFO
# ================================
@checkout_steps_bp.route("/shipping", methods=["POST"])
@jwt_required()
def save_shipping():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    full_name = data.get("full_name")
    address = data.get("address")
    contact_number = data.get("contact_number")  # must match Angular field

    if not full_name or not address or not contact_number:
        return jsonify({"error": "Missing shipping fields"}), 400

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("""
                UPDATE users
                SET full_name=%s, address=%s, contact_number=%s
                WHERE user_id=%s
            """, (full_name, address, contact_number, user_id))
        db.commit()
    finally:
        db.close()

    return jsonify({"message": "Shipping info saved"}), 200


# ================================
# STEP 2: SAVE PAYMENT METHOD (Dummy)
# ================================
@checkout_steps_bp.route("/payment", methods=["POST"])
@jwt_required()
def save_payment():
    """
    Payment step is non-functional. Always force COD.
    """
    # We ignore the data from Angular and just return success
    return jsonify({"message": "Payment set to COD by default"}), 200


# ================================
# STEP 3: REVIEW ORDER
# ================================
@checkout_steps_bp.route("/review", methods=["GET"])
@jwt_required()
def review_order():
    user_id = get_jwt_identity()
    db = get_db()

    try:
        cur = db.cursor()  # standard cursor

        # ----------------------
        # Fetch cart items
        # ----------------------
        cur.execute("""
            SELECT c.cart_id, c.product_id, c.quantity, p.Product_Name, p.Price
            FROM cart c
            JOIN products p ON c.product_id = p.Product_ID
            WHERE c.user_id=%s
        """, (user_id,))
        rows = cur.fetchall()

        if not rows:
            return jsonify({"error": "Cart is empty"}), 400

        # Convert tuples to dicts
        cart_items = []
        for r in rows:
            cart_items.append({
                "cart_id": r[0],
                "product_id": r[1],
                "quantity": r[2],
                "Product_Name": r[3],
                "Price": float(r[4])  # ensure numeric
            })

        # ----------------------
        # Calculate total
        # ----------------------
        total_amount = sum(item["Price"] * item["quantity"] for item in cart_items)

        # ----------------------
        # Fetch user shipping info
        # ----------------------
        cur.execute("""
            SELECT full_name, address, contact_number
            FROM users
            WHERE user_id=%s
        """, (user_id,))
        user_info_db = cur.fetchone()

        # If no shipping info yet, set defaults
        user_info = {
            "full_name": user_info_db[0] if user_info_db and user_info_db[0] else "",
            "address": user_info_db[1] if user_info_db and user_info_db[1] else "",
            "contact_number": user_info_db[2] if user_info_db and user_info_db[2] else "",
            "payment_method": "COD"  # always COD
        }

        cur.close()

        return jsonify({
            "user_info": user_info,
            "items": cart_items,
            "total_amount": round(total_amount, 2)
        }), 200

    except Exception as e:
        print("Error in review_order:", e)  # debug in console
        return jsonify({"error": "Internal server error"}), 500

    finally:
        db.close()





# ================================
# STEP 4: PLACE ORDER
# ================================
@checkout_steps_bp.route("/place_order", methods=["POST"])
@jwt_required()
def place_order():
    """
    Moves items from cart to orders table, clears cart, returns order summary.
    """
    user_id = get_jwt_identity()
    db = get_db()

    try:
        with db.cursor() as cur:
            # Fetch cart items
            cur.execute("""
                SELECT c.cart_id, c.product_id, c.quantity, p.Product_Name, p.Price
                FROM cart c
                JOIN products p ON c.product_id = p.Product_ID
                WHERE c.user_id=%s
            """, (user_id,))
            rows = cur.fetchall()

            if not rows:
                return jsonify({"error": "Cart is empty"}), 400

            total_amount = 0
            order_items = []

            for r in rows:
                cart_id, product_id, qty, product_name, price = r
                total_amount += float(price) * qty
                order_items.append((user_id, product_id, qty, price))

            # Insert order into orders table (example)
            cur.execute("INSERT INTO orders (user_id, total_amount, payment_method) VALUES (%s, %s, %s)", 
                        (user_id, total_amount, "COD"))
            order_id = cur.lastrowid

            # Insert order items
            for item in order_items:
                cur.execute("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
                            (order_id, item[1], item[2], item[3]))

            # Clear user's cart
            cur.execute("DELETE FROM cart WHERE user_id=%s", (user_id,))

        db.commit()

    finally:
        db.close()

    return jsonify({
        "Order_ID": order_id,
        "total_amount": round(total_amount, 2),
        "message": "Order placed successfully",
        "payment_method": "COD"
    }), 200
