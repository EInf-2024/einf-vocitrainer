from flask import jsonify
from typing import Union, Any
import backend.connection as connection

def departments_id(department_id: int, user_id: int, user_role: str):
  """
  GET /api/departments/<int:department_id>

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "label": "G2025D",
      "students": [
        {
          "id": 1,
          "username": "student1",
        }
      ]
    }
  """
  department_response: dict[str, Union[Any, list[Any]]] = {}
  
  with connection.open() as (_conn, cursor):
    # Get the department
    cursor.execute("SELECT * FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    department = cursor.fetchone()
    cursor.nextset()
    
    if department is None:
      return jsonify({"error": "Department not found"}), 404
    
    department_response["id"] = department["id"]
    department_response["label"] = department["label"]
    
    # Get all students in the department
    cursor.execute("SELECT * FROM mf_student WHERE department_id = %s", (department_id,))
    students = cursor.fetchall()
    cursor.nextset()
    
    department_response["students"] = []
    for student in students:
      student_id = student["id"]
      student_username = student["username"]
      
      department_response["students"].append({
        "id": student_id,
        "username": student_username
      })
    
  return jsonify(department_response)