# Astrology validation: references, method and tolerances

Author: Alessandro Pezzali
Status: written **before** the astrology implementation, as the acceptance
criteria it has to meet.

---

## 1. The absolute rule

> **An expected value must never be produced by the code being tested.**

Every fixture in the astrology suite comes from a source that is independent of
SYDERA's chart layer and, wherever possible, independent of the astronomy
library as well. Where full independence is impossible, the check is
**definitional**: the quantity is verified against the definition that gives it
meaning, evaluated through a different code path.

A test that merely records what the implementation currently returns is a
regression guard, not a validation. Such tests are labelled as regression
guards and are never counted as evidence of correctness.

## 2. Reference sources and provenance

| Layer | Reference | Independence |
|-------|-----------|--------------|
| Historical UTC offsets | IANA time zone database rule text (public domain) and documented legal history | Fully independent — human-read rules, not a library call |
| Planetary and lunar longitudes | **JPL Horizons**, apparent geocentric ecliptic longitude of date, generated once and committed as static fixtures | Fully independent — different ephemeris (DE44x) and different implementation |
| Local apparent sidereal time | **JPL Horizons** observer quantity 7 | Fully independent |
| Obliquity of the ecliptic | IAU 2006 published polynomial and the published J2000 value 23° 26′ 21.406″ | Independent published constant |
| Ascendant / Midheaven | **Definitional**: the computed ecliptic point is converted to horizontal coordinates through the astronomy library's own transform, which is a different algorithm from the trigonometric formula under test. The Ascendant must have altitude 0° on the eastern horizon; the Midheaven must have hour angle 0 | Independent code path |
| Placidus cusps | Two checks. **Definitional**: each intermediate cusp must divide the semi-diurnal arc of its own ecliptic degree into the prescribed fraction, evaluated through an independent transform. **Comparative**: the twelve cusps must match those produced by the Swiss Ephemeris implementation of the same construction | Independent code path, and an entirely independent implementation |
| Whole Sign / Equal cusps | Construction | Exact |
| Aspects | Closed-form arithmetic and invariants | Exact |

Every committed reference file records, in the file itself:

* the source (Horizons query string, or the published rule/constant);
* the exact date the data was generated;
* the parameters needed to regenerate it byte for byte.

Reference data is generated **once, by the developer, offline**. The
application never contacts Horizons or any other service, at build time or at
run time.

## 3. Numerical tolerances

Fixed before implementation. If a measurement exceeds its tolerance, the
implementation is wrong until proven otherwise — the tolerance is not widened
to make a test pass without a documented, justified reason recorded here.

| Quantity | Reference | Tolerance |
|----------|-----------|-----------|
| Historical UTC conversion | tzdb rules | **exact** (0 s) where the rule is known |
| Sun and planet ecliptic longitude | JPL Horizons | **≤ 1′** (0.016667°) |
| Moon ecliptic longitude | JPL Horizons | **≤ 2′** (0.033333°) |
| Obliquity of the ecliptic | IAU 2006 polynomial | **≤ 1″** (0.000278°) |
| Sidereal time | JPL Horizons LAST | **≤ 0.1 s** of sidereal time (≈ 1.5″ of arc) |
| Ascendant / Midheaven | definitional (altitude / hour angle) | **≤ 1′** |
| Placidus cusps | definitional (semi-arc division) | **≤ 2′** where defined |
| Whole Sign / Equal cusps | construction | 1e-9° |
| Aspect arithmetic | closed form | 1e-9° |

### 3.1 Revision recorded after measurement: sidereal time

The sidereal-time tolerance was set to 0.1 s before implementation and revised
to **1.0 s in the UTC era**, with the cause identified rather than assumed.

Measurement showed a systematic residual against Horizons of about 0.37–0.43 s
for the modern instants and only 0.00–0.04 s for the two pre-1972 instants.
That pattern identifies the cause exactly: `astronomy-engine` documents that it
approximates UT1 as equal to UTC, while Horizons applies the true UT1 − UTC.
Before 1972 there is no UTC and therefore no such difference, which is why the
old instants agree closely and confirm that SYDERA's own algorithm is correct.

The leap-second convention holds |UT1 − UTC| below 0.9 s, so the residual is
bounded by roughly 0.9 s of sidereal time. Its practical effect is what
matters: 0.9 s of sidereal time moves the Ascendant by 0.00375°, that is
0.22 arcminutes — inside the 1 arcminute Ascendant tolerance, which is
separately confirmed to 0.0000′ by the definitional test.

The suite therefore holds two bounds: **≤ 0.05 s before 1972**, where the
comparison is exact, and **≤ 1.0 s afterwards**, where a known and bounded
approximation applies. Both are reported.

