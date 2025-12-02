from flask import Blueprint, request, jsonify
from database.connection import get_db  # Import MySQL connection function

# Create a blueprint for order_details routes
order_details_bp = Blueprint('order_details', __name__)

# ============================================================
# GET ALL ORDER DETAILS
# ============================================================
@order_details_bp.route('/', methods=['GET'])
def get_all_order_details():
    """
    Fetch all order details from the database.
    Returns:
        JSON list of all order details
    """
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
    """
    Fetch a single order detail by its ID.
    
    Parameters:
        detail_id (int): ID of the order detail
    Returns:
        JSON object of the order detail or 404 if not found
    """
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
    """
    Create a new order detail entry.
    Expected JSON body: Order_ID, Product_ID, Quantity, Subtotal
    Returns:
        JSON message with new OrderDetail_ID
    """
    data = request.get_json()

    # Validate required fields
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
    new_id = cursor.lastrowid  # Get the ID of the newly created order detail

    cursor.close()
    conn.close()

    return jsonify({"message": "Order detail created", "OrderDetail_ID": new_id}), 201


# ============================================================
# UPDATE ORDER DETAIL
# ============================================================
@order_details_bp.route('/<int:detail_id>', methods=['PUT'])
def update_order_detail(detail_id):
    """
    Update an existing order detail.
    Can update Order_ID, Product_ID, Quantity, or Subtotal.
    Returns:
        JSON message confirming update or error if not found
    """
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()

    # Fetch existing order detail
    cursor.execute("SELECT * FROM order_details WHERE OrderDetail_ID = %s", (detail_id,))
    detail = cursor.fetchone()
    if not detail:
        cursor.close()
        conn.close()
        return jsonify({"error": "Order detail not found"}), 404

    # Use provided values or fallback to existing
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
    """
    Delete an order detail by ID.
    Returns:
        JSON message confirming deletion or error if not found
    """
    conn = get_db()
    cursor = conn.cursor()

    # Check if the order detail exists
    cursor.execute("SELECT * FROM order_details WHERE OrderDetail_ID = %s", (detail_id,))
    detail = cursor.fetchone()
    if not detail:
        cursor.close()
        conn.close()
        return jsonify({"error": "Order detail not found"}), 404

    # Delete the order detail
    cursor.execute("DELETE FROM order_details WHERE OrderDetail_ID = %s", (detail_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Order detail deleted successfully"}), 200
