from flask import jsonify, request
import backend.connection as connection
from backend import errors

def vocabulary_sets_id_departments_add(vocabulary_set_id: int, user_id: int, user_role: str):
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
  data = request.get_json()
  
  if 'id' not in data: return errors.missing_keys('id')
  department_id = data['id']
  
  with connection.open() as (conn, cursor):
    # Validate both vocabulary set and department ownership in one go
    cursor.execute("""
      SELECT
        (SELECT id FROM mf_vocabulary_set WHERE id = %s AND teacher_id = %s) AS vocabulary_set_id,
        (SELECT id FROM mf_department WHERE id = %s AND teacher_id = %s) AS department_id
    """, (vocabulary_set_id, user_id, department_id, user_id))
    ownership_result = cursor.fetchone()
    cursor.nextset()
    
    if not ownership_result['vocabulary_set_id']: return errors.not_found_or_no_permission("Vocabulary Set", "update", user_role)
    if not ownership_result['department_id']: return errors.not_found_or_no_permission("Department", "update", user_role)
    
    # Check if the department is already associated with the vocabulary set
    cursor.execute("SELECT id FROM mf_vocabulary_set_access WHERE vocabulary_set_id = %s AND department_id = %s", (vocabulary_set_id, department_id))
    existing_access = cursor.fetchone()
    cursor.nextset()
    
    if existing_access is not None:
      return jsonify({'error': "Department already has access to this vocabulary set."}), 400
    
    # Add the department to the vocabulary set
    cursor.execute("INSERT INTO mf_vocabulary_set_access (vocabulary_set_id, department_id) VALUES (%s, %s)", (vocabulary_set_id, department_id))
    conn.commit()
  
  return jsonify({})