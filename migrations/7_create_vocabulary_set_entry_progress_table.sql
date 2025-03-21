CREATE TABLE IF NOT EXISTS mf_vocabulary_set_entry_progress (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  vocabulary_set_entry_id FOREIGN KEY REFERENCES mf_vocabulary_set_entry(id),
  student_id FOREIGN KEY REFERENCES mf_student(id),
  successive_correct_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL
);