from flask import jsonify
import backend.connection as connection

def departments_id_delete(department_id: int, user_id: int, user_role: str):
  """
  DELETE /api/departments/<int:department_id>/delete

  **Response Format**
  .. code-block:: json
    { }
  """
  
  with connection.open() as (conn, cursor):
    # Delete the department
    cursor.execute("DELETE FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    conn.commit()
    
    if cursor.rowcount == 0:
      return jsonify({"error": "Department not found or you do not have permission to delete this department."}), 404
  
  return jsonify({})