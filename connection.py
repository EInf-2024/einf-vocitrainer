from mysql.connector import pooling
import dotenv
import os

dotenv.load_dotenv()

# Configure connection pool
connection_pool = pooling.MySQLConnectionPool(
  pool_name=os.getenv('DB_POOL_NAME'),
  pool_size=int(str(os.getenv('DB_POOL_SIZE'))),
  host=os.getenv('DB_HOST'),
  database=os.getenv('DB_NAME'),
  user=os.getenv('DB_USER'),
  password=os.getenv('DB_PASS')
)

def open():
  return connection_pool.get_connection()