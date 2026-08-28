# Independent reference fixtures

`horizons-raw.json` holds the reference values the SYDERA astrology suite is
validated against. **Nothing in this directory was produced by SYDERA.**

## Provenance

* Source: NASA/JPL **Horizons** system, `https://ssd.jpl.nasa.gov/api/horizons.api`
* Generated: see the `generated` field inside the file
* Regenerate with: `npm run fixtures:fetch` (developer tool, never run by the
  application or by the production build)

### Planetary and lunar positions

| Parameter | Value |
|-----------|-------|
| `EPHEM_TYPE` | `OBSERVER` |
| `CENTER` | `500@399` (geocentric) |
| `QUANTITIES` | `31` — observer ecliptic longitude and latitude, apparent, referred to the true ecliptic of date |
| `TLIST_TYPE` / `TIME_TYPE` | `JD` / `UT` |
| `ANG_FORMAT` | `DEG` |

Ten bodies: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune,
Pluto.

### Local apparent sidereal time

| Parameter | Value |
|-----------|-------|
| `CENTER` | `coord@399` with `COORD_TYPE=GEODETIC` |
| `SITE_COORD` | east longitude, latitude, altitude 0 |
| `QUANTITIES` | `7` — local apparent sidereal time, decimal hours |

Sites are synthetic test locations chosen for their latitudes: Rome (mid
northern), Sydney (southern), Quito (equatorial), Tromsø (above the polar
circle, where Placidus must be refused).

## Instants

Five synthetic technical instants, in UTC: 1899-12-31T12:00, 1955-11-05T22:04,
1984-01-19T06:30, 2000-01-01T12:00 (J2000), 2026-08-28T00:00. None of them is
anyone's real birth data.

## Rule

These values are the expected results. They must never be regenerated from
SYDERA's own calculations, and a failing comparison is a defect in SYDERA until
proven otherwise — see `docs/ASTROLOGY_VALIDATION.md`.
