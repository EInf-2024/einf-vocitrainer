from flask import jsonify
import backend.connection as connection
import backend.crypto as crypto
from typing import Any
from backend import errors

def departments_id_students_generate_passwords(department_id: int, user_id: int, user_role: str):
  """
  POST /api/departments/<int:department_id>/students/generate-passwords

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
  updated_students_response: list[dict[str, Any]] = []
  
  with connection.open() as (conn, cursor):
    # Check if the department exists and belongs to the teacher
    cursor.execute("SELECT id, label FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    department = cursor.fetchone()
    cursor.nextset()
    
    if department is None: return errors.not_found_or_no_permission('Department', 'generate passwords for students in', user_role)
    department_label = department['label']
    
    # Fetch students from the department
    cursor.execute("SELECT id, username, plaintext_password FROM mf_student WHERE department_id = %s", (department_id,))
    students = cursor.fetchall()
    cursor.nextset()
    
    # Generate passwords for each student
    for student in students:
      student_id = student['id']
      student_username = student['username']
      student_password = student['plaintext_password']
      
      # Create a new password if the student does not have one
      if student_password is None:
        student_password = crypto.generate_password(department_label, student_username)
        student_password_hash = crypto.hash_password(student_password)
      
        # Add the password to the database
        cursor.execute("UPDATE mf_student SET password_hash = %s, plaintext_password = %s WHERE id = %s", (student_password_hash, student_password, student_id))
        conn.commit()
      
      # Append the student data to the response
      updated_students_response.append({
        'id': student_id,
        'username': student_username,
        'password': student_password
      })
  
  return jsonify({
    'students': updated_students_response
  })