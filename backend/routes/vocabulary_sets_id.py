from flask import jsonify
import backend.connection as connection
from typing import Any
from backend.config import get_config
from backend import errors

MIN_LEARNED_SUCCESSIVE_CORRECT_COUNT: int = get_config('min_learned_successive_correct_count', int)
MIN_LEARNED_CORRECT_PERCENTAGE: float = get_config('min_learned_correct_percentage', float)

def vocabulary_sets_id(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  GET /api/vocabulary-sets/<int:vocabulary_set_id>

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "label": "Vocabulary Set 1",
      "wordsCount": 1,
      "learnedCount": 1,
      "words": [
        {
          "id": 1,
          "word": "Hello",
          "translation": "Bonjour",
          "successiveCorrect": 2,
          "correct": 5,
          "incorrect": 0,
          "learned": true
        }
      ]
    }
  """
  vocabulary_set_response: dict[str, Any] = {}
  
  with connection.open() as (_conn, cursor):
    vocabulary_set: Any = None
    
    # Check if user has access to the vocabulary set and fetch it
    if user_role == 'teacher':
      cursor.execute("SELECT * FROM mf_vocabulary_set WHERE id = %s AND teacher_id = %s", (vocabulary_set_id, user_id))
      vocabulary_set = cursor.fetchone()
      cursor.nextset()
    elif user_role == 'student':
      cursor.execute("""
        SELECT * FROM mf_vocabulary_set WHERE id = %s AND id IN (
          SELECT vocabulary_set_id FROM mf_vocabulary_set_access WHERE department_id IN (
            SELECT department_id FROM mf_student WHERE id = %s
          )
        )
      """, (vocabulary_set_id, user_id))
      vocabulary_set = cursor.fetchone()
      cursor.nextset()
      
    if not vocabulary_set: return errors.not_found_or_no_permission("Vocabulary set", "view", user_role)
    vocabulary_set_response['id'] = vocabulary_set['id']
    vocabulary_set_response['label'] = vocabulary_set['label']
    
    words_response: list[dict[str, Any]] = []
    learned_words_count: int = 0
    
    # Get words in the vocabulary set and their progress (from mf_vocabulary_set_word_progress table)
    cursor.execute("""
      SELECT * 
      FROM mf_vocabulary_set_word word
      LEFT JOIN mf_vocabulary_set_word_progress progress ON word.id = progress.vocabulary_set_word_id 
        AND (
          %s != 'teacher' AND 
          progress.student_id = %s
        )
      WHERE word.vocabulary_set_id = %s
    """, (user_role, user_id, vocabulary_set_id))
    words = cursor.fetchall()
    
    for word in words:
      # Add default values for None fields (for teacher, they're all None and if the student has never answered, they're also None)
      if word['successive_correct_count'] is None: word['successive_correct_count'] = 0
      if word['correct_count'] is None: word['correct_count'] = 0
      if word['incorrect_count'] is None: word['incorrect_count'] = 0
      
      learned = True # Default to learned (for teacher - he should know all words, right? haha)
      
      # Check if the word is learned
      if user_role == 'student' and (
        # Never answered
        word['correct_count'] + word['incorrect_count'] == 0 or
        # Successive correct count is not enough and correct percentage is not enough
        (
          word['successive_correct_count'] < MIN_LEARNED_SUCCESSIVE_CORRECT_COUNT and
          word['correct_count'] / (word['correct_count'] + word['incorrect_count']) < MIN_LEARNED_CORRECT_PERCENTAGE
        )
      ): learned = False
      
      if learned: learned_words_count += 1
      
      words_response.append({
        'id': word['id'],
        'word': word['word'],
        'translation': word['translation'],
        'successiveCorrect': word['successive_correct_count'],
        'correct': word['correct_count'],
        'incorrect': word['incorrect_count'],
        'learned': learned
      })
    
    vocabulary_set_response['words'] = words_response
    vocabulary_set_response['wordsCount'] = len(words_response)
    vocabulary_set_response['learnedCount'] = learned_words_count
    
  return jsonify(vocabulary_set_response), 200