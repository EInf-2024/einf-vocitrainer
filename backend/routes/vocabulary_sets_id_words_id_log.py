from flask import jsonify

# TODO: Implement this route
def vocabulary_sets_id_words_id_log(vocabulary_set_id: int, word_id: int):
  """
  PATCH /api/vocabulary-sets/<int:vocabulary_set_id>/words/<int:word_id>/log

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
  return jsonify({
    "isCorrect": True,
    "correctAnswer": "pomme",
    "successiveCorrectCount": 1,
    "correctCount": 1,
    "incorrectCount": 0
  })