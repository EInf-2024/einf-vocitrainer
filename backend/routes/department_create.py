from flask import jsonify
import backend.route as route

# TODO: Implement this route
@route.failsafe
def department_create():
  """
  PUT /api/departments/create

  **Request Format**
  .. code-block:: json
    {
      "label": "G2025D"
    }

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "label": "G2025D"
    }
  """
  return jsonify({
    'id': 1,
    'label': 'G2025D'
  })