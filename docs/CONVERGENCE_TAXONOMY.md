# Convergence taxonomy

Author: Alessandro Pezzali
Applies to: `src/core/convergence/`

SYDERA's distinguishing feature is the comparison between two symbolic systems.
This document states exactly how that comparison is made, so a reader can check
it rather than trust it.

---

## 1. What a convergence is, and is not

A convergence means that the two symbolic vocabularies happen to emphasise the
same theme for the same person's data. That is all it means.

It is **not** evidence about a personality, it is **not** a measurement, and it
is **not** made more true by the two systems agreeing. Two traditions built by
people can agree with each other and still describe nothing about the world.
The interface says so on the convergence screen, and the wording never slips
into "this proves that you are".

## 2. The eleven themes

`analisi`, `comunicazione`, `indipendenza`, `creativita`, `stabilita`,
`emotivita`, `relazione`, `organizzazione`, `innovazione`, `introspezione`,
`concretezza`.

The list is fixed. Adding a theme changes every comparison, so it is a
deliberate decision, not an incidental one.

## 3. What each system contributes

**Numerology.** Each core number carries a set of theme weights, published in
`NUMBER_THEMES`. Four numbers are used: Life Path, Expression, Soul Urge and
Personality.

**Astrology.** Each sign carries a set of theme weights, published in
`SIGN_THEMES`, derived from its element and modality. Six factors are used,
with the weights in `FACTOR_WEIGHTS`:

| Factor | Weight | Why |
|--------|--------|-----|
| Sun, Moon, Ascendant | 3 | the traditional core of a chart |
| Mercury, Venus, Mars | 2 | personal planets |
| Jupiter … Pluto | 0 | they move slowly and describe a generation, not a person |

The Ascendant contributes only when it could be calculated, which means only
when the birth time and place were known.

## 4. Normalisation and classification

Each system's raw scores are divided by that system's own maximum, giving two
numbers between 0 and 1 per theme. This makes the two systems comparable
without implying they measure the same thing.

Fixed thresholds, applied identically in both directions:

| Condition | Level |
|-----------|-------|
| both ≥ 0.6 | convergenza forte |
| one ≥ 0.6 and the other ≤ 0.25 | contrasto significativo |
| both > 0.25 | convergenza moderata |
| otherwise | neutro |

Results are ordered: strong convergences first, then contrasts, then moderate,
then neutral — because a contrast is as informative as an agreement and must
not be buried.

## 5. Transparency

Every theme row can be expanded to show the exact factors that produced each
score, e.g. `sun in vergine`, `Sentiero di vita = 7`. Nothing is presented as a
score without the ability to see what produced it.

## 6. When the comparison is not made

If either system could not be calculated — no birth name, or no reliable chart
— the comparison is not attempted and the section explains what is missing.
Comparing one system against an empty one would produce confident-looking
output with no basis.

## 7. Testing

`src/core/convergence/__tests__/taxonomy.test.ts` covers the mapping tables,
the symmetry of the classification, normalisation bounds, the ordering, the
incomplete case and determinism.
