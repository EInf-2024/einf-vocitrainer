from flask import jsonify

# TODO: Implement this route
def root():
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