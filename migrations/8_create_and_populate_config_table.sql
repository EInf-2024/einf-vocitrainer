CREATE TABLE IF NOT EXISTS config (
  key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO config (key, value) VALUES (
  'access_token_ttl',
  '2592000' -- 1 Month
);

-- TODO: Add prompts here