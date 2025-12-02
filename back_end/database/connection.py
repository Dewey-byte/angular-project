import MySQLdb
import MySQLdb.cursors
from config import Config

def get_db():
    """
    Create and return a new MySQL database connection using settings
    from the Config class.
    """
    return MySQLdb.connect(
        host=Config.DB_HOST,             # Database server hostname / IP
        user=Config.DB_USER,             # MySQL username
        passwd=Config.DB_PASSWORD,       # MySQL password
        db=Config.DB_NAME,               # Database name to connect to
        cursorclass=MySQLdb.cursors.DictCursor  # Return results as dictionaries
    )
