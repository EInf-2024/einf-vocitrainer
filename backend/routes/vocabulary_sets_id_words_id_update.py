from flask import jsonify

# TODO: Implement this route
def vocabulary_sets_id_words_id_update(vocabulary_set_id: int, word_id: int, user_id: int, user_role: str):
  """
  PATCH /api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/update

  **Response Format**
  .. code-block:: json
    { }
  """
  return jsonify({})