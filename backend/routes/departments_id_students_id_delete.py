from flask import jsonify
import backend.connection as connection

def departments_id_students_id_delete(department_id: int, student_id: int, user_id: int, user_role: str):
  """
  DELETE /api/departments/<int:department_id>/students/<int:student_id>/delete

  **Response Format**
  .. code-block:: json
    { }
  """
  
  with connection.open() as (conn, cursor):    
    # Delete the student (but check if the user has permission to delete the student)
    cursor.execute("""
      DELETE FROM mf_student WHERE department_id = %s AND id = %s AND department_id IN (
        SELECT id FROM mf_department WHERE teacher_id = %s
      )
    """, (department_id, student_id, user_id))
    conn.commit()
    
    if cursor.rowcount == 0:
      return jsonify({'error': "Student not found or you do not have permission to delete this student."}), 404
  
  return jsonify({})