from flask import jsonify, request
from backend import connection

def vocabulary_sets_id_words_id_log(vocabulary_set_id: int, word_id: int, user_id: int, user_role: str):
  """
  PATCH /api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/log
  
  **Request Format**
  .. code-block:: json
    {
      "answer": "string"
    }

  **Response Format**
  .. code-block:: json
    {
      "isCorrect": true,
      "correctAnswer": "pomme",
      "successiveCorrectCount": 1,
      "correctCount": 1,
      "incorrectCount": 0
    }
  """
  data = request.get_json()
  
  if 'answer' not in data:
    return jsonify({'error': "Missing answer key."}), 400
  
  answer = data['answer']
  
  with connection.open() as (conn, cursor):
    # Check if the user has access to the vocabulary set
    cursor.execute("""
      SELECT * FROM mf_vocabulary_set_access
      WHERE vocabulary_set_id = %s AND department_id IN (
        SELECT department_id FROM mf_student WHERE id = %s
      )
    """, (vocabulary_set_id, user_id))
    access = cursor.fetchone()
    cursor.nextset()
    
    if access is None:
      return jsonify({'error': "You don't have access to this vocabulary set."}), 403
    
    # Get correct answer from the database
    cursor.execute("""
      SELECT translation FROM mf_vocabulary_set_word
      WHERE id = %s AND vocabulary_set_id = %s
    """, (word_id, vocabulary_set_id))
    correct_answer = cursor.fetchone()
    cursor.nextset()
    
    if correct_answer is None:
      return jsonify({'error': "Word not found."}), 404
    
    correct_answer = correct_answer['translation']
    correct = answer == correct_answer # TODO: Make this case insensitive and other stuff
    
    # Get the current progress for the word
    cursor.execute("""
      SELECT * FROM mf_vocabulary_set_word_progress
      WHERE vocabulary_set_word_id = %s AND student_id = %s
    """, (word_id, user_id))
    current_progress = cursor.fetchone()
    cursor.nextset()
    
    # If the progress row does not exist, create it
    if current_progress is None:
      cursor.execute("""
        INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count)
        VALUES (%s, %s, 0, 0, 0)
      """, (word_id, user_id))
      conn.commit()
    
    # Update the log in the database
    cursor.execute("""
      UPDATE mf_vocabulary_set_word_progress
      SET
        successive_correct_count = CASE WHEN %s THEN successive_correct_count + 1 ELSE 0 END,
        correct_count = correct_count + CASE WHEN %s THEN 1 ELSE 0 END,
        incorrect_count = incorrect_count + CASE WHEN NOT %s THEN 1 ELSE 0 END
      WHERE vocabulary_set_word_id = %s AND student_id = %s
    """, (correct, correct, correct, word_id, user_id))
    conn.commit()
    
    # Get the updated progress
    cursor.execute("""
      SELECT * FROM mf_vocabulary_set_word_progress
      WHERE vocabulary_set_word_id = %s AND student_id = %s
    """, (word_id, user_id))
    current_progress = cursor.fetchone()
    
    if not current_progress:
      return jsonify({'error': "Failed to update the log."}), 500
    
    successive_correct_count = current_progress['successive_correct_count']
    correct_count = current_progress['correct_count']
    incorrect_count = current_progress['incorrect_count']  
  
  return jsonify({
    'isCorrect': correct,
    'correctAnswer': correct_answer,
    'successiveCorrectCount': successive_correct_count,
    'correctCount': correct_count,
    'incorrectCount': incorrect_count
  })