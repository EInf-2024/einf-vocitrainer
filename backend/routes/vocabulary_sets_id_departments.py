from flask import jsonify
import backend.connection as connection
from backend import errors

def vocabulary_sets_id_departments(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  GET /api/vocabulary-sets/<int:vocabulary_set_id>/departments
    
  **Response Format**
  .. code-block:: json
    {
      "departments": [
        {
          "id": 1,
          "label": "Department 1"
        },
        {
          "id": 2,
          "label": "Department 2"
        }
      ]
    }
  """
    
  with connection.open() as (_conn, cursor):
    # Validate vocabulary set ownership
    cursor.execute("SELECT id FROM mf_vocabulary_set WHERE id = %s AND teacher_id = %s", (vocabulary_set_id, user_id))
    vocabulary_set = cursor.fetchone()
    cursor.nextset()
    
    if vocabulary_set is None: return errors.not_found_or_no_permission("Vocabulary Set", "view", user_role)
    
    # Get all departments associated with the vocabulary set
    cursor.execute("""
      SELECT 
        department.id,
        department.label 
      FROM 
        mf_department AS department
      JOIN 
        mf_vocabulary_set_access AS access 
        ON department.id = access.department_id
      WHERE 
        access.vocabulary_set_id = %s AND
        department.teacher_id = %s
    """, (vocabulary_set_id, user_id))
    departments = cursor.fetchall()
    cursor.nextset()
    
  return jsonify({
    "departments": departments
  })