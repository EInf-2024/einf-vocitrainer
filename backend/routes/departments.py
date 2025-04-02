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
  departments_response: list[dict[str, Any]] = []
  
  with connection.open() as (_conn, cursor):
    # Get all departments of the teacher
    cursor.execute("""
      SELECT department.id, department.label, COUNT(student.id) AS student_count
      FROM mf_department department
      LEFT JOIN mf_student student ON department.id = student.department_id
        WHERE department.teacher_id = %s
        GROUP BY department.id, department.label
    """, (user_id,))
    departments = cursor.fetchall()
    cursor.nextset()
    
    # Get the number of students in each department and add it to the response
    for department in departments:
      departments_response.append({
        'id': department['id'],
        'label': department['label'],
        'studentsCount': department['student_count']
      })
    
  return jsonify({
    'departments': departments_response
  })