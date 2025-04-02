from flask import jsonify, request
import backend.connection as connection

def vocabulary_sets_create(user_id: int, user_role: str):
  """
  POST /api/vocabulary-sets/create
  
  **Request Format**
  .. code-block:: json
    {
      "label": "Vocabulary Set 1"
    }

  **Response Format**
  .. code-block:: json
    {
      "id": 1,
      "label": "Vocabulary Set 1"
    }
  """
  data = request.get_json()
  
  if "label" not in data:
    return jsonify({"error": "Missing label"}), 400
  
  vocabulary_set_label = data["label"]
  
  with connection.open() as (conn, cursor):
    # Create the vocabulary set
    cursor.execute("INSERT INTO mf_vocabulary_set (teacher_id, label) VALUES (%s, %s)", (user_id, vocabulary_set_label))
    conn.commit()
    
    vocabulary_set_id = cursor.lastrowid
  
  return jsonify({
    "id": vocabulary_set_id,
    "label": vocabulary_set_label
  }), 201