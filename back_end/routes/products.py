from flask import Blueprint, Flask, request, jsonify
from config import Config
import mysql.connector

app = Flask(__name__)
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

# ================= GET all products =================
@products_bp.route("/", methods=["GET"])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products), 200

# ================= GET single product =================
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

# ================= CREATE product(s) =================
@products_bp.route("/", methods=["POST"])
def create_product():
    data = request.get_json()
    if isinstance(data, dict):
        data = [data]  # wrap single product in a list

    inserted_products = []
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO products 
    (Product_Name, Category, Description, Author_Brand, Price, Stock_Quantity, image_uri)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    for item in data:
        cursor.execute(query, (
            item.get("Product_Name"),
            item.get("Category"),
            item.get("Description"),
            item.get("Author_Brand"),
            float(item.get("Price", 0)),
            int(item.get("Stock_Quantity", 0)),
            item.get("image_uri")
        ))
        conn.commit()
        new_id = cursor.lastrowid
        inserted_products.append({"Product_ID": new_id, **item})
    cursor.close()
    conn.close()
    return jsonify({"inserted": inserted_products}), 201

# ================= UPDATE product =================
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
        Stock_Quantity=%s,
        image_uri=%s
    WHERE Product_ID=%s
    """
    cursor.execute(query, (
        data.get("Product_Name"),
        data.get("Category"),
        data.get("Description"),
        data.get("Author_Brand"),
        float(data.get("Price", 0)),
        int(data.get("Stock_Quantity", 0)),
        data.get("image_uri"),
        id
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Product updated"}), 200

# ================= DELETE product =================
@products_bp.route("/<int:id>", methods=["DELETE"])
def delete_product(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE Product_ID=%s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Product deleted"}), 200

# ================= GET product filters =================
@products_bp.route("/filters", methods=["GET"])
def get_product_filters():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Categories
    cursor.execute("SELECT DISTINCT Category FROM products")
    categories = [row["Category"] for row in cursor.fetchall()]

    # Price range
    cursor.execute("SELECT MIN(Price) AS min_price, MAX(Price) AS max_price FROM products")
    price_row = cursor.fetchone()
    min_price = float(price_row["min_price"]) if price_row["min_price"] is not None else 0
    max_price = float(price_row["max_price"]) if price_row["max_price"] is not None else 0

    cursor.close()
    conn.close()

    return jsonify({
        "categories": categories,
        "min_price": min_price,
        "max_price": max_price
    }), 200

# ================= FILTER products =================
@products_bp.route("/filter", methods=["GET"])
def filter_products():
    category = request.args.get("category")
    min_price = request.args.get("min_price", type=float)
    max_price = request.args.get("max_price", type=float)
    search = request.args.get("search")  # NEW: search text

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    # Filter by category
    if category:
        query += " AND Category=%s"
        params.append(category)

    # Filter by min price
    if min_price is not None:
        query += " AND Price >= %s"
        params.append(min_price)

    # Filter by max price
    if max_price is not None:
        query += " AND Price <= %s"
        params.append(max_price)

      # Filter by product name only
    if search:
        search = f"%{search}%"
        query += " AND Product_Name LIKE %s"
        params.append(search)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, tuple(params))
    products = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(products), 200


# ================= REGISTER BLUEPRINT =================
app.register_blueprint(products_bp, url_prefix="/products")

if __name__ == "__main__":
    app.run(debug=True)
