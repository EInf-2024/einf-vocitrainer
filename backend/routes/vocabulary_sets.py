from flask import jsonify
import backend.connection as connection
from typing import Any

def vocabulary_sets(user_id: int, user_role: str):
  """
  GET /api/vocabulary-sets

  **Response Format**
  .. code-block:: json
    {
      "sets": [
        {
          "id": 1,
          "label": "Vocabulary Set 1",
          "wordsCount": 1,
          "learnedCount": 1
        }
      ]
    }
  """
  vocabulary_sets_response: list[dict[str, Any]] = []
  
  with connection.open() as (_conn, cursor):
    # Get user vocabulary sets
    vocabulary_sets = _get_users_vocabulary_sets(cursor, user_id, user_role)
  
    for vocabulary_set in vocabulary_sets:
      vocabulary_set_id = vocabulary_set['id']
      words_count, learned_count = _get_vocabulary_set_info(cursor, vocabulary_set_id, user_id, user_role)        
      
      vocabulary_sets_response.append({
        'id': vocabulary_set['id'],
        'label': vocabulary_set['label'],
        'wordsCount': words_count,
        'learnedCount': learned_count
      })
    
  return jsonify({
    'sets': vocabulary_sets_response
  })
  
def _get_users_vocabulary_sets(cursor: Any, user_id: int, user_role: str) -> Any:
  if user_role == 'teacher':
    cursor.execute("SELECT * FROM mf_vocabulary_set WHERE teacher_id = %s", (user_id,))
    vocabulary_sets = cursor.fetchall()
    cursor.nextset()
    
    return vocabulary_sets
    
  if user_role == 'student':
    cursor.execute("""
      SELECT * FROM mf_vocabulary_set WHERE id IN (
        SELECT vocabulary_set_id FROM mf_vocabulary_set_access WHERE department_id IN (
          SELECT department_id FROM mf_student WHERE id = %s
        )
      )""", (user_id,))
    vocabulary_sets = cursor.fetchall()
    cursor.nextset()
    
    return vocabulary_sets
  
  return []

def _get_vocabulary_set_info(cursor: Any, vocabulary_set_id: int, user_id: int, user_role: str) -> tuple[int, int]:
  cursor.execute("SELECT COUNT(id) AS words_count FROM mf_vocabulary_set_word WHERE vocabulary_set_id = %s", (vocabulary_set_id,))
  words_count = cursor.fetchone()['words_count']
  cursor.nextset()
  
  learned_count = words_count # Default to all words learned
  if user_role == 'student':
    cursor.execute("""
      SELECT COUNT(DISTINCT word.id) AS learned_count
      FROM mf_vocabulary_set_word word
      JOIN mf_vocabulary_set_word_progress progress ON word.id = progress.vocabulary_set_word_id
      WHERE word.vocabulary_set_id = %s
        AND progress.student_id = %s
        AND (
          progress.successive_correct_count >= 2 OR
          (
            (progress.correct_count + progress.incorrect_count) > 0 AND 
            (progress.correct_count / NULLIF(progress.correct_count + progress.incorrect_count, 0)) > 0.5 
          )
        )
    """, (vocabulary_set_id, user_id)) # TODO: Add progress criteria to the DB config table
    learned_count = cursor.fetchone()['learned_count']
    cursor.nextset()

  return (words_count, learned_count)