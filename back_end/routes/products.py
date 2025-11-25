from flask import Blueprint, app, request, jsonify
from config import Config
import mysql.connector

products_bp = Blueprint("products", __name__)

# Database connection helper
def get_db_connection():
    conn = mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )
    return conn

# GET all products
@products_bp.route("/", methods=["GET"])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products), 200

# GET single product
@products_bp.route("/<int:id>", methods=["GET"])
def get_product(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products WHERE Product_ID=%s", (id,))
    product = cursor.fetchone()
    cursor.close()
    conn.close()
    if product:
        return jsonify(product), 200
    return jsonify({"message": "Product not found"}), 404

# CREATE one or multiple products
@products_bp.route("/", methods=["POST"])
def create_product():
    data = request.get_json()

    # Ensure data is a list
    if isinstance(data, dict):
        data = [data]  # wrap single product in a list

    inserted_products = []

    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO products (Product_Name, Category, Description, Author_Brand, Price, Stock_Quantity)
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    for item in data:
        cursor.execute(query, (
            item.get("Product_Name"),
            item.get("Category"),
            item.get("Description"),
            item.get("Author_Brand"),
            float(item.get("Price", 0)),
            int(item.get("Stock_Quantity", 0))
        ))
        conn.commit()
        new_id = cursor.lastrowid
        inserted_products.append({"Product_ID": new_id, **item})

    cursor.close()
    conn.close()

    return jsonify({"inserted": inserted_products}), 201


# UPDATE a product
@products_bp.route("/<int:id>", methods=["PUT"])
def update_product(id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    UPDATE products SET
        Product_Name=%s,
        Category=%s,
        Description=%s,
        Author_Brand=%s,
        Price=%s,
        Stock_Quantity=%s
    WHERE Product_ID=%s
    """
    cursor.execute(query, (
        data.get("Product_Name"),
        data.get("Category"),
        data.get("Description"),
        data.get("Author_Brand"),
        float(data.get("Price", 0)),
        int(data.get("Stock_Quantity", 0)),
        id
    ))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Product updated"}), 200

# DELETE a product
@products_bp.route("/<int:id>", methods=["DELETE"])
def delete_product(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE Product_ID=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Product deleted"}), 200

if __name__ == "__main__":
    app.run(debug=True)
