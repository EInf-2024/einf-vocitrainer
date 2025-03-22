from flask import jsonify

# TODO: Implement this route
def vocabulary_sets_create():
  """
  PUT /api/vocabulary-sets/create

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "label": "Vocabulary Set 1"
    }
  """
  return jsonify({
    "id": 1,
    "label": "Vocabulary Set 1"
  })