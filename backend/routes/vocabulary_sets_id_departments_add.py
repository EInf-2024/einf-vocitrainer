from flask import jsonify, request
import backend.connection as connection

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
  
  if 'id' not in data:
    return jsonify({'error': "Missing id key."}), 400
  
  department_id = data['id']
  
  with connection.open() as (conn, cursor):
    # Check if the vocabulary set exists and belongs to the teacher
    cursor.execute("SELECT id FROM mf_vocabulary_set WHERE teacher_id = %s AND id = %s", (user_id, vocabulary_set_id))
    vocabulary_set = cursor.fetchone()
    cursor.nextset()
    
    if vocabulary_set is None:
      return jsonify({'error': "Vocabulary set not found or does not belong to the teacher."}), 404
    
    # Check if the department exists and belongs to the teacher
    cursor.execute("SELECT id FROM mf_department WHERE teacher_id = %s AND id = %s", (user_id, department_id))
    department = cursor.fetchone()
    cursor.nextset()
    
    if department is None:
      return jsonify({'error': "Department not found or does not belong to the teacher."}), 404
    
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