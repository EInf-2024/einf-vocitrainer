from flask import jsonify, request
import backend.connection as connection
from backend import errors

def vocabulary_sets_id_departments_remove(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  PATCH /api/vocabulary-sets/<int:vocabulary_set_id>/departments/remove

  **Request Format**
  .. code-block:: json
    {
      "id": 1
    }
    
  **Response Format**
  .. code-block:: json
    { }
  """
  data = request.get_json()
  
  if 'id' not in data: return errors.missing_keys('id')
  department_id = data['id']
  
  with connection.open() as (conn, cursor):
    # Check if the vocabulary set exists and belongs to the teacher
    cursor.execute("SELECT id FROM mf_vocabulary_set WHERE teacher_id = %s AND id = %s", (user_id, vocabulary_set_id))
    vocabulary_set = cursor.fetchone()
    cursor.nextset()
    
    if vocabulary_set is None: return errors.not_found_or_no_permission("Vocabulary Set", "update", user_role)
    
    # Check if the department is associated with the vocabulary set
    cursor.execute("SELECT id FROM mf_vocabulary_set_access WHERE vocabulary_set_id = %s AND department_id = %s", (vocabulary_set_id, department_id))
    existing_access = cursor.fetchone()
    cursor.nextset()
    
    if existing_access is None:
      return jsonify({'error': "Department already does not have access to this vocabulary set."}), 400
    
    # Remove the department from the vocabulary set
    cursor.execute("DELETE FROM mf_vocabulary_set_access WHERE vocabulary_set_id = %s AND department_id = %s", (vocabulary_set_id, department_id))
    conn.commit()
  
  return jsonify({})