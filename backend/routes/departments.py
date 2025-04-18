from flask import jsonify
import backend.connection as connection

def departments(user_id: int, user_role: str):
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
  
  with connection.open() as (_conn, cursor):
    # Get all departments of the teacher
    cursor.execute("""
      SELECT 
        department.id, 
        department.label, 
        COUNT(student.id) AS studentsCount
      FROM mf_department department
      LEFT JOIN 
        mf_student student ON department.id = student.department_id
          WHERE department.teacher_id = %s
      GROUP BY 
        department.id, 
        department.label
    """, (user_id,))
    departments_response = cursor.fetchall()
    cursor.nextset()
    
  return jsonify({
    'departments': departments_response
  })