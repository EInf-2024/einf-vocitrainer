from flask import jsonify

# TODO: Implement this route
def vocabulary_sets():
  """
  GET /api/vocabulary-sets

  **Response Format**
  .. code-block:: json
    {
      "sets": [
        {
          "id": 1,
          "label": "Vocabulary Set 1",
          "progress": 0.5,
          "wordsCount": 1
        }
      ]
    }
  """
  return jsonify({
    'sets': [
      {
        'id': 1,
        'label': 'Vocabulary Set 1',
        'progress': 0.5,
        'wordsCount': 1
      }
    ]
  })