from flask import jsonify
import backend.connection as connection
from pydantic import BaseModel
import openai
import dotenv
from backend.config import get_config

class ContextSentence(BaseModel):
  sentence: str
  correct: str
  
class ContextSentencesResponseFormat(BaseModel):
  contextSentences: list[ContextSentence]

OPENAI_MODEL: str = get_config('ai_model', str)

dotenv.load_dotenv()
openai_client = openai.OpenAI()

def vocabulary_sets_id_generate_context_sentences(vocabulary_set_id: int, user_id: int, user_role: str):
  """
  GET /api/vocabulary-sets/<int:vocabulary_set_id>/generate-context-sentences

  **Response Format**
  .. code-block:: json
    {
      "contextSentences": [
        {
          "wordId": 1,
          "sentence": "I am a {}.",
          "correct": "student"
        }
      ]
    }
  """
  
  with connection.open() as (_conn, cursor):
    # Check if the vocabulary set exists
    cursor.execute("SELECT id FROM mf_vocabulary_set WHERE id = %s", (vocabulary_set_id,))
    vocabulary_set = cursor.fetchone()
    
    if vocabulary_set is None:
      return jsonify({"error": "Vocabulary set not found."}), 404
    
    # Check if the user has access to the vocabulary set
    if user_role == 'teacher':
      cursor.execute("SELECT id FROM mf_vocabulary_set WHERE id = %s AND teacher_id = %s", (vocabulary_set_id, user_id))
    else:
      cursor.execute("""
        SELECT id FROM mf_vocabulary_set_access WHERE vocabulary_set_id = %s AND department_id IN (
          SELECT department_id FROM mf_student WHERE id = %s
        )
      """, (vocabulary_set_id, user_id))
      
    access = cursor.fetchone()
    cursor.nextset()
    
    if access is None:
      return jsonify({"error": "You do not have access to this vocabulary set."}), 403
    
    # Get the vocabulary set words
    cursor.execute("SELECT id, translation FROM mf_vocabulary_set_word WHERE vocabulary_set_id = %s", (vocabulary_set_id,))
    vocabulary_set_words = cursor.fetchall()
    cursor.nextset()
    
  prompt = None
  try: prompt = get_config('ai_context_sentence_prompt', str)
  except AssertionError: return jsonify({"error": "The AI context sentence prompt is not set."}), 500
  
  prompt = get_config('ai_context_sentence_prompt', str).replace("{word_list}", ", ".join([word['translation'] for word in vocabulary_set_words]))
    
  completion = openai_client.beta.chat.completions.parse(
    model=OPENAI_MODEL,
    messages=[{"role": "user", "content": prompt}],
    max_tokens=50 * len(vocabulary_set_words),
    response_format=ContextSentencesResponseFormat
  ).choices[0]
  
  if completion.message.refusal is not None:
    return jsonify({"error": "The model refused to generate context sentences."}), 500
  
  if completion.message.parsed is None:
    return jsonify({"error": "The model did not generate any context sentences."}), 500
  
  generated_context_sentences = completion.message.parsed.contextSentences
  
  return jsonify({
    "contextSentences": [
      {
        "wordId": word["id"],
        "sentence": context_sentence.sentence,
        "correct": context_sentence.correct
      } for word, context_sentence in zip(vocabulary_set_words, generated_context_sentences) if context_sentence.sentence and context_sentence.correct
    ]
  })