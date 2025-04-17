CREATE TABLE IF NOT EXISTS mf_config (
  config_key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL
);

DELETE FROM mf_config WHERE config_key = 'access_token_ttl';
INSERT INTO mf_config (config_key, value) VALUES 
  ('access_token_ttl', '2592000'); -- 1 Month

DELETE FROM mf_config WHERE config_key = 'min_learned_successive_correct_count';
INSERT INTO mf_config (config_key, value) VALUES 
  ('min_learned_successive_correct_count', '2');

DELETE FROM mf_config WHERE config_key = 'min_learned_correct_percentage';
INSERT INTO mf_config (config_key, value) VALUES 
  ('min_learned_correct_percentage', '0.5');

DELETE FROM mf_config WHERE config_key = 'ai_model';
INSERT INTO mf_config (config_key, value) VALUES
  ('ai_model', 'gpt-4o-mini');

DELETE FROM mf_config WHERE config_key = 'ai_context_sentence_prompt';
INSERT INTO mf_config (config_key, value) VALUES 
  ('ai_context_sentence_prompt', '
You are a teacher. You have to create a context sentence for each word in the word list provided below. There should only be one sentence for one word. No duplicates.
The context sentence should be a simple sentence that uses the word in a way that is easy to understand.
The sentence should be in French. It is important to use the word in a way that is appropriate for the context. The sentence should be simple and easy to understand.
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
  ');