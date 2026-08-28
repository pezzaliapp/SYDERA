# Third-party notices

SYDERA is distributed as a static web application. The build bundles the
third-party components listed here, whose licences require their copyright and
permission notices to travel with the distributed copies.

SYDERA itself is © 2026 Alessandro Pezzali, MIT licensed — see `LICENSE`.

---

## React — MIT

Bundled at runtime. Copyright (c) Meta Platforms, Inc. and affiliates.

## React DOM — MIT

Bundled at runtime. Copyright (c) Meta Platforms, Inc. and affiliates.

## Astronomy Engine — MIT

Bundled at runtime, version 2.1.19. Copyright (c) 2019-2023 Don Cross.
Source: https://github.com/cosinekitty/astronomy

Provides the planetary and lunar positions used by the astrological
calculations. It performs all computation locally, has no dependencies and
makes no network request.

---

### MIT License text

The three components above are distributed under the MIT License:

```
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## GeoNames place data — CC BY 4.0

Distributed as a static data file with the application when the birth-place
search is used.

Source: https://download.geonames.org/export/dump/ — © GeoNames, licensed under
[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
The data is redistributed with attribution and without further restriction; it
is trimmed to the fields SYDERA needs and is searched entirely on the user's
device.

---

## Reference data used in testing only

Validation fixtures were generated with **NASA/JPL Horizons**
(https://ssd.jpl.nasa.gov). Those values are used exclusively by the automated
test suite and are not part of the distributed application. Horizons is a free
public service; SYDERA never contacts it at build time or at run time.

---

## Time zone data

Historical UTC offsets come from the IANA Time Zone Database already present in
the user's browser, accessed through the standard `Intl` API. No copy of the
database is bundled or downloaded. The database is in the public domain.
