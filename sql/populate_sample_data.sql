-- Teachers
INSERT INTO mf_teacher (abbreviation, password_hash) VALUES ('TST', '$2b$12$AyBYEYneXUwNvxWu3w/l3OGhSpKXguctiMX2sQKGKAZskblIYkroy'); -- Password 1234

-- Departments
INSERT INTO mf_department (teacher_id, label) VALUES (1, 'G2025D');

-- Students
INSERT INTO mf_student (department_id, username, password_hash) VALUES (1, 'STU', '$2b$12$AyBYEYneXUwNvxWu3w/l3OGhSpKXguctiMX2sQKGKAZskblIYkroy'); -- Password 1234
INSERT INTO mf_student (department_id, username, password_hash) VALUES (1, 'STU2', '$2b$12$AyBYEYneXUwNvxWu3w/l3OGhSpKXguctiMX2sQKGKAZskblIYkroy'); -- Password 1234
INSERT INTO mf_student (department_id, username, password_hash) VALUES (1, 'STU3', '$2b$12$AyBYEYneXUwNvxWu3w/l3OGhSpKXguctiMX2sQKGKAZskblIYkroy'); -- Password 1234

-- Vocabulary Set
INSERT INTO mf_vocabulary_set (teacher_id, label) VALUES (1, 'Test Set 1');
INSERT INTO mf_vocabulary_set (teacher_id, label) VALUES (1, 'Test Set 2');

-- Vocabulary Set Access
INSERT INTO mf_vocabulary_set_access (vocabulary_set_id, department_id) VALUES (1, 1);
INSERT INTO mf_vocabulary_set_access (vocabulary_set_id, department_id) VALUES (2, 1);

-- Vocabulary Set Words
-- Vocabulary Set 1
INSERT INTO mf_vocabulary_set_word (vocabulary_set_id, word, translation) VALUES (1, 'Apfel', 'Pomme');
INSERT INTO mf_vocabulary_set_word (vocabulary_set_id, word, translation) VALUES (1, 'Birne', 'Poire');
INSERT INTO mf_vocabulary_set_word (vocabulary_set_id, word, translation) VALUES (1, 'Banane', 'Banane');

-- Vocabulary Set 2
INSERT INTO mf_vocabulary_set_word (vocabulary_set_id, word, translation) VALUES (2, 'Hund', 'Chien');
INSERT INTO mf_vocabulary_set_word (vocabulary_set_id, word, translation) VALUES (2, 'Katze', 'Chat');
INSERT INTO mf_vocabulary_set_word (vocabulary_set_id, word, translation) VALUES (2, 'Maus', 'Souris');

-- Vocabulary Set Progress
-- Student 1
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (1, 1, 20, 100, 30);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (2, 1, 10, 50, 20);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (3, 1, 5, 25, 10);

INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (4, 1, 20, 100, 30);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (5, 1, 10, 50, 20);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (6, 1, 5, 25, 10);

-- Student 2
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (1, 2, 20, 100, 30);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (2, 2, 10, 50, 20);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (3, 2, 5, 25, 10);

INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (4, 2, 20, 100, 30);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (5, 2, 10, 50, 20);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (6, 2, 5, 25, 10);

-- Student 3
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (1, 3, 20, 100, 30);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (2, 3, 10, 50, 20);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (3, 3, 5, 25, 10);

INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (4, 3, 20, 100, 30);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (5, 3, 10, 50, 20);
INSERT INTO mf_vocabulary_set_word_progress (vocabulary_set_word_id, student_id, successive_correct_count, correct_count, incorrect_count) VALUES (6, 3, 5, 25, 10);