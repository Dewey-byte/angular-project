from flask import Blueprint, request, jsonify
from database.connection import get_db  # your MySQL connection file

order_details_bp = Blueprint('order_details', __name__)

# ============================================================
# GET ALL ORDER DETAILS
# ============================================================
@order_details_bp.route('/', methods=['GET'])
def get_all_order_details():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM order_details")
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(rows), 200

# ============================================================
# GET ONE ORDER DETAIL BY ID
# ============================================================
@order_details_bp.route('/<int:detail_id>', methods=['GET'])
def get_order_detail(detail_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM order_details WHERE OrderDetail_ID = %s", (detail_id,))
    row = cursor.fetchone()

    cursor.close()
    conn.close()

    if not row:
        return jsonify({"error": "Order detail not found"}), 404

    return jsonify(row), 200

# ============================================================
# CREATE ORDER DETAIL
# ============================================================
@order_details_bp.route('/', methods=['POST'])
def create_order_detail():
    data = request.get_json()

    required = ["Order_ID", "Product_ID", "Quantity", "Subtotal"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    sql = """
        INSERT INTO order_details (Order_ID, Product_ID, Quantity, Subtotal)
        VALUES (%s, %s, %s, %s)
    """

    cursor.execute(sql, (
        data["Order_ID"],
        data["Product_ID"],
        data["Quantity"],
        data["Subtotal"]
    ))

    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"message": "Order detail created", "OrderDetail_ID": new_id}), 201

# ============================================================
# UPDATE ORDER DETAIL
# ============================================================
@order_details_bp.route('/<int:detail_id>', methods=['PUT'])
def update_order_detail(detail_id):
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM order_details WHERE OrderDetail_ID = %s", (detail_id,))
    detail = cursor.fetchone()

    if not detail:
        cursor.close()
        conn.close()
        return jsonify({"error": "Order detail not found"}), 404

    Order_ID = data.get("Order_ID", detail["Order_ID"])
    Product_ID = data.get("Product_ID", detail["Product_ID"])
    Quantity = data.get("Quantity", detail["Quantity"])
    Subtotal = data.get("Subtotal", detail["Subtotal"])

    sql = """
        UPDATE order_details
        SET Order_ID = %s,
            Product_ID = %s,
            Quantity = %s,
            Subtotal = %s
        WHERE OrderDetail_ID = %s
    """

    cursor.execute(sql, (Order_ID, Product_ID, Quantity, Subtotal, detail_id))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Order detail updated successfully"}), 200

# ============================================================
# DELETE ORDER DETAIL
# ============================================================
@order_details_bp.route('/<int:detail_id>', methods=['DELETE'])
def delete_order_detail(detail_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM order_details WHERE OrderDetail_ID = %s", (detail_id,))
    detail = cursor.fetchone()

    if not detail:
        cursor.close()
        conn.close()
        return jsonify({"error": "Order detail not found"}), 404

    cursor.execute("DELETE FROM order_details WHERE OrderDetail_ID = %s", (detail_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Order detail deleted successfully"}), 200
