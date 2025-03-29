from flask import jsonify
import backend.connection as connection
import backend.crypto as crypto
from typing import Any

def departments_id_students_generate_passwords(department_id: int, user_id: int, user_role: str):
  """
  GET /api/departments/<int:department_id>/students/generate-passwords

  **Response Format**
  .. code-block:: json
    {
      "students": [
        {
          "id": 1,
          "username": "student1",
          "password": "password1"
        }
      ]
    }
  """
  updated_students: list[dict[str, Any]] = []
  
  with connection.open() as (conn, cursor):
    # Check if the department exists and belongs to the teacher
    cursor.execute("SELECT id, label FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    department = cursor.fetchone()
    cursor.nextset()
    
    if department is None:
      return jsonify({'error': "You are not allowed to generate passwords for this department."}), 403
    
    department_label = department['label']
    
    # Fetch students from the department
    cursor.execute("SELECT id, username FROM mf_student WHERE department_id = %s", (department_id,))
    students = cursor.fetchall()
    
    # Generate passwords for each student
    for student in students:
      student_id = student['id']
      student_username = student['username']
      student_password = crypto.generate_password(department_label, student_username)
      
      updated_students.append({
        'id': student_id,
        'username': student_username,
        'password': student_password
      })
      
    # Save the passwords to the database
    for student in updated_students:
      student_id = student['id']
      student_password = student['password']
      student_password_hash = crypto.hash_password(student_password)
      
      cursor.execute("UPDATE mf_student SET password_hash = %s WHERE id = %s", (student_password_hash, student_id))
      conn.commit()
      cursor.nextset()
  
  return jsonify({
    'students': updated_students
  })