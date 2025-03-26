from typing import Any
from flask import jsonify
import backend.connection as connection

def departments(user_id: int, user_role: str):
  """
  GET /api/departments

  **Response Format**
  .. code-block:: json
    {
      "departments": [
        {
          "id": 1,
          "label": "G2025D",
          "studentsCount": 1
        }
      ]
    }
  """
  departments: list[dict[str, Any]] = []
  
  with connection.open() as (_conn, cursor):
    # Get all departments of the teacher
    cursor.execute("SELECT * FROM mf_department WHERE teacher_id = %s", (user_id,))
    departments_response = cursor.fetchall()
    cursor.nextset()
    
    # Get the number of students in each department and add it to the response
    for department in departments_response:
      cursor.execute("SELECT COUNT(*) AS student_count FROM mf_student WHERE department_id = %s", (department['id'],))
      students_count_response = cursor.fetchone()
      cursor.nextset()
      
      departments.append({
        'id': department['id'],
        'label': department['label'],
        'studentsCount': students_count_response['student_count']
      })
    
  return jsonify({
    'departments': departments
  })