from flask import Blueprint, request, jsonify
from database.connection import get_db  # your MySQL connection file

inventory_log_bp = Blueprint('inventory_log', __name__)

# ================= HELPER FUNCTION =================
# Allows products.py to log inventory changes directly
def log_inventory_change(Product_ID, Quantity_Changed, Remarks=None):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inventory_log (Product_ID, Log_Date, Quantity_Changed, Remarks)
        VALUES (%s, NOW(), %s, %s)
    """, (Product_ID, Quantity_Changed, Remarks))
    conn.commit()
    cursor.close()
    conn.close()

# ============================================================
# GET ALL INVENTORY LOGS
# ============================================================
@inventory_log_bp.route('/', methods=['GET'])
def get_all_inventory_logs():
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
    data = request.get_json()

    required = ["Product_ID", "Quantity_Changed"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO inventory_log (Product_ID, Log_Date, Quantity_Changed, Remarks)
        VALUES (%s, NOW(), %s, %s)
    """, (
        data["Product_ID"],
        data["Quantity_Changed"],
        data.get("Remarks")
    ))

    conn.commit()
    new_id = cursor.lastrowid

    cursor.close()
    conn.close()

    return jsonify({"message": "Inventory log created", "Log_ID": new_id}), 201

# ============================================================
# UPDATE INVENTORY LOG
# ============================================================
@inventory_log_bp.route('/<int:log_id>', methods=['PUT'])
def update_inventory_log(log_id):
    data = request.get_json()

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM inventory_log WHERE Log_ID = %s", (log_id,))
    log = cursor.fetchone()

    if not log:
        cursor.close()
        conn.close()
        return jsonify({"error": "Inventory log not found"}), 404

    Product_ID = data.get("Product_ID", log[1])  # assuming Log_ID is at index 0
    Quantity_Changed = data.get("Quantity_Changed", log[2])
    Remarks = data.get("Remarks", log[3] if len(log) > 3 else None)

    cursor.execute("""
        UPDATE inventory_log
        SET Product_ID = %s,
            Quantity_Changed = %s,
            Remarks = %s
        WHERE Log_ID = %s
    """, (Product_ID, Quantity_Changed, Remarks, log_id))

    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Inventory log updated successfully"}), 200

# ============================================================
# DELETE INVENTORY LOG
# ============================================================
@inventory_log_bp.route('/<int:log_id>', methods=['DELETE'])
def delete_inventory_log(log_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM inventory_log WHERE Log_ID = %s", (log_id,))
    log = cursor.fetchone()

    if not log:
        cursor.close()
        conn.close()
        return jsonify({"error": "Inventory log not found"}), 404

    cursor.execute("DELETE FROM inventory_log WHERE Log_ID = %s", (log_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Inventory log deleted successfully"}), 200
