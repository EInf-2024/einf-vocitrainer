from flask import jsonify

# TODO: Implement this route
def departments_id_students_generate_passwords(department_id: int):
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
  return jsonify({
    'students': [
      {
        'id': 1,
        'username': 'student1',
        'password': 'password1'
      }
    ]
  })