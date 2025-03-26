import backend.connection as connection
import backend.crypto as crypto

with connection.open() as (conn, cursor):
  """
  cursor.execute("INSERT INTO mf_teacher (abbreviation, password_hash) VALUES ('TST', %s)", (crypto.hash_password('1234'),))
  conn.commit()
  """
  
  cursor.execute("INSERT INTO mf_department (teacher_id, label) VALUES (5, 'G2025D')")
  conn.commit()
  
  cursor.execute("INSERT INTO mf_student (username, password_hash, department_id) VALUES ('STU', %s, 1)", (crypto.hash_password('1234'),))
  conn.commit()