from flask import jsonify

# TODO: Implement this route
def departments_create():
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