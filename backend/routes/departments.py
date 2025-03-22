from flask import jsonify
import backend.route as route

# TODO: Implement this route
@route.failsafe
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
  return jsonify({
    'departments': [
      {
        'id': 1,
        'label': 'G2025D',
        'studentsCount': 1
      }
    ]
  })