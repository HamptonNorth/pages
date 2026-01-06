---
title: Spellcheck markdown content
summary: How spellcheck works with pages markdown content
created: 2026-01-05
published: y
file-type: markdown
style: github
sticky: false
---
# Overview
From the edit modal, markdown content may be spellchecked. The spell uses the CSpell library with language ID set to en-GB which uses a UK English dictionary. Misspelt words are highlighted with a red wavy underline and the total errors are shown in the footer.

<rm-image src="/media/technical/spellcheck1.png" width="800px" rounded="md"></rm-image>

On editing the error(s) the spell check auto reruns. 

## Technical notes
The setup of CSpell is controlled by the configuration file:
```json

# .cspell.json in root directory
{
  "version": "0.2",
  "words": ["redmug", "rcollins", "rnc", "bunstarter"],
  "language": "en-GB",
  "dictionaries": [
    "en-gb",
    "softwareTerms",
    "typescript",
    "node",
    "html",
    "css",
    "bash",
    "markdown"
  ],
  "enabledLanguageIds": ["markdown"],
  "ignorePaths": ["node_modules/**"]
}

```

Words that are correctly spelt but are not in the dictionaries can be added two ways. The `"words": ["redmug", "rcollins", "rnc", "bunstarter"],` entry above can contain an array of application specific words. This is usually used for `known at the start` words.

Words that are highlighted as errors in the spellcheck may be right clicked and added to the custom dictionary. The custom dictionary is stored in the SQLite database in the table `custom_dictionary`. You can add words directly to this database table - say a specialist list of technical words. This custom dictionary is merged with the CSpell dictionary set specified in `.cspell.json`.
