from flask import Blueprint, request, jsonify
from database.connection import get_db  # Import MySQL connection function

# Create a blueprint for inventory log routes
inventory_log_bp = Blueprint('inventory_log', __name__)

# ================= HELPER FUNCTION =================
def log_inventory_change(Product_ID, Change_Type, Quantity_Changed, Remarks=None):
    """
    Helper function to log inventory changes.
    Can be called from other modules (e.g., products.py)
    
    Parameters:
        Product_ID (int): ID of the product
        Change_Type (str): Type of change (e.g., "Added", "Removed")
        Quantity_Changed (int): Quantity affected
        Remarks (str, optional): Additional notes
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inventory_log (Product_ID, Log_Date, Change_Type, Quantity_Changed, Remarks)
        VALUES (%s, NOW(), %s, %s, %s)
    """, (Product_ID, Change_Type, Quantity_Changed, Remarks))
    conn.commit()
    cursor.close()
    conn.close()


# ============================================================
# GET ALL INVENTORY LOGS
# ============================================================
@inventory_log_bp.route('/', methods=['GET'])
def get_all_inventory_logs():
    """
    Fetch all inventory log records from the database.
    Returns:
        JSON list of all inventory logs
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory_log")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(rows), 200


# ============================================================
# GET ONE INVENTORY LOG BY ID
# ============================================================
@inventory_log_bp.route('/<int:log_id>', methods=['GET'])
def get_inventory_log(log_id):
    """
    Fetch a single inventory log by its ID.
    
    Parameters:
        log_id (int): ID of the inventory log
    Returns:
        JSON object of the log or 404 if not found
    """
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory_log WHERE Log_ID = %s", (log_id,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()

    if not row:
        return jsonify({"error": "Inventory log not found"}), 404

    return jsonify(row), 200


# ============================================================
# CREATE INVENTORY LOG
# ============================================================
@inventory_log_bp.route('/', methods=['POST'])
def create_inventory_log():
    """
    Create a new inventory log entry.
    Expected JSON body: Product_ID, Change_Type, Quantity_Changed, optional Remarks
    Returns:
        JSON message with new Log_ID
    """
    data = request.get_json()

    # Validate required fields
    required = ["Product_ID", "Change_Type", "Quantity_Changed"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    sql = """
        INSERT INTO inventory_log (Product_ID, Log_Date, Change_Type, Quantity_Changed, Remarks)
        VALUES (%s, NOW(), %s, %s, %s)
    """

    cursor.execute(sql, (
        data["Product_ID"],
        data["Change_Type"],
        data["Quantity_Changed"],
        data.get("Remarks")  # Optional
    ))

    conn.commit()
    new_id = cursor.lastrowid  # Get the ID of the newly created log

    cursor.close()
    conn.close()

    return jsonify({"message": "Inventory log created", "Log_ID": new_id}), 201


# ============================================================
# UPDATE INVENTORY LOG
# ============================================================
@inventory_log_bp.route('/<int:log_id>', methods=['PUT'])
def update_inventory_log(log_id):
    """
    Update an existing inventory log.
    Can update Product_ID, Change_Type, Quantity_Changed, or Remarks.
    Returns:
        JSON message confirming update or error if log not found
    """
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()

    # Fetch existing log
    cursor.execute("SELECT * FROM inventory_log WHERE Log_ID = %s", (log_id,))
    log = cursor.fetchone()
    if not log:
        cursor.close()
        conn.close()
        return jsonify({"error": "Inventory log not found"}), 404

    # Use provided fields or fallback to existing values
    Product_ID = data.get("Product_ID", log["Product_ID"])
    Change_Type = data.get("Change_Type", log["Change_Type"])
    Quantity_Changed = data.get("Quantity_Changed", log["Quantity_Changed"])
    Remarks = data.get("Remarks", log["Remarks"])

    # Update the log
    sql = """
        UPDATE inventory_log
        SET Product_ID = %s,
            Change_Type = %s,
            Quantity_Changed = %s,
            Remarks = %s
        WHERE Log_ID = %s
    """
    cursor.execute(sql, (Product_ID, Change_Type, Quantity_Changed, Remarks, log_id))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Inventory log updated successfully"}), 200


# ============================================================
# DELETE INVENTORY LOG
# ============================================================
@inventory_log_bp.route('/<int:log_id>', methods=['DELETE'])
def delete_inventory_log(log_id):
    """
    Delete an inventory log by ID.
    Returns:
        JSON message confirming deletion or error if not found
    """
    conn = get_db()
    cursor = conn.cursor()

    # Check if log exists
    cursor.execute("SELECT * FROM inventory_log WHERE Log_ID = %s", (log_id,))
    log = cursor.fetchone()
    if not log:
        cursor.close()
        conn.close()
        return jsonify({"error": "Inventory log not found"}), 404

    # Delete the log
    cursor.execute("DELETE FROM inventory_log WHERE Log_ID = %s", (log_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({"message": "Inventory log deleted successfully"}), 200
