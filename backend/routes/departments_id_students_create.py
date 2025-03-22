from flask import jsonify

# TODO: Implement this route
def departments_id_students_create(department_id: int):
  """
  PATCH /api/departments/<int:department_id>/students/create
  
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
  return jsonify({
    'id': 1,
    'username': 'student1'
  })