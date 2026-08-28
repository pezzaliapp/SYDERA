# Pythagorean numerology: implemented method

Author: Alessandro Pezzali
Applies to: `src/core/numerology`

This document states exactly which conventions the SYDERA engine implements.
Numerological practice is not uniform; where schools disagree, the choice made
here is stated explicitly, the alternative is implemented as an option where it
is well defined, and the method actually used is part of every result.

---

## 1. Letter values

The classic Pythagorean square, letters cycling 1–9:

```
1 2 3 4 5 6 7 8 9
A B C D E F G H I
J K L M N O P Q R
S T U V W X Y Z
```

## 2. Name normalisation

Applied in this order, and **always reported back to the interface**:

1. Word separators — spaces and hyphens (including en and em dashes) separate
   name words.
2. Apostrophes (straight, typographic, grave and acute forms) are removed and
   the surrounding letters join into a single word: `O'TEST` → `OTEST`.
3. Ligatures and letters that Unicode does not decompose are expanded from an
   explicit table: `Æ`→`AE`, `Œ`→`OE`, `ß`/`ẞ`→`SS`, `Ø`→`O`, `Đ`/`Ð`→`D`,
   `Þ`→`TH`, `Ł`→`L`, `Ħ`→`H`, `Ŋ`→`NG`, `Ĳ`→`IJ`.
4. Diacritics are removed by Unicode NFD decomposition: `É`→`E`, `Ç`→`C`.
5. Everything is uppercased.
6. Any remaining character that is not A–Z is **not** dropped: it is reported
   as unsupported, and the name is marked non-calculable.

Point 6 is deliberate. A name written in an alphabet the Pythagorean square
does not cover (Greek, Cyrillic, Arabic, Han, …) cannot be converted without
inventing a transliteration, so SYDERA explains the limitation instead of
producing a number.

Every substitution from steps 2–4 is returned to the interface, which shows the
user what was changed before the calculation.

## 3. Vowels, consonants and the letter Y

`A E I O U` are always vowels.

`Y` is classified by a deterministic contextual rule, the default policy:

> Y is a **vowel** unless one of its immediate neighbours inside the same word
> is A, E, I, O or U; in that case it is a **consonant**.

Examples: `MARY` → Y vowel; `LYNN` → Y vowel; `YVES` → Y vowel; `MAY` → Y
consonant; `YOLANDA` → Y consonant. The rule is applied per word, so `MAY LYNN`
classifies its two Y letters differently.

Two explicit alternatives are available as options: `y-as-vowel` and
`y-as-consonant`.

`W` is always a consonant. The practice of treating W as a vowel in
combinations such as `OW` is **not** implemented; the tradition is not
consistent about it and the rule would not be reproducible.

## 4. Reduction and master numbers

A number is reduced by repeatedly summing its digits. Reduction stops early
when an intermediate total is 11, 22 or 33 and master numbers are enabled
(the default). Every intermediate step is kept in the result trace.

Master numbers can be disabled globally, in which case everything reduces to
1–9.

## 5. Core numbers

| Number | Derived from | Notes |
|--------|--------------|-------|
| Life Path | Birth date | Two methods, see below |
| Expression (Destiny) | All letters of the full birth name | |
| Soul Urge | Vowels of the full birth name | |
| Personality | Consonants of the full birth name | |
| Birthday | Day of the month | 11 and 22 preserved |
| Maturity | Life Path + Expression | |

**Life Path, `component` method (default).** Month, day and year are each
reduced first, preserving master numbers, and the three results are then summed
and reduced.

**Life Path, `digit-sum` method.** All digits of the date are summed in one
pass. The two methods usually agree but not always: for the synthetic date
1984-01-19 the component method gives 6 and the digit-sum method gives 33.
Because the divergence is real, the method used is always part of the result
and is displayed.

**Name summation.** By default all letters of all name words are summed and the
total is reduced (`total`). The `per-word` method reduces each name word first
and then sums; it too can diverge, and it is recorded in the result.

## 6. Cycles

**Personal Year transition — an explicit choice.** SYDERA changes the Personal
Year on **1 January**: the calendar year of the reference date is the year used
in the formula. Part of the tradition instead moves the Personal Year on the
**birthday**, so between 1 January and the birthday that convention yields a
different number. SYDERA does not implement the birthday convention, states the
1 January convention in the interface ("Metodo numerologico utilizzato"), and
does not claim either convention is the correct one.

| Cycle | Formula | Scale |
|-------|---------|-------|
| Personal Year | birth month + birth day + reference year (calendar year, changing on 1 January), each reduced first | 1–9 |
| Personal Month | Personal Year + reference month | 1–9 |
| Personal Day | Personal Month + reference day | 1–9 |
| Pinnacle 1 | month + day | masters preserved |
| Pinnacle 2 | day + year | masters preserved |
| Pinnacle 3 | Pinnacle 1 + Pinnacle 2 | masters preserved |
| Pinnacle 4 | month + year | masters preserved |
| Challenge 1 | \|month − day\| | 0–8 |
| Challenge 2 | \|day − year\| | 0–8 |
| Challenge 3 | \|Challenge 1 − Challenge 2\| | 0–8 |
| Challenge 4 | \|month − year\| | 0–8 |

Pinnacle age spans: the first pinnacle runs from birth to age `36 − Life Path
reduced to a single digit`, and the following three each last nine years, the
fourth continuing to the end of life.

Personal Year, Month and Day are conventionally expressed on the 1–9 scale, so
master numbers are not preserved there. The un-reduced total remains visible in
the trace.

## 7. Conventions where schools disagree

Numerological practice is not standardised. The table below lists every point
at which SYDERA had to choose, what it chose, and what the alternative is. None
of these choices is presented as objectively or scientifically correct.

| Point | SYDERA | Alternative in use elsewhere |
|-------|--------|------------------------------|
| Life Path | month, day and year reduced separately, then summed (`component`) | all digits of the date summed in one pass (`digit-sum`) |
| Name summation | all letters summed once (`total`) | each name word reduced first, then summed (`per-word`) |
| Letter Y | vowel unless adjacent to A/E/I/O/U in the same word (`contextual`) | always vowel, or always consonant |
| Letter W | always a consonant | vowel in combinations such as "OW" |
| Master numbers | 11, 22, 33 preserved in the core numbers | reduced to 2, 4, 6 |
| Personal Year / Month / Day | always reduced to 1–9 | master numbers sometimes preserved |
| Personal Year change | 1 January | the birthday |
| Which name | full name as recorded at birth | name in current use, or a chosen name |
| Non-Latin alphabets | declared non-calculable | transliterated into A–Z |

All of these are surfaced to the user inside the application, in the expandable
section **"Metodo numerologico utilizzato"** on the analysis screen, together
with the statement that different schools use different conventions and may
therefore reach different numbers from the same data.

## 8. Determinism

The engine never reads the system clock, never uses randomness, never touches
storage and never accesses the network. The reference date used for the cycles
is an explicit input supplied by the interface. These properties are enforced
by tests in `src/core/numerology/__tests__/guardrails.test.ts`.

## 9. What the numbers are not

The calculated numbers are arithmetic facts about a name and a date. The
readings attached to them belong to a symbolic tradition and are stored
separately, in `src/content/numerologyThemes.it.ts`. Nothing in this engine
measures a personality or predicts an event.
