from flask import jsonify

# TODO: Implement this route
def departments_id_students_id_delete(department_id: int, student_id: int):
  """
  DELETE /api/departments/<int:department_id>/students/<int:student_id>/delete

  **Response Format**
  .. code-block:: json
    { }
  """
  return jsonify({})