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

-- TODO: Add prompts here