---
name: anki-add-words
description: Complete German vocabulary the user supplies ad hoc (words from German class, a pasted word list, a photo, or notes) with article, plural, verb forms, Chinese meaning, and an example sentence, generate audio, and import the cards into the Anki deck AI-German-Words. Use when the user says things like "add these words to Anki", "put these few words in", or "add the words from class"; do not use to delete words. [NIU]
metadata:
  author: NiuNiu Tang
  version: "0.1.0"
---
# Add Words to Anki (NIU)

Requires Anki running (AnkiConnect at localhost:8765) and `uvx` (used to run edge-tts). In the steps below, `scripts/` means this skill's own `scripts/` folder.

1. The user may give only words, or a photo, a note, or a table. Complete each entry with: article, plural, verb forms, and the Chinese meaning, then write one A2-level example sentence with a Chinese translation. Do not guess rows that are missing from the source table; mention them in the report.
2. When information is uncertain (polysemous words, unreadable spelling), ask only about those words and import the rest as usual.
3. Write `extra-YYYY-MM-DD.json` in the current project (in the `my-life` project, put it in `99-library/data/anki-vocab/`). It is an array; each item has these fields: `de`, `word` (the bare word, no article), `article` (der/die/das, or empty), `plural` (the full plural form, or a suffix notation such as `-en`), `forms` (for verbs, e.g. `er steigt, stieg, ist gestiegen`), `zh`, `lesson` (the source, e.g. `"German class"`), `sentence_de`, `sentence_zh`.
4. Record audio for each example sentence with `scripts/tts.sh "<sentence>" <audio-dir>/sNN.mp3` (NN starts at 01 and follows the JSON order; keep the audio folder in a temp directory, not in git). Then run:
   `python3 -I scripts/anki.py <extra-YYYY-MM-DD.json> <audio-dir> extra kurs`
   The script automatically skips duplicates, generates the word audio and the back-side audio, stores them in the Anki media library, and adds the tags `ai-german`, `d<file name>`, `extra`, a source tag, and `seen-before` when a word already exists in an older deck. An import can take more than 2 minutes; run it in the background.
5. Card format (handled by the script): note type `AI-German`; the front holds only the bare word and the word audio; the back colors the article (der red, die blue, das yellow) and shows the Chinese meaning, plural or verb forms, the example sentence, and its audio; German → Chinese only.
6. Report the result: which words were imported, which duplicates were skipped, and which carry `seen-before`. Do not review the user's cards for them; ask before changing or deleting existing cards.
