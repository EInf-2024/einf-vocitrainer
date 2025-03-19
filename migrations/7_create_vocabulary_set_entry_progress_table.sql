CREATE TABLE IF NOT EXISTS vocabulary_set_entry_progress (
  id SERIAL PRIMARY KEY AUTO INCREMENT,
  vocabulary_set_entry_id FOREIGN KEY REFERENCES vocabulary_set_entry(id),
  student_id FOREIGN KEY REFERENCES student(id),
  successive_correct_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  incorrect_count INTEGER NOT NULL
);