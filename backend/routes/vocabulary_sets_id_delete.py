from flask import jsonify

# TODO: Implement this route
def vocabulary_sets_id_delete(vocabulary_set_id: int):
  """
  DELETE /api/vocabulary-sets/<int:vocabulary_set_id>/delete

  **Response Format**
  .. code-block:: json
    { }
  """
  return jsonify({})