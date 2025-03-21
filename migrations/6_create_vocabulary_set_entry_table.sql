CREATE TABLE IF NOT EXISTS mf_vocabulary_set_entry (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vocabulary_set_id INT NOT NULL REFERENCES mf_vocabulary_set(id),
  native_word VARCHAR(32) NOT NULL,
  foreign_word VARCHAR(32) NOT NULL
);