import MySQLdb
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from database.connection import get_db

checkout_steps_bp = Blueprint("checkout", __name__)
CORS(checkout_steps_bp, origins="http://localhost:4200")  # Allow Angular frontend
@checkout_steps_bp.route("/shipping", methods=["GET", "POST"])
@jwt_required()
def save_shipping():
    user_id = get_jwt_identity()
    db = get_db()

    try:
        with db.cursor(MySQLdb.cursors.DictCursor) as cur:  # dict cursor
            if request.method == "GET":
                cur.execute("""
                    SELECT Full_Name, Address, Contact_Number
                    FROM Users
                    WHERE User_ID=%s
                """, (user_id,))
                user_info = cur.fetchone()

                print("DEBUG SQL RESULT:", user_info)  # debug

                if not user_info:
                    return jsonify({"error": "User profile not found"}), 404

                return jsonify({
                    "full_name": user_info.get("Full_Name", ""),
                    "address": user_info.get("Address", ""),
                    "contact_number": user_info.get("Contact_Number", "")
                }), 200

            # POST → update
            data = request.get_json() or {}
            full_name = data.get("full_name")
            address = data.get("address")
            contact_number = data.get("contact_number")

            if not full_name or not address or not contact_number:
                return jsonify({"error": "Missing shipping fields"}), 400

            cur.execute("""
                UPDATE Users
                SET Full_Name=%s, Address=%s, Contact_Number=%s
                WHERE User_ID=%s
            """, (full_name, address, contact_number, user_id))
            db.commit()

        return jsonify({"message": "Shipping info saved"}), 200

    except Exception as e:
        print("Error in save_shipping:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        db.close()





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
    print("DEBUG USER_ID RECEIVED FROM TOKEN =", user_id)

    # Ensure user_id is integer (safety)
    try:
        user_id = int(user_id)
    except:
        return jsonify({"error": "Invalid user identity in token"}), 400

    db = get_db()

    try:
        # Use DictCursor to safely access columns by name
        cur = db.cursor(MySQLdb.cursors.DictCursor)

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

        cart_items = [
            {
                "cart_id": r["cart_id"],
                "product_id": r["product_id"],
                "quantity": r["quantity"],
                "Product_Name": r["Product_Name"],
                "Price": float(r["Price"])
            }
            for r in rows
        ]

        total_amount = sum(item["Price"] * item["quantity"] for item in cart_items)

        # ----------------------
        # Fetch user shipping info
        # ----------------------
        cur.execute("""
            SELECT Full_Name, Address, Contact_Number
            FROM Users
            WHERE User_ID=%s
        """, (user_id,))
        user_info_db = cur.fetchone()

        if not user_info_db:
            return jsonify({"error": "User profile not found"}), 404

        user_info = {
            "full_name": user_info_db.get("Full_Name", ""),
            "address": user_info_db.get("Address", ""),
            "contact_number": user_info_db.get("Contact_Number", ""),
            "payment_method": "COD"  # always COD
        }

        cur.close()

        return jsonify({
            "user_info": user_info,
            "items": cart_items,
            "total_amount": round(total_amount, 2)
        }), 200

    except Exception as e:
        print("Error in review_order:", e)
        return jsonify({"error": "Internal server error"}), 500

    finally:
        db.close()


# ================================
# STEP 4: PLACE ORDER
# ================================
@checkout_steps_bp.route("/place_order", methods=["POST", "OPTIONS"])
@jwt_required()
def place_order():
    """
    Moves items from cart to orders table, clears cart, returns order summary.
    Handles CORS preflight OPTIONS request.
    """
    # Handle preflight
    if request.method == "OPTIONS":
        return '', 200

    user_id = get_jwt_identity()

    # Ensure user_id is integer
    try:
        user_id = int(user_id)
    except:
        return jsonify({"error": "Invalid user identity"}), 400

    db = get_db()

    try:
        # Use DictCursor for safety
        with db.cursor(MySQLdb.cursors.DictCursor) as cur:
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

            total_amount = 0
            order_items = []

            for r in rows:
                total_amount += float(r["Price"]) * r["quantity"]
                order_items.append((user_id, r["product_id"], r["quantity"], r["Price"]))

                    # Insert order
            cur.execute("""
                INSERT INTO orders (user_id, total_amount)
                VALUES (%s, %s)
            """, (user_id, total_amount))
            order_id = cur.lastrowid
            # ----------------------
            # Insert order details
            # ----------------------
            for item in order_items:
                subtotal = float(item[3]) * item[2]  # Price * Quantity
                cur.execute("""
                    INSERT INTO order_details (Order_ID, Product_ID, Quantity, Subtotal)
                    VALUES (%s, %s, %s, %s)
                """, (order_id, item[1], item[2], subtotal))


            # ----------------------
            # Clear user's cart
            # ----------------------
            cur.execute("DELETE FROM cart WHERE user_id=%s", (user_id,))

        # Commit all changes
        db.commit()

    except Exception as e:
        print("Error in place_order:", e)
        db.rollback()
        return jsonify({"error": "Internal server error"}), 500

    finally:
        db.close()

    return jsonify({
        "Order_ID": order_id,
        "total_amount": round(total_amount, 2),
        "message": "Order placed successfully",
        "payment_method": "COD"
    }), 200
