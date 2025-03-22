CREATE TABLE IF NOT EXISTS mf_config (
  config_key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL
);

-- Delete if already exists
DELETE FROM mf_config WHERE config_key = 'access_token_ttl';
INSERT INTO mf_config (config_key, value) VALUES 
  ('access_token_ttl', '2592000'); -- 1 Month

-- TODO: Add prompts here