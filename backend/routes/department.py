from flask import jsonify
import backend.route as route

# TODO: Implement this route
@route.failsafe
def department(department_id: int):
  """
  GET /api/departments/:department_id

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
  return jsonify({
    'id': department_id,
    'label': 'G2025D',
    'students': [
      {
        'id': 1,
        'username': 'student1',
      }
    ]
  })