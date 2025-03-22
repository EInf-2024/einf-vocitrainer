# Download files

Im Terminal (Unten links)
```bash
git pull
```

# Upload files

Oben links auf Linie mit Punkt in der Mitte klicken
-> Commit and Push

---

POST /api/department?id=<ID> (id parameter is optional)

header
```yaml
Authorization: ACCESS_TOKEN
```

body
```json
{
  "label": "LABEL"
  "students": [
    {
      "username": "USERNAME"
    }
  ]
}
```

response
```json
{
  "id": "ID",
  "label": "LABEL",
  "students": [
    {
      "id": "ID",
      "username": "USERNAME"
    }
  ]
}
```

---

GET /api/vocabulary-set

header
```yaml
Authorization: ACCESS_TOKEN
```

response
```json
{
  "sets": [
    {
      "id": "ID",
      "label": "LABEL",
      "progress": 0.5,
      "words": [
        {
          "id": "ID",
          "word": "WORD",
          "translation": "TRANSLATION",
          "correct": 5,
          "wrong": 3
        }
      ]
    }
  ]
}
```

---

GET /api/vocabulary-set?id=<ID>

header
```yaml
Authorization: ACCESS_TOKEN
```

response
```json
{
  "id": "ID",
  "label": "LABEL",
  "progress": 0.5,
  "words": [
    {
      "id": "ID",
      "word": "WORD",
      "translation": "TRANSLATION",
      "correct": 5,
      "wrong": 3
    }
  ]
}
```

---

POST /api/vocabulary-set?id=<ID> (id parameter is optional)

header
```yaml
Authorization: ACCESS_TOKEN
```

body
```json
{
  "label": "LABEL",
  "words": [
    {
      "word": "WORD",
      "translation": "TRANSLATION"
    }
  ]
}
```

---

UPDATE /api/study/log?word=<ID>

header
```yaml
Authorization: ACCESS_TOKEN
```

body
```json
{
  "translation": "TRANSLATION"
}
```

response
```json
{
  "correct": false
}
```

---

GET /api/study/generate-sentences?set=<ID>

header
```yaml
Authorization: ACCESS_TOKEN
```

response
```json
{
  "sentences": [
    {
      "wordId": "ID",
      "sentence": "SENTENCE WITH A BLANK SPACE"
    }
  ]
}
```