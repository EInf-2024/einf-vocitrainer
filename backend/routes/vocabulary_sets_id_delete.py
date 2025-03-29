from flask import jsonify
import backend.connection as connection

def vocabulary_sets_id_delete(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  DELETE /api/vocabulary-sets/<int:vocabulary_set_id>/delete

  **Response Format**
  .. code-block:: json
    { }
  """
  
  with connection.open() as (conn, cursor):
    # Check if the vocabulary set belongs to the teacher
    cursor.execute("SELECT id FROM mf_vocabulary_set WHERE teacher_id = %s AND id = %s", (user_id, vocabulary_set_id))
    vocabulary_set = cursor.fetchone()
    cursor.nextset()
    
    if vocabulary_set is None:
      return jsonify({'error': "You are not allowed to delete this vocabulary set."}), 403
    
    # Delete the vocabulary set
    cursor.execute("DELETE FROM mf_vocabulary_set WHERE id = %s", (vocabulary_set_id,))
    conn.commit()
    
    # Check if the vocabulary set did even exist
    if cursor.rowcount == 0:
      return jsonify({'error': "Vocabulary set not found."}), 404
  
  return jsonify({})