from flask import jsonify
import backend.connection as connection
from pydantic import BaseModel
import openai
import dotenv

dotenv.load_dotenv()

class ContextSentence(BaseModel):
  sentence: str
  correct: str
  
class ContextSentencesResponseFormat(BaseModel):
  contextSentences: list[ContextSentence]

OPENAI_MODEL = "gpt-4o-mini" # TODO: Add this to the DB config table
CONTEXT_SENTENCE_PROMPT = """
You are a teacher. You have to create a context sentence for each word in the word list provided below. There should only be one sentence for one word. No duplicates.
The context sentence should be a simple sentence that uses the word in a way that is easy to understand.
The sentence should be in French. It's important to use the word in a way that is appropriate for the context. The sentence should be simple and easy to understand.
The level of difficulty of the sentence should be around the word list provided below.
Try your very best to create a context sentence that is the appropriate difficulty, does not fit any other word in the list provided below and fits the word provided.
So your context sentence should always contain {} in the sentence instead of the word itself. The word should be in the "correct" key.
There should absolutely be no sentences that can be used for more than one word in the list provided below. A tip is to use many adjectives. 
If you do generate dual-meaning sentences, I will pour water on your server and you will go out of service.
Keep the order of the words in the list provided below. The first word in the list should be the first context sentence, the second word in the list should be the second context sentence and so on.

Here is a sample of the response format:
.. code-block:: json
{
  "contextSentences": [
    {
      "sentence": "I am a {}.",
      "correct": "student",
    }
  ]
}

The word list is: {word_list}
""" # TODO: Add this to the DB config table
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
          "correct": "student",
        }
      ]
    }
  """
  # context_sentences: list[dict[str, Any]] = []
  
  with connection.open() as (_conn, cursor):
    # Check if the vocabulary set exists
    cursor.execute("SELECT id FROM mf_vocabulary_set WHERE id = %s", (vocabulary_set_id,))
    vocabulary_set = cursor.fetchone()
    
    if vocabulary_set is None:
      return jsonify({"error": "Vocabulary set not found."}), 404
    
    # Check if the user has access to the vocabulary set
    cursor.execute("""
      SELECT id FROM mf_vocabulary_set_access WHERE vocabulary_set_id = %s AND department_id IN (
        SELECT department_id FROM mf_student WHERE id = %s
      )
    """, (vocabulary_set_id, user_id))
    access = cursor.fetchone()
    
    if access is None:
      return jsonify({"error": "You do not have access to this vocabulary set."}), 403
    
    # Get the vocabulary set words
    cursor.execute("SELECT id, translation FROM mf_vocabulary_set_word WHERE vocabulary_set_id = %s", (vocabulary_set_id,))
    vocabulary_set_words = cursor.fetchall()
    cursor.nextset()
  
  prompt = CONTEXT_SENTENCE_PROMPT.replace("{word_list}", ", ".join([word['translation'] for word in vocabulary_set_words]))
    
  completion = openai_client.beta.chat.completions.parse(
    model=OPENAI_MODEL,
    messages=[{"role": "user", "content": prompt}],
    max_tokens=500,
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