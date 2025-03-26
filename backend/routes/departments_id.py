from flask import jsonify
from typing import Union, Any
import backend.connection as connection

# TODO: Implement this route
def departments_id(department_id: int):
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
    cursor.execute("SELECT * FROM mf_department WHERE id = %s", (department_id,))
    department_response = cursor.fetchone()
    cursor.nextset()
    
    department["id"] = department_response["id"]
    department["label"] = department_response["label"]
    
    cursor.execute("SELECT * FROM mf_student WHERE department_id = %s", (department_id,))
    students_response = cursor.fetchall()
    
    department["students"] = []
    for student in students_response:
      department["students"].append({
        "id": student["id"],
        "username": student["username"]
      })
    
  return jsonify(department)