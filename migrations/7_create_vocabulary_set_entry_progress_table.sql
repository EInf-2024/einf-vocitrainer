CREATE TABLE IF NOT EXISTS mf_vocabulary_set_entry_progress (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  vocabulary_set_entry_id INT NOT NULL REFERENCES mf_vocabulary_set_entry(id),
  student_id INT NOT NULL REFERENCES mf_student(id),
  successive_correct_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL
);