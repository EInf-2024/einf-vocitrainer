from flask import jsonify
from backend import connection
from typing import Any
from backend.config import get_config

MIN_LEARNED_SUCCESSIVE_CORRECT_COUNT: int = get_config('min_learned_successive_correct_count', int)
MIN_LEARNED_CORRECT_PERCENTAGE: float = get_config('min_learned_correct_percentage', float)

def vocabulary_sets_id_statistics(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  GET /api/vocabulary-sets/<int:vocabulary_set_id>/statistics

  **Response Format**
  .. code-block:: json
    {
      "wordsCount": 1,
      "departments": [
        {
          "id": 1,
          "label": "Department 1",
          "students": [
            {
              "id": 1,
              "username": "Student 1",
              "learnedCount": 1,
            }
          ]
        }
      ]
    }
  """
  statistics_response: dict[str, Any] = {}
  
  with connection.open() as (_conn, cursor):
    # Check if user has access to the vocabulary set
    cursor.execute("SELECT * FROM mf_vocabulary_set WHERE id = %s AND teacher_id = %s", (vocabulary_set_id, user_id))
    vocabulary_set = cursor.fetchone()
    cursor.nextset()
    
    if not vocabulary_set:
      return jsonify({'error': 'Vocabulary set not found or access denied'}), 404
    
    # Get the number of words in the vocabulary set
    cursor.execute("SELECT COUNT(*) AS words_count FROM mf_vocabulary_set_word WHERE vocabulary_set_id = %s", (vocabulary_set_id,))
    words_count = cursor.fetchone()['words_count']
    cursor.nextset()
    
    statistics_response['wordsCount'] = words_count
    
    # Get learned words count for all students in the vocabulary set
    cursor.execute("""
      SELECT
        student.department_id,
        progress.student_id,
        student.username,
        COUNT(progress.id) AS learned_count
      FROM
        mf_vocabulary_set_word_progress progress
      JOIN
        mf_vocabulary_set_word word ON progress.vocabulary_set_word_id = word.id
      JOIN
        mf_student student ON progress.student_id = student.id 
      WHERE
        word.vocabulary_set_id = %s
        AND (
          progress.successive_correct_count >= %s OR 
          (
            (progress.correct_count + progress.incorrect_count) > 0 AND 
            (progress.correct_count / NULLIF(progress.correct_count + progress.incorrect_count, 0)) > %s
          )
        )
      GROUP BY
        progress.student_id,
        student.username;
    """, (vocabulary_set_id, MIN_LEARNED_SUCCESSIVE_CORRECT_COUNT, MIN_LEARNED_CORRECT_PERCENTAGE))
    students_learn_progress = cursor.fetchall()
    cursor.nextset()
    
    departments_dict: dict[int, Any] = {}
    for student_learn_progress in students_learn_progress:
      student_department_id = student_learn_progress['department_id']
      
      # Fetch department name if not already fetched
      if student_department_id not in departments_dict:
        cursor.execute("SELECT label FROM mf_department WHERE id = %s", (student_department_id,))
        department = cursor.fetchone()
        cursor.nextset()
        
        departments_dict[student_department_id] = {
          'id': student_department_id,
          'label': department['label'],
          'students': []
        }
        
      # Add student to the department
      departments_dict[student_department_id]['students'].append({
        'id': student_learn_progress['student_id'],
        'username': student_learn_progress['username'],
        'learnedCount': student_learn_progress['learned_count']
      })
    
    # Convert departments_dict to a list
    statistics_response['departments'] = list(departments_dict.values())
  
  return jsonify(statistics_response)