# Glossary of Sino-sztorik Terms

## Introduction

To ensure this codebase - and, by extension, the application - can be understood in the future, I found it necessary to include a glossary. There is a precarious balance between writing self-explanatory code and writing needlessly verbose code, so I chose to coin certain terms that can be used in the codebase, and provide a longer explanation here.

- **Bare character**
  An entry from the Characters table in the database; a character object with its "native" fields (frequency, pinyin, etc.) but without any _supplements_ (phrases, similars, otherUses etc.).

- **Character object**
  An entry from the Characters table in the database (bare or supplemented). Contrasts with a _character string_, which refers merely to the Chinese character in question, not to a JavaScript object.

- **Character string**
  A string containing a Chinese character. Contrasts with a _character object_, which is a full JavaScript object containing some information about the character.

- **Constituents**
  Some characters can be broken down into several other characters. For example, 只 consists of 口 and ハ. The latter two are the former's _constituents_.

- **Interactive word**
  A word or phrase in a story that has extra markup to invite user interaction and/or signify its importance. For example, the character's keyword, primitive meaning, and constituents are often interactive words. They are wrapped in special characters in the raw text, which then are processed by the code, applying special styles to the word they wrap. The user can hover or click these words to, for example, view more information about one of the character's constituents.

  Because of the agglutinative nature of Hungarian and for better user experience, interactive words are set manually.

- **Progress (state)**
  A conjunction of a user's "currentTier" and "currentLesson" properties from the user's database entry. These together describe how far the user has gotten into the course. In an extended meaning, _progress_ can mean any state that specifies a tier, a lesson number, and optionally a character's index in a lesson.

- **Supplements**
  Information relating to a character that isn't strictly contained in the Characters (or CharacterOrders) table, such as phrases with the character, other characters similar to the character, or the character's other uses.
