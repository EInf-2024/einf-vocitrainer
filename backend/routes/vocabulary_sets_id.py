from flask import jsonify

# TODO: Implement this route
def vocabulary_sets_id(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  GET /api/vocabulary-sets/<int:vocabulary_set_id>

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "label": "Vocabulary Set 1",
      "progress": 0.5,
      "words": [
        {
          "id": 1,
          "word": "apple",
          "translation": "pomme",
          "successiveCorrect": 2,
          "correct": 5,
          "incorrect": 0
        }
      ]
    }
  """
  return jsonify({
    'id': 1,
    'label': 'Vocabulary Set 1',
    'progress': 0.5,
    'words': [
      {
        'id': 1,
        'word': 'apple',
        'translation': 'pomme',
        'successiveCorrect': 2,
        'correct': 5,
        'incorrect': 0
      }
    ]
  })