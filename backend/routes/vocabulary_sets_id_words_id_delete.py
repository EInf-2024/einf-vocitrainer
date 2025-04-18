from flask import jsonify
from backend import connection
from backend import errors

def vocabulary_sets_id_words_id_delete(vocabulary_set_id: int, word_id: int, user_id: int, user_role: str):
  """
  DELETE /api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/delete

  **Response Format**
  .. code-block:: json
    { }
  """
  
  with connection.open() as (conn, cursor):
    # Delete the word from the vocabulary set but check if the user has access to the vocabulary set
    cursor.execute("""
      DELETE FROM mf_vocabulary_set_word WHERE id = %s AND vocabulary_set_id = %s AND vocabulary_set_id IN (
        SELECT id FROM mf_vocabulary_set WHERE teacher_id = %s
      )
    """, (word_id, vocabulary_set_id, user_id))
    conn.commit()
    
    if cursor.rowcount == 0: return errors.not_found_or_no_permission("Word", "delete", user_role)
  
  return jsonify({})