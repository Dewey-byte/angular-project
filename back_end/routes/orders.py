from flask import Blueprint, request, jsonify
from database.connection import get_db   # Import the get_db() function to connect to MySQL
from datetime import datetime

# Create a blueprint for orders routes
orders_bp = Blueprint('orders', __name__)

# ============================================================
# GET ALL ORDERS
# ============================================================
@orders_bp.route('/', methods=['GET'])
def get_all_orders():
    """
    Fetch all orders from the database.
    Returns:
        JSON list of all orders
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders")
    orders = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify(orders), 200


# ============================================================
# GET ONE ORDER BY ID
# ============================================================
@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """
    Fetch a single order by its ID.
    
    Parameters:
        order_id (int): ID of the order
    Returns:
        JSON object of the order or 404 if not found
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE Order_ID = %s", (order_id,))
    order = cursor.fetchone()

    cursor.close()
    conn.close()

    if not order:
        return jsonify({"error": "Order not found"}), 404

    return jsonify(order), 200


# ============================================================
# CREATE ORDER
# ============================================================
@orders_bp.route('/', methods=['POST'])
def create_order():
    """
    Create a new order entry.
    Expected JSON body: User_ID (required), Total_Amount (optional), Order_Status (optional)
    Returns:
        JSON message with new Order_ID
    """
    data = request.get_json()

    # Validate required field
    if not data or "User_ID" not in data:
        return jsonify({"error": "User_ID is required"}), 400

    User_ID = data["User_ID"]
    Total_Amount = data.get("Total_Amount", 0.00)  # Default 0 if not provided
    Order_Status = data.get("Order_Status", "Pending")  # Default "Pending"
    Order_Date = datetime.now()  # Current timestamp

    conn = get_db()
    cursor = conn.cursor()

    sql = """
        INSERT INTO orders (User_ID, Order_Date, Total_Amount, Order_Status)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(sql, (User_ID, Order_Date, Total_Amount, Order_Status))
    conn.commit()

    new_id = cursor.lastrowid  # Get the ID of the newly created order

    cursor.close()
    conn.close()

    return jsonify({"message": "Order created", "Order_ID": new_id}), 201


# ============================================================
# UPDATE ORDER
# ============================================================
@orders_bp.route('/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    """
    Update an existing order.
    Can update User_ID, Total_Amount, and Order_Status.
    Returns:
        JSON message confirming update or error if order not found
    """
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()

    # Check if order exists
    cursor.execute("SELECT * FROM orders WHERE Order_ID = %s", (order_id,))
    order = cursor.fetchone()

    if not order:
        cursor.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    # Use provided fields or fallback to existing values
    User_ID = data.get("User_ID", order["User_ID"])
    Total_Amount = data.get("Total_Amount", order["Total_Amount"])
    Order_Status = data.get("Order_Status", order["Order_Status"])

    # Validate status
    VALID_STATUSES = ["Pending", "Processing", "Shipped", "Completed", "Cancelled"]
    if Order_Status not in VALID_STATUSES:
        cursor.close()
        conn.close()
        return jsonify({"error": "Invalid order status"}), 400

    # Update order
    sql = """
        UPDATE orders
        SET User_ID = %s,
            Total_Amount = %s,
            Order_Status = %s
        WHERE Order_ID = %s
    """
    cursor.execute(sql, (User_ID, Total_Amount, Order_Status, order_id))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Order updated successfully"}), 200


# ============================================================
# DELETE ORDER
# ============================================================
@orders_bp.route('/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    """
    Delete an order by ID.
    Returns:
        JSON message confirming deletion or error if order not found
    """
    conn = get_db()
    cursor = conn.cursor()

    # Check if the order exists
    cursor.execute("SELECT * FROM orders WHERE Order_ID = %s", (order_id,))
    order = cursor.fetchone()

    if not order:
        cursor.close()
        conn.close()
        return jsonify({"error": "Order not found"}), 404

    # Delete the order
    cursor.execute("DELETE FROM orders WHERE Order_ID = %s", (order_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Order deleted successfully"}), 200

    
# ============================================================
# GET ALL ORDERS OF A SPECIFIC USER
# ============================================================
@orders_bp.route('/user/<int:user_id>', methods=['GET'])
def get_orders_by_user(user_id):
    """
    Fetch all orders belonging to a specific user.
    Returns:
        JSON list of orders
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM orders WHERE User_ID = %s", (user_id,))
    orders = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "status": "success",
        "orders": orders
    }), 200
