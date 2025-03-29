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
    # Check if the teacher is allowed to delete the student
    cursor.execute("SELECT * FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    department = cursor.fetchone()
    cursor.nextset()
    
    if department is None:
      return jsonify({'error': "You are not allowed to delete this student."}), 403
    
    # Delete the student
    cursor.execute("DELETE FROM mf_student WHERE department_id = %s AND id = %s", (department_id, student_id))
    conn.commit()
    
    # Check if the student did even exist
    if cursor.rowcount == 0:
      return jsonify({'error': "Student not found."}), 404
  
  return jsonify({})