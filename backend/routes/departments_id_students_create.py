from flask import jsonify, request
import backend.connection as connection
from backend import errors

def departments_id_students_create(department_id: int, user_id: int, user_role: str):
  """
  POST /api/departments/<int:department_id>/students/create
  
  **Request Format**
  .. code-block:: json
    {
      "username": "student1"
    }

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "username": "student1"
    }
  """
  data = request.get_json()
  if 'username' not in data: return errors.missing_keys('username')
  username = data['username']
  
  with connection.open() as (conn, cursor):
    # Check if the department exists and belongs to the teacher
    cursor.execute("SELECT id FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    department = cursor.fetchone()
    cursor.nextset()
    
    if department is None: return errors.not_found_or_no_permission('Department', 'create a student in', user_role)
    
    # Create the student
    cursor.execute("INSERT INTO mf_student (department_id, username) VALUES (%s, %s)", (department_id, username))
    conn.commit()
    
    student_id = cursor.lastrowid
  
  return jsonify({
    'id': student_id,
    'username': username
  }), 201