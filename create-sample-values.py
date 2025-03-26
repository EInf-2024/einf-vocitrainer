import backend.connection as connection
import backend.crypto as crypto

with connection.open() as (conn, cursor):
  cursor.execute("INSERT INTO mf_teacher (abbreviation, password_hash) VALUES ('TST', %s)", (crypto.hash_password('1234'),))
  conn.commit()
  
  cursor.execute("INSERT INTO mf_student (username, password_hash) VALUES ('STU', %s)", (crypto.hash_password('1234'),))
  conn.commit()
