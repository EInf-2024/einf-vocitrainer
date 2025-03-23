from flask import jsonify

# TODO: Implement this route
def vocabulary_sets_id_departments_add(vocabulary_set_id: int):
  """
  PATCH /api/vocabulary-sets/<int:vocabulary_set_id>/departments/add

  **Request Format**
  .. code-block:: json
    {
      "id": 1
    }
    
  **Response Format**
  .. code-block:: json
    { }
  """
  return jsonify({})