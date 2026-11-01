# Tutorial manifest

The renderer accepts UTF-8 JSON. Paths are relative to the manifest file unless absolute.

## Example

```json
{
  "title": "Benutzerkonto einrichten",
  "subtitle": "Schritt-für-Schritt-Anleitung",
  "language": "de",
  "sections": [
    {
      "title": "Konto anlegen",
      "intro": "In diesem Abschnitt erstellen Sie das Konto und prüfen die Angaben.",
      "screens": [
        {
          "title": "Kontodaten erfassen",
          "image": "images/01-kontodaten.png",
          "caption": "Formular vor dem Speichern",
          "annotations": [
            {"number": 1, "box": [0.12, 0.28, 0.52, 0.09], "label": "E-Mail"},
            {"number": 2, "box": [0.72, 0.84, 0.18, 0.08]}
          ],
          "steps": [
            {
              "number": 1,
              "title": "E-Mail-Adresse eingeben",
              "text": "Geben Sie die geschäftliche E-Mail-Adresse vollständig ein.",
              "input": "Format: name@unternehmen.de",
              "result": "Die Adresse erscheint ohne Validierungsfehler."
            },
            {
              "number": 2,
              "title": "Angaben speichern",
              "text": "Wählen Sie Speichern, nachdem Sie alle Pflichtfelder geprüft haben."
            }
          ]
        }
      ]
    }
  ]
}
```

## Fields

Root fields:

- `title` (required): tutorial title.
- `subtitle` and `language` (optional): supporting metadata. `language` defaults to `de`.
- `footer` (optional): exact user-requested footer text. Omit it by default. Never populate it with the skill name, an AI/model name, a generator credit, or a sample watermark.
- `labels` (optional): overrides for the helper labels `condition`, `input`, `result`, `note`, and `branch`. Built-in defaults cover German, English, and Chinese; provide overrides for other output languages.
- `sections` (required): ordered non-empty array.

Section fields:

- `title` (required).
- `intro` (optional): short purpose or transition.
- `branch` (optional): condition under which this section applies.
- `screens` (required): ordered non-empty array of screenshot groups.

Screenshot-group fields:

- `title` (required): names the state or task shown.
- `image` (required): PNG or JPEG source.
- `caption` (optional): describes the state without repeating instructions.
- `annotations` (optional): visual targets.
- `steps` (required): one or more ordered steps.

Annotation fields:

- `number` (required): positive integer matching one step in the same screenshot group.
- `box` (required): `[x, y, width, height]` as normalized values from 0 to 1, measured from the image's upper-left corner.
- `label` (optional): very short overlay label.

Step fields:

- `number`, `title`, and `text` (required).
- `input` (optional): literal value, format, or selection to provide.
- `condition` (optional): local condition for this action.
- `result` (optional): visible confirmation after the action.
- `note` (optional): compact warning or exception.

Numbers must be unique across the complete tutorial and strictly increase in reading order. Every annotation number must have one corresponding step. A step may intentionally have no annotation when the instruction refers to information already marked in the source image; do not add an empty annotation for it.
