from typing import Any
from flask import jsonify
import backend.connection as connection

# TODO: Implement this route
def departments():
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
    cursor.execute("SELECT * FROM mf_department")
    departments_response = cursor.fetchall()
    
    for department in departments_response:
      cursor.execute("SELECT COUNT(*) FROM mf_student WHERE department_id = %s", (department['id'],))
      students_count_response = cursor.fetchone()
      
      print(students_count_response)
      
      departments.append({
        'id': department['id'],
        'label': department['label'],
        'studentsCount': students_count_response['COUNT(*)']
      })
    
  return jsonify({
    'departments': departments
  })