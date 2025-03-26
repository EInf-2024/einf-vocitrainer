CREATE TABLE IF NOT EXISTS mf_vocabulary_set_word (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vocabulary_set_id INT NOT NULL,
  word VARCHAR(32) NOT NULL,
  translation VARCHAR(32) NOT NULL,

  FOREIGN KEY (vocabulary_set_id) REFERENCES mf_vocabulary_set(id) ON DELETE CASCADE
);