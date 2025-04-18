from flask import jsonify, request
import backend.connection as connection
from backend import errors

def vocabulary_sets_id_words_create(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  POST /api/vocabulary-sets/<int:vocabulary_set_id>/words/create
  
  **Request Format**
  .. code-block:: json
    {
      "word": "string",
      "translation": "string"
    }

  **Response Format**
  .. code-block:: json
    {
      "id": 0
    }
  """
  data = request.get_json()
  
  if 'word' not in data or 'translation' not in data: errors.missing_keys('word', 'translation')
  word = data['word']
  translation = data['translation']
  
  with connection.open() as (conn, cursor):
    # Check if the vocabulary set exists
    cursor.execute("SELECT id FROM mf_vocabulary_set WHERE id = %s AND teacher_id = %s", (vocabulary_set_id, user_id))
    vocabulary_set = cursor.fetchone()
    cursor.nextset()
    
    if vocabulary_set is None: return errors.not_found_or_no_permission("Vocabulary set", "create a word in", user_role)
    
    # Insert the new word into the vocabulary set
    cursor.execute("INSERT INTO mf_vocabulary_set_word (vocabulary_set_id, word, translation) VALUES (%s, %s, %s)", (vocabulary_set_id, word, translation))
    conn.commit()
    
    word_id = cursor.lastrowid
  
  return jsonify({
    "id": word_id
  }), 201