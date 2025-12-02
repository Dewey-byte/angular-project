import os

class Config:
    """
    Configuration class for the Flask application.
    Stores secret keys and database connection settings.
    """

    # --------------------------- Flask / JWT Secrets ---------------------------
    SECRET_KEY = "super-secret-key"       # Flask secret key (used for session, CSRF, etc.)
    JWT_SECRET_KEY = "jwt-secret-key"     # Secret key for JWT token encoding/decoding

    # --------------------------- Database Configuration ---------------------------
    DB_HOST = "localhost"                  # MySQL server host
    DB_USER = "root"                       # MySQL username
    DB_PASSWORD = ""                       # MySQL password
    DB_NAME = "librotrackdb"               # MySQL database name
