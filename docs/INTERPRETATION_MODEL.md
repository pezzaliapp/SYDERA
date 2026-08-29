# The interpretation model

Author: Alessandro Pezzali
Applies to: `src/core/interpretation/`, `src/content/person.it.ts`

SYDERA calculates a lot of correct numbers. This document describes how those
numbers become a reading a person can actually use, and — more importantly —
what stops that reading from becoming either a horoscope or a machine talking
about itself.

---

## 1. The chain

```
calculated fact        (Phase 2 engines, untouched)
  -> tendency          (a human trait, weighted, with the evidence behind it)
     -> person model   (a few tendencies, ranked, and the pair that matters)
        -> the reading (five sections, only where the evidence reaches)
```

There is exactly one step between the calculation and the words: the person
model. **No sentence is ever generated from a single planet, number or aspect.**
That was the previous design, and it produced text that described the engine
rather than the reader.

| Module | Responsibility |
|--------|----------------|
| `types.ts` | the vocabulary: evidence, section, report |
| `weights.ts` | the editorial weighting model, and nothing else |
| `person.ts` | calculated facts → tendencies → the person model |
| `sintesi.ts` | the five sections, and the omission of what is unsupported |
| `src/content/person.it.ts` | the language: complete sentences, no logic |

The interpretation layer imports from the engines. Nothing in the engines
imports from it, so a defect here can never change a calculation.

## 2. The tendencies

The model uses eight tendencies a reader would recognise in themselves:

`autonomia`, `struttura`, `concretezza`, `analisi`, `espressione`,
`relazione`, `sensibilita`, `cambiamento`.

They are derived from the eleven symbolic themes of the convergence taxonomy
(`CONVERGENCE_TAXONOMY.md`), which stays unchanged and remains the vocabulary
of the Convergenze screen. Several of those themes describe the same thing in a
person — communication and creativity, emotion and introspection, stability and
concreteness — and a reader does not need the distinction. The mapping is in
`FROM_THEME` in `person.ts`.

A tendency is only named when **at least two distinct calculated factors**
support it and its score is within 30 % of the leading tendency. One placement
is a detail, not a way of being.

Aspects introduce no tendency of their own: they add weight to the two
placements they link, which is how the tradition reads them and the only claim
the calculation supports.

## 3. The weighting model

The numbers in `weights.ts` decide what the reading leads with. They are
**editorial and symbolic**: they encode how these traditions rank their own
indicators. They are never a measurement of a person, and they are never shown
as a score, a percentage or a profile metric.

| Factor | Weight | Why |
|--------|--------|-----|
| Sun, Moon, Ascendant | 3 | the structural core of a chart in ordinary practice |
| Mercury, Venus, Mars | 2 | the personal planets |
| Jupiter, Saturn | 1 | present, but rarely the headline |
| Uranus, Neptune, Pluto | **0 by sign** | their sign is shared with everyone born within years of the person |
| Angular house (1, 4, 7, 10) | +1 | the placements traditionally read as most exposed |
| Conjunction, opposition, square | 2 × orb × ½ | applied to both linked placements |
| Trine, sextile | 1 × orb × ½ | support, more easily taken for granted |
| Life Path, Expression | 3 | the two structural numbers |
| Soul Urge, Personality | 2 | the inner and outer facets |

The orb factor runs from 1 at exact to 0.5 at the edge of the allowed orb.

## 4. The five sections

| Section | Built from |
|---------|-----------|
| Il tuo ritratto | the leading tendency (how, and what it is after), the second, and the nuance of the third |
| Come pensi e agisci | the strongest tendencies among the practical ones |
| Emozioni e relazioni | the strongest tendencies among the relational ones |
| Il tuo punto di equilibrio | the interaction between the two leading tendencies |
| Questo momento | the calculated personal year |

A section that the evidence cannot support is left out. Nothing exists to fill
a page, and a missing section is never replaced by something vaguer.

## 5. What stops this being a horoscope

Addressed structurally, not by good intentions:

- **No fallback text.** Every sentence is attached to a tendency or a pair of
  tendencies that the evidence has to support. There is no generic paragraph to
  fall back on, so a thin profile produces a shorter reading, never a vaguer one.
- **Nothing is generated at runtime.** The sentences are written in advance, by
  hand, and selected by the model. Deterministic, offline, and reviewable.
- **The reading never mentions the machinery.** No planet, number, system,
  indicator or evidence appears in the visible text; tests enforce this against
  a list of banned technical and methodological vocabulary.
- **Everything stays traceable.** Each section carries the calculated facts that
  produced it, shown on request under "Perché questa lettura?", and in full in
  the technical tabs.

## 6. What the reading never does

It does not diagnose, predict a concrete event, claim certainty, flatter, or
present a score. The current period is described as an emphasis, never as
something that is going to happen.
