# The interpretation model

Author: Alessandro Pezzali
Applies to: `src/core/interpretation/`, `src/content/interpretation.it.ts`

SYDERA calculates a lot of correct numbers. This document describes how those
numbers become a reading a person can actually use, and — more importantly —
what stops that reading from becoming a horoscope.

---

## 1. The chain

```
calculated fact            (Phase 2 engines, untouched)
  -> signal                (weighted statement + the evidence behind it)
     -> theme scores       (what recurs) and domain statements (what to say where)
        -> report sections (only where evidence exists)
```

Each stage is a separate module, and each stage keeps the evidence. Nothing
reaches the page that cannot be traced back to a value the engines produced.

| Module | Responsibility |
|--------|----------------|
| `types.ts` | the vocabulary: evidence, signal, theme support, tension, section |
| `weights.ts` | the editorial weighting model, and nothing else |
| `signals.ts` | calculated facts → weighted statements with evidence |
| `synthesis.ts` | theme ranking, strengths, and the detection of tensions |
| `report.ts` | assembly of the ten sections, and the honest omission of the rest |
| `src/content/interpretation.it.ts` | the language, with no logic in it |

The interpretation layer imports from the engines. Nothing in the engines
imports from it, so a defect here can never change a calculation.

## 2. The taxonomy

The eleven themes are **the ones already defined for the convergence engine** —
`analisi`, `comunicazione`, `indipendenza`, `creativita`, `stabilita`,
`emotivita`, `relazione`, `organizzazione`, `innovazione`, `introspezione`,
`concretezza` — documented in `CONVERGENCE_TAXONOMY.md`.

Inventing a second, longer list for the report would have produced two
vocabularies that disagree with each other, and a "strength" in one screen
that does not exist in the other. One taxonomy, one meaning.

Alongside the themes, the report speaks about five **domains**, which are the
areas a reader actually asks about: `presentazione`, `mente`, `emozioni`,
`relazioni`, `azione`. Each personal factor owns the domain its tradition reads
it for — the Ascendant speaks about how one arrives, Mercury about how one
thinks, Venus about bonds, Mars about action, the Moon about feeling.

## 3. The weighting model

The numbers in `weights.ts` decide what the report leads with. They are
**editorial and symbolic**: they encode how these traditions rank their own
indicators. They are never a measurement of a person, and they are never shown
as a score, a percentage or a profile metric.

| Factor | Weight | Why |
|--------|--------|-----|
| Sun, Moon, Ascendant | 3 | the structural core of a chart in ordinary practice |
| Midheaven | 2 | direction, when a birth time makes it available |
| Mercury, Venus, Mars | 2 | the personal planets |
| Jupiter, Saturn | 1 | present, but rarely the headline |
| Uranus, Neptune, Pluto | **0 by sign** | their sign is shared with everyone born within years of the person; they count only through aspects and houses |
| Angular house (1, 4, 7, 10) | +1 | the placements traditionally read as most exposed |
| Conjunction, opposition, square | 2 × orb factor | the aspects that describe structure and friction |
| Trine, sextile | 1 × orb factor | support, more easily taken for granted |
| Life Path, Expression | 3 | the two structural numbers |
| Soul Urge, Personality | 2 | the inner and outer facets |
| Birthday, Maturity | 1 | supporting |

The orb factor runs from 1 at exact to 0.5 at the edge of the allowed orb: a
tight aspect speaks louder, and one at the boundary still speaks.

A theme becomes a **strength** only when at least two distinct factors support
it and its score is within 45 % of the leading theme. One factor is a
placement, not a pattern.

## 4. What stops this being a horoscope

This was the main design risk, and it is addressed structurally rather than by
good intentions.

* **Content is keyed to specific factors.** There is no "creative person"
  paragraph. There is a sentence for the Moon in Scorpio and a different one
  for the Moon in Libra. If a fragment could be swapped for another without a
  reader noticing, it does not belong in the content file.
* **Generational placements are excluded by sign.** A sentence about Pluto in
  Scorpio would apply to everyone born across twelve years. It is not written.
* **Nothing is generated to fill a section.** A section with no signals behind
  it is omitted, and the reason is shown: "senza ora e luogo di nascita non ci
  sono indicatori astrologici per questa parte". Absence is reported, not
  papered over.
* **No fallback text exists.** There is no default paragraph to fall back on,
  so there is nothing that could describe anyone.
* **Tests enforce it.** Two different charts must produce different text in
  every domain; every evidence key must match a real calculated value; an empty
  input must produce zero sections.

## 5. Contradictions

Averaging two disagreeing systems into a neutral sentence would destroy the
most interesting thing SYDERA can say. Three kinds of tension are detected and
named:

1. **Between the systems** — one language stresses a theme the other does not.
   The report says which one, and that the theme therefore rests on a single
   support.
2. **A hard aspect** — a square or opposition between personal points is a
   tension by construction, and is stated as one.
3. **Two strong themes that want opposite things** — independence against
   relationship, innovation against stability, analysis against creation,
   feeling against management.

At most one example of each kind is shown: three paragraphs from the same
template read as filler and undermine the point.

When nothing conflicts, the report says so explicitly, and says what that does
and does not mean. That is a finding, not an empty slot.

## 6. Traceability

Every section carries its evidence, reachable behind **"Perché questa
lettura?"**. The evidence is the calculated fact in readable form — "Luna in
Leone, casa 8", "Sentiero di vita 6", "Mercurio congiunto a Nettuno (orbita
4.3°)" — with the system it came from.

The reader who wants the reading gets the reading. The reader who wants to
check it can check every paragraph, and from there go to the Astrologia and
Numerologia tabs, where the full tables remain.

## 7. Language

The symbolic, non-scientific nature of the whole thing is stated **once**, at
the top of the report. Repeating "secondo la tradizione" in every paragraph
would be legally tidy and completely unreadable, and readers stop seeing a
qualifier that appears thirty times.

Forbidden throughout, and covered by tests: claims of certainty, prediction,
percentages, personality scores, and the mystical or managerial registers.
