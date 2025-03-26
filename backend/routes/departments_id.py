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
  department: dict[str, Union[Any, list[Any]]] = {}
  
  with connection.open() as (_conn, cursor):
    # Get the department
    cursor.execute("SELECT * FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    department_response = cursor.fetchone()
    cursor.nextset()
    
    if department_response is None:
      return jsonify({"error": "Department not found"}), 404
    
    department["id"] = department_response["id"]
    department["label"] = department_response["label"]
    
    # Get all students in the department
    cursor.execute("SELECT * FROM mf_student WHERE department_id = %s", (department_id,))
    students_response = cursor.fetchall()
    cursor.nextset()
    
    department["students"] = []
    for student in students_response:
      department["students"].append({
        "id": student["id"],
        "username": student["username"]
      })
    
  return jsonify(department)