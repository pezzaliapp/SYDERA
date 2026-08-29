# The pre-1970 time zone caveat

Author: Alessandro Pezzali
Applies to: `src/core/time/timezone.ts`

Until v0.2.2 every birth before 1970 carried this warning:

> Nascita precedente al 1970: i dati storici sui fusi orari sono dichiarati
> approssimativi dalla fonte. Verifica lo scarto applicato.

It fired for every zone, including Italian births, where it was telling the
reader to doubt a number that is correct. This note records what was checked
and what was decided.

## Where the limitation comes from

SYDERA reads historical offsets from the IANA time zone database, which the
browser already ships through ICU — no download, no service, no dependency.
The IANA maintainers state that the database is intended to be correct for
timestamps from 1970 onwards, and that earlier data is best effort. That
caution is genuine, and it is mostly about two things: locations whose early
history was never recorded, and locations whose zone was merged with a
neighbour's because the two agreed from 1970 on, which can lose a pre-1970
difference between them.

Neither applies to Italy. The country has had a single legal time since
1893, so there is no pre-1970 subdivision to lose, and its periods of summer
time are a matter of public legal record.

## What was checked

Every documented Italian period of *ora legale* was compared against what the
database actually reports, using the browser's own `Intl` API. The checks are
in `src/core/time/__tests__/timezone.test.ts` and run on every build.

| Year | Expected | Result |
|------|----------|--------|
| 1916 | first summer time, 3 Jun – 30 Sep | standard +60, summer +120 ✓ |
| 1920 | 20 Mar – 18 Sep | ✓ |
| 1943 | 29 Mar – 4 Oct | ✓ |
| 1946 | 17 Mar – 6 Oct | ✓ |
| 1947 | 16 Mar – 5 Oct | ✓ |
| 1948 | 29 Feb – 3 Oct | ✓ |
| 1966 | reintroduced, 22 May – 24 Sep | ✓ |
| 1967 | 18 Jun – 24 Sep | ✓ |
| 1968 | 26 May – 22 Sep | ✓ |
| 1969 | 1 Jun – 28 Sep | ✓ |

Also verified:

* 1949–1965 report +60 all year, which is right: Italy kept standard time
  through those years.
* Dates before 1893 report **+49 minutes** — Rome's local mean time, before
  the country adopted Central European Time. That is not a round offset, so
  the separate `local-mean-time` caveat still fires there, as it should.
* `Europe/Vatican` and `Europe/San_Marino` are links to `Europe/Rome` and
  return the same offsets.

## Decision

The caveat is kept, and is still the default for any zone. It is suppressed
only for the three zones whose pre-1970 history has been checked against the
national legal record: `Europe/Rome`, `Europe/Vatican`, `Europe/San_Marino`.
An unknown or unlisted zone keeps the warning, because the honest default is
to say so.

The wording was also made specific: it now names the zone as the reason,
points at the offset actually applied, and says the offset can be corrected
by hand. No conversion logic was changed.

Adding a zone to that list requires the same evidence: documented transitions,
compared against the database, in the test suite.
