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
    # Delete the vocabulary set (but check if the user has permission to delete the vocabulary set)
    cursor.execute("""
      DELETE FROM mf_vocabulary_set WHERE id = %s AND id IN (
        SELECT id FROM mf_vocabulary_set WHERE teacher_id = %s
      )
    """, (vocabulary_set_id, user_id))
    conn.commit()
    
    # Check if the vocabulary set did even exist
    if cursor.rowcount == 0:
      return jsonify({'error': "Vocabulary set not found or you do not have permission to delete this vocabulary set."}), 404
  
  return jsonify({})