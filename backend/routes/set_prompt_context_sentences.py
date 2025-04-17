from flask import jsonify, request
import backend.connection as connection

def set_prompt_context_sentences(user_id: int, user_role: str):
  """
  POST /api/set-prompt/context-sentences
  
  **Request Format**
  .. code-block:: json
    {
      "prompt": "Vocabulary Set 1"
    }
  
  **Response Format**
  .. code-block:: json
    {
      "prompt": "Vocabulary Set 1"
    }
  """
  data = request.get_json()
  
  if 'prompt' not in data:
    return jsonify({'error': "Missing prompt key."}), 400
  
  prompt = data['prompt']
  
  with connection.open() as (conn, cursor):
    cursor.execute("UPDATE mf_config SET value = %s WHERE config_key = 'ai_context_sentence_prompt'", (prompt,))
    conn.commit()
    
  return jsonify({
    'prompt': prompt
  })
  