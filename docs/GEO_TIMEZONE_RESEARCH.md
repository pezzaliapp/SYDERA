# Birth location and historical timezone research

Status: **research complete — implementation not yet started**
Date: August 2026
Author: Alessandro Pezzali

Converting a local civil birth time into a UTC instant is the single most
error-prone part of a natal chart. This document evaluates how SYDERA can do it
without a paid service, without sending personal data to a third party, and
without pretending to a certainty it does not have.

---

## 1. The problem, stated precisely

To place a birth on the sky, SYDERA needs:

1. geographic coordinates of the birth place (latitude, longitude);
2. the UTC offset **in force at that place on that date**, including any
   daylight-saving rule and any historical change of standard time;
3. an explicit signal when (2) cannot be established reliably.

Today's offset for a city is not evidence of its offset decades ago. Italy, for
example, has changed its daylight-saving practice several times during the
twentieth century, and many countries changed standard meridian entirely.

---

## 2. Historical timezone data

### 2.1 IANA time zone database (tzdb)

* Licence: **public domain** (the database is explicitly released into the
  public domain).
* Contains historical transitions, not just current rules, including local mean
  time before the adoption of standard time.

**Key architectural finding: the browser already ships tzdb.** Every modern
browser embeds the IANA database through ICU and exposes it via
`Intl.DateTimeFormat` with a `timeZone` option. A local civil time can
therefore be converted to UTC with no dependency at all, by formatting a
candidate instant in the target zone and correcting the residual difference
(two iterations converge, including across DST transitions).

Consequences:

* zero bytes of extra download for timezone rules;
* rules stay current as the browser updates;
* **but** the result depends on the tzdb version embedded in the user's
  browser, which is a determinism risk (see 2.3).

### 2.2 Accuracy limits before 1970

The tzdb documentation is explicit that pre-1970 data is best-effort, and
several zones whose post-1970 rules are identical have been merged upstream,
which can lose genuine pre-1970 differences unless the distribution was built
with the `backzone` data included. Platform builds differ in this respect.

Consequences for SYDERA:

* for births before 1970, the resolved offset must be presented as an
  assumption that the user can review and override;
* a manual UTC-offset override must exist from the start, and the value the
  user chose must be stored with the profile.

### 2.3 Reproducibility strategy

Because the platform's tzdb can change under the application, SYDERA will, at
the moment a chart is first computed, store with the profile:

* the local civil date and time as entered;
* the resolved UTC offset and the resulting UTC instant;
* the source of the offset (`iana-zone`, `manual-override`);
* the zone identifier used.

A later recomputation compares the stored offset with the freshly resolved one
and tells the user if the platform data has changed, instead of silently
producing a different chart.

### 2.4 Rejected alternatives

* `moment-timezone` (MIT) — would add a bundled copy of tzdb plus a legacy date
  library, duplicating data the browser already has.
* Commercial timezone APIs — forbidden by the zero-cost and privacy rules.

---

## 3. Resolving a birth place to coordinates

### 3.1 GeoNames extracts — recommended

* Source: https://download.geonames.org/export/dump/
* Licence: **CC BY 4.0** — free to redistribute, requires attribution.
* Each record carries latitude, longitude, country code, population **and the
  IANA timezone identifier**, which removes the need for a separate
  coordinate-to-timezone lookup for places chosen from the list.

**Shipped (from v0.2.2): two extracts.**

* `IT.txt` — every populated place in Italy, plus the ADM3 records, with no
  population threshold: 63 564 places, about 1 MB compressed. A birthplace is
  usually a small town, and the first release shipped `cities15000`, which
  holds 661 Italian places out of 7 896 comuni — Calenzano, twelve thousand
  inhabitants, was simply absent. A population threshold is the wrong filter
  for this application.
* `cities5000.txt` minus Italy — 67 634 places worldwide, about 2.8 MB
  compressed, fetched only when a query is not well answered by Italy.

Both are pre-processed into a compact tab-separated form (name, alternate
names, country, region, province, coordinates, timezone, population), carry a
content fingerprint in their URL, are parsed inside a Web Worker so a keystroke
never waits for them, and are cached by the service worker after first use.

Administrative names come from `admin1CodesASCII.txt` and `admin2Codes.txt`;
the Italian provinces are named from their official two-letter codes, because
GeoNames files the province of Firenze as "Province of Florence".

Obligations to honour:

* visible attribution to GeoNames under CC BY 4.0 in the About section and in
  the third-party notices;
* the snapshot is pinned, with its download date and a checksum recorded in
  the repository, and refreshed by a documented manual procedure.

### 3.2 Online geocoding (Nominatim/OSM and similar)

Free of charge, but every query would transmit a birth place to a third-party
server, and the usage policies of the public endpoints are not designed for
client applications of this kind. **Rejected as a default.** If it is ever
offered, it must be an explicitly opt-in action, clearly labelled as leaving
the device, and never the automatic path.

### 3.3 Manual entry

Always available, and the definitive fallback: the user may enter latitude,
longitude and timezone directly, for a hamlet not present in the dataset or for
a place whose name has changed. Coordinates are validated for range and the
resulting offset is shown before the chart is computed.

---

## 4. Timezone from arbitrary coordinates

Needed only when the user enters raw coordinates rather than choosing a place
from the dataset.

| Option | Licence | Size | Notes |
|--------|---------|------|-------|
| `@photostructure/tz-lookup` | CC0-1.0 | ~100 kB, no dependencies | maintained fork of the abandoned `tz-lookup`; approximate near borders |
| `geo-tz` | MIT | tens of megabytes | exact polygon lookup, unsuitable for a mobile PWA bundle |
| Manual zone selection | — | 0 | always available, no ambiguity for the user who knows the answer |

Provisional decision: offer manual zone selection first, and consider adding a
CC0-licensed compact lookup only if real use shows it is needed. Every
automatic resolution must remain visible and overridable, because a place a few
kilometres from a zone border can be resolved incorrectly by any compact
dataset.

---

## 5. Summary of decisions

1. Historical offsets come from the browser's own IANA data via `Intl`; no
   timezone library is bundled.
2. The resolved offset, its source and the resulting UTC instant are stored
   with the profile so charts stay reproducible.
3. Births before 1970, and any zone whose historical data is known to be
   uncertain, are flagged and can be overridden manually.
4. Place lookup uses pinned, attributed GeoNames snapshots (complete for
   Italy, above 5 000 inhabitants elsewhere) shipped as static assets; nothing
   is sent to a geocoding service.
5. Manual coordinate and timezone entry is a first-class path, not a fallback
   of last resort.
6. If the offset cannot be established, SYDERA says so and withholds the
   time-dependent parts of the chart.
