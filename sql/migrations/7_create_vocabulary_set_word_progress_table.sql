CREATE TABLE IF NOT EXISTS mf_vocabulary_set_word_progress (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vocabulary_set_word_id INT NOT NULL,
  student_id INT NOT NULL,
  successive_correct_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL,

  FOREIGN KEY (vocabulary_set_word_id) REFERENCES mf_vocabulary_set_word(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES mf_student(id) ON DELETE CASCADE
);