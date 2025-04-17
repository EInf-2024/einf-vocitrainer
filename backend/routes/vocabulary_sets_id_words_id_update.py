from flask import jsonify, request
from backend import connection

def vocabulary_sets_id_words_id_update(vocabulary_set_id: int, word_id: int, user_id: int, user_role: str):
  """
  PATCH /api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/update
  
  **Request Format**
  .. code-block:: json
    {
      "word": "new_word",
      "translation": "new_translation"
    }

  **Response Format**
  .. code-block:: json
    { }
  """
  data = request.get_json()
  
  if 'word' not in data or 'translation' not in data:
    return jsonify({'error': "Missing word or translation key."}), 400
  
  new_word = data['word']
  new_translation = data['translation']
  
  with connection.open() as (conn, cursor):
    # Update the word in the vocabulary set (but only if the user has permission to do so)
    cursor.execute("""
      UPDATE mf_vocabulary_set_word
      SET word = %s, translation = %s
      WHERE id = %s AND vocabulary_set_id = %s AND vocabulary_set_id IN (
        SELECT id FROM mf_vocabulary_set WHERE teacher_id = %s
      )
    """, (new_word, new_translation, word_id, vocabulary_set_id, user_id))
    conn.commit()
    
    if cursor.rowcount == 0:
      return jsonify({'error': "Word not found or you do not have permission to update this word."}), 404
  
  return jsonify({})