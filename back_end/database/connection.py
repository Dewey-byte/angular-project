import MySQLdb
from config import Config

def get_db():
    return MySQLdb.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        passwd=Config.DB_PASSWORD,
        db=Config.DB_NAME,
        cursorclass=MySQLdb.cursors.DictCursor
    )
