CREATE TABLE IF NOT EXISTS mf_vocabulary_set_entry (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  vocabulary_set_id FOREIGN KEY REFERENCES mf_vocabulary_set(id),
  native_word VARCHAR(32) NOT NULL,
  foreign_word VARCHAR(32) NOT NULL
);