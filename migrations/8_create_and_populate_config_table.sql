CREATE TABLE IF NOT EXISTS mf_config (
  config_key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO mf_config (config_key, value) VALUES 
  ('access_token_ttl', '2592000'); -- 1 Month

-- TODO: Add prompts here