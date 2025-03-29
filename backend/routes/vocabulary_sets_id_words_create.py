from flask import jsonify

# TODO: Implement this route
def vocabulary_sets_id_words_create(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  POST /api/vocabulary-sets/<int:vocabulary_set_id>/words/create
  
  **Request Format**
  .. code-block:: json
    {
      "word": "string",
      "definition": "string"
    }

  **Response Format**
  .. code-block:: json
    {
      "id": 0
    }
  """
  return jsonify({
    "id": 0
  })