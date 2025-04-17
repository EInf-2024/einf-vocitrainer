from flask import jsonify

# TODO: Implement this route
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
          "name": "Department 1",
          "students": [
            {
              "id": 1,
              "name": "Student 1",
              "learnedCount": 1,
            }
          ]
        }
      ]
    }
  """
  return jsonify({
    "wordsCount": 2,
    "departments": [
      {
        "id": 1,
        "name": "Department 1",
        "students": [
          {
            "id": 1,
            "name": "Student 1",
            "learnedCount": 1,
          }
        ]
      }
    ]
  })