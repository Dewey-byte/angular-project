from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.connection import get_db
import traceback

cart = Blueprint("cart", __name__)

# -------------------------------
# GET CART ITEMS WITH TOTALS
# -------------------------------
@cart.route("/", methods=["GET"])
@jwt_required()
def get_cart():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        db = get_db()
        cur = db.cursor()  

        cur.execute("""
            SELECT 
                c.cart_id, c.quantity, 
                p.Product_ID, p.Product_Name, p.Price, p.image_uri
            FROM cart c
            JOIN products p ON c.product_id = p.Product_ID
            WHERE c.user_id = %s
        """, (user_id,))
        items = cur.fetchall()

        cart_total = 0
        for item in items:
            price = float(item["Price"])
            qty = int(item["quantity"])
            item["total_price"] = round(price * qty, 2)
            cart_total += price * qty

        response = {
            "items": items,
            "cart_total": round(cart_total, 2)
        }

        return jsonify(response), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()
        if 'db' in locals():
            db.close()


# -------------------------------
# ADD TO CART
# -------------------------------
@cart.route("/add", methods=["POST"])
@jwt_required()
def add_cart():
    try:
        data = request.get_json()
        if not data or "product_id" not in data:
            return jsonify({"error": "Missing product_id"}), 422

        product_id = data["product_id"]
        try:
            quantity = int(data.get("quantity", 1))
        except ValueError:
            return jsonify({"error": "Quantity must be a number"}), 422

        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        db = get_db()
        cur = db.cursor()  # DictCursor

        # Check if product already exists in cart
        cur.execute(
            "SELECT cart_id, quantity FROM cart WHERE user_id=%s AND product_id=%s",
            (user_id, product_id)
        )
        existing = cur.fetchone()

        if existing:
            new_qty = existing["quantity"] + quantity
            cur.execute(
                "UPDATE cart SET quantity=%s WHERE cart_id=%s",
                (new_qty, existing["cart_id"])
            )
        else:
            cur.execute(
                "INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
                (user_id, product_id, quantity)
            )

        db.commit()
        return jsonify({"msg": "Added to cart"}), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()
        if 'db' in locals():
            db.close()


# -------------------------------
# UPDATE QUANTITY
# -------------------------------
@cart.route("/update/<int:cart_id>", methods=["PUT"])
@jwt_required()
def update_cart(cart_id):
    try:
        data = request.get_json()
        if not data or "quantity" not in data:
            return jsonify({"error": "Missing quantity"}), 422

        try:
            quantity = int(data["quantity"])
        except ValueError:
            return jsonify({"error": "Quantity must be a number"}), 422

        if quantity < 1:
            return jsonify({"error": "Invalid quantity"}), 422

        db = get_db()
        cur = db.cursor()  # DictCursor
        cur.execute(
            "UPDATE cart SET quantity=%s WHERE cart_id=%s",
            (quantity, cart_id)
        )
        db.commit()

        return jsonify({"msg": "Quantity updated"}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()
        if 'db' in locals():
            db.close()


# -------------------------------
# REMOVE ITEM
# -------------------------------
@cart.route("/remove/<int:cart_id>", methods=["DELETE"])
@jwt_required()
def remove_cart(cart_id):
    try:
        db = get_db()
        cur = db.cursor()  # DictCursor

        cur.execute("DELETE FROM cart WHERE cart_id = %s", (cart_id,))
        if cur.rowcount == 0:
            return jsonify({"error": "Item not found"}), 404

        db.commit()
        return jsonify({"msg": "Item removed"}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cur' in locals():
            cur.close()
        if 'db' in locals():
            db.close()

# -------------------------------
# CHECKOUT CART
# -------------------------------
@cart.route("/checkout", methods=["POST"])
@jwt_required()
def checkout_cart():
    db = None
    cur = None
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid user"}), 401

        db = get_db()
        cur = db.cursor()  # ensure dict results

        # 1. Fetch all cart items
        cur.execute("""
            SELECT c.cart_id, c.product_id, c.quantity, p.Price AS price
            FROM cart c
            JOIN products p ON c.product_id = p.Product_ID
            WHERE c.user_id = %s
        """, (user_id,))
        cart_items = cur.fetchall()

        if not cart_items:
            return jsonify({"error": "Cart is empty"}), 400

        # 2. Calculate total amount
        total_amount = sum(float(item["price"]) * int(item["quantity"]) for item in cart_items)

        # 3. Insert new order
        order_date = datetime.now()
        order_status = "Pending"

        cur.execute("""
            INSERT INTO orders (User_ID, Order_Date, Total_Amount, Order_Status)
            VALUES (%s, %s, %s, %s)
        """, (user_id, order_date, total_amount, order_status))

        order_id = cur.lastrowid

        # 4. Insert order_details with Subtotal
        for item in cart_items:
            subtotal = float(item["price"]) * int(item["quantity"])

            cur.execute("""
                INSERT INTO order_details (Order_ID, Product_ID, Quantity, Subtotal)
                VALUES (%s, %s, %s, %s)
            """, (order_id, item["product_id"], item["quantity"], subtotal))

        # 5. Clear user's cart
        cur.execute("DELETE FROM cart WHERE user_id = %s", (user_id,))

        db.commit()

        return jsonify({
            "message": "Checkout successful",
            "Order_ID": order_id,
            "total_amount": round(total_amount, 2)
        }), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": f"Checkout failed: {str(e)}"}), 500

    finally:
        if cur:
            cur.close()
        if db:
            db.close()