### 3.1.1 Independent Placidus reference

The first edition of this document listed Placidus as validated only against
its own definition, and recorded that as a limitation. It has since been
checked against a second, entirely independent implementation.

**Source.** Swiss Ephemeris 2.10.03 (Astrodienst), through the `sweph` Node
binding, called as `swe_houses(julday(UTC, SE_GREG_CAL), latitude, longitude,
'P')`. Generated once, offline, by the developer; the values are committed in
`src/core/astrology/__tests__/fixtures/placidus-reference.json` and the
generator is `scripts/generate-placidus-reference.mjs`.

**Licence position.** Swiss Ephemeris is deliberately **not** a dependency of
SYDERA — its AGPL/paid dual licence is exactly why the engine research rejected
it, and that rejection stands. It is used here only as a developer-side
reference implementation. Nothing from it is bundled, linked, distributed or
reachable over a network from SYDERA; only its numeric results are recorded,
and computed numbers are facts rather than software. The AGPL branch is free of
charge, so the zero-cost requirement is unaffected.

**Why it is a valid independent reference.** It is a different codebase by
different authors, with its own ephemeris and its own implementation of the
Placidus construction. It shares no code with `astronomy-engine` or with
SYDERA.

**Result.** Six synthetic charts, twelve cusps each, covering a European
latitude, the southern hemisphere, the equator and both signs of the practical
high-latitude boundary. Maximum deviation **0.0060 arcminutes (0.36
arcseconds)**, against a tolerance of 2 arcminutes. The Ascendant and Midheaven
agree on the same charts to within an arcminute.

### 3.2 Correction found by validation: the Ascendant above the polar circle

The definitional test found a real defect that a table comparison at mid
latitudes would have missed. The classic arc-tangent formula for the Ascendant
returns one of the two points where the ecliptic crosses the horizon, and its
quadrant convention picks the rising one only at moderate latitudes. At 69.6° N
for two of the fixture instants it returned the **descending** degree: held
fixed, that degree's altitude fell from +0.008° to −0.007° across the instant.

The implementation now selects the intersection that follows the Midheaven
within half a turn of ecliptic longitude, which is the ascending one in both
hemispheres. Every fixture is checked in two ways: the returned degree sits on
the horizon to within an arcminute, and its altitude is increasing.

The suite reports the **observed maximum deviation** for every category. The
numbers are printed, not hidden: a passing suite with a deviation close to the
limit is information, not noise.

## 4. Engine precision is not input precision

These tolerances describe the calculation, not the birth data.

The Ascendant advances by roughly **1° every four minutes** of clock time (the
rate varies with latitude and with the sign rising). Consequently:

* a birth time known to ±1 minute gives an Ascendant uncertain by roughly ±15′;
* a birth time known to ±5 minutes gives roughly ±1.2°;
* a birth time rounded to the hour gives an Ascendant that is not meaningful at
  degree level at all.

SYDERA therefore reports the Ascendant with an explicit uncertainty derived
from the precision of the entered time, and never presents a calculation
tolerance of one arcminute as certainty about a rounded birth time. The same
applies to house cusps, which move with the Ascendant, and to the Moon, whose
longitude changes by about 0.5′ per minute of time.

## 5. Fixture coverage

The fixture set spans, at minimum:

* modern and historical dates (late 19th century to the 21st);
* northern and southern hemispheres;
* a location near the equator;
* a high-latitude location above the polar circle, where Placidus **must be
  refused** rather than computed;
* an instant inside a daylight-saving transition — both the ambiguous repeated
  hour and the non-existent skipped hour;
* a pre-1970 date in a zone whose historical rules differ from today's;
* a date before standard time was adopted in the zone (local mean time);
* a chart whose Ascendant falls close to a sign boundary, to exercise the
  disclosure of input-driven uncertainty;
* a leap day.

All fixture identities are synthetic technical values. No real person's birth
data appears in the repository.

## 6. Gates

The astrology implementation proceeds in stages, and each stage must pass its
own validation before the next begins:

1. historical UTC conversion — exact on every rule-derived fixture;
2. planetary and lunar longitudes — within tolerance against Horizons;
3. sidereal time and obliquity — within tolerance;
4. Ascendant and Midheaven — within tolerance, definitionally verified;
5. house systems — within tolerance, with the polar refusal proven;
6. aspects — exact, with invariants held.

Astrological results become visible in the interface only after gates 1–6 have
passed. The convergence engine is not started until then, because comparing an
unvalidated calculation against numerology would produce a confident-looking
result with no basis.
