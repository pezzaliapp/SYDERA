# House system: decision and rationale

Author: Alessandro Pezzali
Status: decided for Phase 2

Astrological traditions divide the chart into houses in many different ways,
and they disagree with each other. SYDERA has to pick a default, so this
document states which one, why, and — just as importantly — what the choice
does **not** claim.

---

## 1. Decision

| Role | System |
|------|--------|
| **Default** | **Whole Sign** |
| Alternative | Placidus |
| Alternative | Equal |

The house system in force is always displayed with the result, and the
alternatives are offered in the method/advanced area — never as a question the
user must answer before their first calculation.

## 2. Why Whole Sign is the default

The reason is **technical robustness, not astrological authority**.

* It is mathematically defined for every latitude and every date, including
  above the polar circles, where the time-based systems break down.
* It is a closed form: once the Ascendant is known, the house containing it is
  its whole sign and the remaining houses follow the zodiacal order. There is
  no iteration, no convergence criterion and no numerical failure mode.
* It is exactly testable: the expected cusps are known by construction, so the
  implementation can be verified without appealing to any external table.
* It degrades gracefully with imprecise birth times: a one-minute uncertainty
  moves the Ascendant by roughly a quarter of a degree, which changes the whole
  sign house layout only when the Ascendant sits within that distance of a sign
  boundary — a condition SYDERA can detect and disclose.

SYDERA does **not** claim that Whole Sign is astrologically more correct, more
authentic or more accurate than any other system. Within these symbolic
traditions there is no measurement that could establish such a claim.

## 3. Why Placidus is offered

Placidus is the system most users of modern Western astrology expect, and
omitting it would make SYDERA feel wrong to people familiar with their own
chart. It is therefore available as an explicit choice.

Its limitation is real and must be handled honestly: Placidus divides the
diurnal semi-arc of an ecliptic degree into equal time intervals, and that
construction has no solution for degrees that never rise or never set. In
practice it becomes undefined above the polar circles (|latitude| ≳ 66.5°) and
numerically unstable as that limit is approached.

**Behaviour when Placidus cannot be computed for the supplied latitude:**

1. the Placidus calculation is refused;
2. the reason is explained in plain language;
3. Whole Sign and Equal are offered;
4. the user must choose explicitly before the chart is recalculated;
5. SYDERA never substitutes another system silently;
6. SYDERA never fabricates cusps.

## 4. Why Equal is offered

Equal houses (Ascendant plus successive 30° steps) are defined everywhere, are
trivially verifiable, and are the natural middle ground between the other two.
They are offered without further advocacy.

## 5. Systems not implemented

Koch, Campanus, Regiomontanus, Porphyry, Alcabitius and others are not
implemented in Phase 2. They add failure modes and validation burden without
changing what SYDERA is for. This is a scope decision, not a judgement about
their value.

## 6. What the user is told

The method disclosure attached to every astrological result states:

* which house system produced the houses shown;
* that different astrological traditions use different house systems;
* that they produce different house placements from the same birth data;
* that SYDERA does not claim any system is scientifically or objectively
  superior to another;
* why Whole Sign is the default (mathematical robustness);
* when a chosen system was refused, and why.

## 7. Consequences for validation

* Whole Sign and Equal cusps are exact by construction and are verified against
  values derived from their definition, to floating-point tolerance.
* Placidus cusps are verified twice: against the **defining property** of the
  system — each intermediate cusp divides the semi-diurnal arc of its own
  ecliptic degree into the prescribed fraction, evaluated through an
  independent coordinate transform — and against the cusps produced by the
  **Swiss Ephemeris** implementation of the same construction, which shares no
  code with SYDERA. Observed maximum deviation across six charts spanning
  Europe, the southern hemisphere, the equator and both high-latitude limits:
  **0.36 arcseconds**. Swiss Ephemeris remains outside the project's
  dependencies; see `ASTROLOGY_VALIDATION.md` section 3.1.1.
* The polar refusal is itself a tested behaviour: a high-latitude fixture must
  produce a refusal, never a number.

Details and tolerances: `ASTROLOGY_VALIDATION.md`.
