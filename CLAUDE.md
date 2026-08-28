# SYDERA — Project Instructions

## 1. Project identity

Project name: SYDERA

SYDERA is a professional Progressive Web App for personal symbolic analysis combining:

- Western natal astrology
- Pythagorean numerology
- interpretation of convergences and contrasts between the two systems
- personal cycles and period analysis

The application must be serious, elegant, transparent, technically rigorous and easy to use.

SYDERA must NOT look or behave like a generic horoscope, fortune-telling or entertainment website.

The application must clearly distinguish between:

1. astronomical and mathematical calculations;
2. traditional symbolic interpretations derived from astrology and numerology.

---

## 2. Project ownership and authorship

Concept, design and development ownership:

Alessandro Pezzali

Alessandro Pezzali must remain the sole author credited in the project.

Do NOT add Claude, Anthropic, OpenAI, ChatGPT, GitHub Copilot or any other AI system as:

- author;
- co-author;
- contributor;
- copyright holder;
- developer;
- project creator.

Do NOT generate:

Co-authored-by

trailers in Git commits.

Do NOT add AI attribution to:

- README;
- package.json;
- source files;
- comments;
- About page;
- metadata;
- Git history;
- documentation;
- application UI.

Git commits must identify Alessandro Pezzali only.

---

## 3. Absolute ZERO COST requirement

This project must generate ZERO monetary cost for Alessandro Pezzali and for normal application operation.

This is an architectural requirement.

Forbidden:

- paid APIs;
- usage-based APIs;
- paid AI APIs;
- paid databases;
- commercial geocoding APIs;
- commercial timezone APIs;
- paid astronomical APIs;
- paid astrology APIs;
- subscriptions;
- paid hosting;
- paid analytics;
- paid telemetry;
- mandatory external servers;
- services requiring billing information;
- services requiring a credit card;
- services that may automatically generate charges;
- freemium services where exceeding a quota could generate costs.

Prefer:

- open-source libraries;
- MIT, BSD, Apache-2.0 or similarly permissive licenses;
- local browser computation;
- static datasets where legally and technically appropriate;
- GitHub Pages;
- IndexedDB;
- localStorage for preferences only;
- Service Workers;
- offline operation.

Before introducing ANY dependency, verify:

1. license;
2. maintenance status;
3. whether it requires an external service;
4. whether it requires an API key;
5. whether it can generate monetary costs;
6. whether its license is compatible with this project;
7. whether it can operate in a static PWA architecture.

If uncertain, STOP and document the issue instead of introducing the dependency.

Never silently introduce a service that may generate costs.

---

## 4. Preferred architecture

Preferred technology stack:

- React
- TypeScript
- Vite
- Progressive Web App
- IndexedDB for structured persistent local data
- localStorage only for small application preferences
- Service Worker for offline capability
- static hosting compatible with GitHub Pages

Avoid backend infrastructure unless absolutely unavoidable.

The preferred architecture is:

LOCAL-FIRST + STATIC + OFFLINE-CAPABLE

The application should remain useful after installation even without an Internet connection whenever technically possible.

---

## 5. Supported devices

SYDERA must be responsive and usable on:

- Android smartphones;
- Samsung Galaxy Fold and other foldable devices;
- narrow external foldable displays;
- iPhone;
- iPad;
- Android tablets;
- macOS;
- Windows;
- modern desktop browsers.

Responsive design is mandatory.

Never assume a conventional phone viewport.

Never use fixed minimum widths that force the browser to scale down the entire application.

Avoid:

- horizontal page overflow;
- clipped dialogs;
- inaccessible content;
- nested scrolling problems;
- fixed-height modal content that becomes unreachable;
- text smaller than reasonable mobile readability.

Test narrow viewports explicitly.

---

## 6. Privacy by design

Privacy is a core architectural requirement of SYDERA.

SYDERA must be LOCAL-FIRST.

Personal information entered by the user must remain on the user's device whenever technically possible.

By default:

- no account;
- no registration;
- no login;
- no cloud profile;
- no remote profile database;
- no advertising;
- no analytics;
- no telemetry;
- no fingerprinting;
- no marketing trackers;
- no behavioural profiling;
- no third-party tracking scripts.

Do NOT transmit personal profile information to external servers.

This includes:

- first name;
- surname;
- full birth name;
- date of birth;
- time of birth;
- place of birth;
- geographical coordinates associated with the profile;
- calculated natal chart;
- numerological profile;
- personal interpretations;
- saved reports.

The application must explain clearly to users when information is stored locally.

---

## 7. Data minimisation

Collect only information that is necessary for the requested calculation.

For astrology, normally required:

- date of birth;
- local birth time;
- birth location.

Name and surname must NOT be required for purely astrological calculations.

For Pythagorean numerology, request only the name information required by the selected numerological method.

Do NOT request:

- email address;
- telephone number;
- postal address;
- identity document;
- social media account;
- account password;
- unnecessary demographic information.

Do not collect data merely because it might be useful in the future.

---

## 8. Local data control

Users must have clear control over locally stored information.

Provide functions for:

- viewing saved profiles;
- deleting an individual profile;
- deleting all SYDERA local data.

Provide a clearly visible command equivalent to:

DELETE ALL MY DATA

Before destructive deletion, request a clear confirmation.

The deletion function must remove locally stored SYDERA user information from:

- IndexedDB;
- localStorage where applicable;
- application-managed caches containing personal information.

Files explicitly exported by the user are outside the application's local storage and must not be deleted automatically.

---

## 9. No bundled personal profiles and NO DEMO

SYDERA must NOT contain:

- preloaded personal profiles;
- sample personal profiles;
- demonstration profiles;
- fictional birth profiles;
- Alessandro Pezzali's personal birth data;
- any other real person's birth data.

The distributed application must start with an EMPTY profile state.

There must be NO demo profile button.

There must be NO "try example" profile containing personal data.

Personal analysis begins only after the user voluntarily enters their own information.

Do not place personal birth information in:

- source code;
- test fixtures committed to the public repository;
- README;
- screenshots;
- documentation;
- public JSON files;
- application assets.

Automated tests requiring dates or names must use obviously synthetic technical test values that cannot reasonably be interpreted as a real bundled user profile.

---

## 10. Astrology engine principles

Astrological calculations must be deterministic.

The same validated input must always produce the same astronomical result.

The engine must eventually support:

- Sun;
- Moon;
- Mercury;
- Venus;
- Mars;
- Jupiter;
- Saturn;
- Uranus;
- Neptune;
- Pluto;
- Ascendant;
- houses;
- zodiac positions;
- major aspects.

Where appropriate, additional calculated points may be considered later, but only after the core engine is reliable.

Do NOT fake astronomical calculations.

Do NOT invent planetary positions.

Do NOT approximate an Ascendant when required information is unavailable.

If reliable calculation cannot be performed, clearly inform the user instead of producing a fabricated result.

---

## 11. Birth time and historical timezone accuracy

Birth time handling is a critical part of the application.

The astrology engine must correctly distinguish between:

LOCAL CIVIL TIME

and

UTC.

The architecture must account for:

- birth location coordinates;
- historical timezone;
- historical UTC offset;
- historical daylight-saving time rules;
- conversion from local birth time to UTC.

Do not assume that today's timezone rules were valid historically.

Do not assume a fixed UTC offset for a city across all historical dates.

Research suitable offline/open-source timezone data before implementing this component.

If historical timezone accuracy cannot be established for an input, the application must warn the user.

---

## 12. Birth location

The application should provide a professional way to identify birth location without requiring a paid geocoding service.

Research zero-cost and offline-compatible solutions.

Do not silently send the user's birth location to third-party geocoding services.

If an external lookup is ever considered, it must first be documented and evaluated for:

- privacy;
- cost;
- license;
- rate limits;
- availability;
- GDPR implications.

Prefer local geographic datasets if practical.

---

## 13. Inspectable astronomical results

The application must distinguish:

CALCULATED DATA

from

SYMBOLIC INTERPRETATION.

Technically interested users should be able to inspect relevant calculated values.

Examples:

- planet;
- zodiac sign;
- degree;
- house;
- aspect;
- orb;
- Ascendant;
- UTC birth time used by the engine.

The application should make clear that astronomical calculations and symbolic astrological interpretation are different layers.

---

## 14. Pythagorean numerology engine

Implement Pythagorean numerology deterministically.

At minimum calculate:

- Life Path Number;
- Expression / Destiny Number;
- Soul Urge Number;
- Personality Number;
- Birthday Number;
- Master Numbers 11, 22 and 33;
- Personal Year;
- relevant traditional cycles.

The calculation algorithm must be transparent and testable.

Users should be able to inspect how a result was obtained.

Do not produce random numerological results.

---

## 15. Names and international characters

Numerological name calculation must be designed carefully.

Research and document how the selected Pythagorean system handles:

- accented characters;
- apostrophes;
- hyphens;
- spaces;
- multiple surnames;
- middle names;
- non-ASCII Latin characters.

Do not silently transform names in a way that changes the calculation without informing the user.

For alphabets not directly supported by the implemented Pythagorean mapping, explain the limitation rather than inventing a conversion.

---

## 16. Interpretation engine

Interpretations must derive from documented deterministic rules.

Avoid random text selection.

The architecture should separate:

1. calculation;
2. symbolic rules;
3. interpretation text;
4. final presentation.

This separation must make it possible to test the calculation engine independently from interpretation wording.

Avoid contradictory interpretations where possible.

When multiple symbolic factors conflict, explain the tension rather than pretending they all say the same thing.

---

## 17. Convergences — core SYDERA feature

A distinguishing feature of SYDERA is the comparison between astrology and numerology.

The convergence engine should identify areas where the two symbolic systems produce:

- strong convergence;
- moderate convergence;
- neutral relationship;
- significant contrast.

Possible analysis areas may include:

- analytical orientation;
- communication;
- independence;
- creativity;
- stability;
- emotional orientation;
- relationships;
- organisation;
- innovation;
- introspection;
- practical orientation.

The exact taxonomy must be documented and testable.

Never claim that convergence proves a personality characteristic.

Use formulations such as:

"Within these symbolic systems..."

"Both interpretative systems associate these elements with..."

"The two symbolic readings converge on..."

"The two systems provide different symbolic indications in this area..."

Avoid:

"This proves that you are..."

---

## 18. Period and cycle analysis

SYDERA may eventually combine:

- astrological transits;
- numerological Personal Year;
- relevant numerological cycles.

Period analysis must remain symbolic.

Do NOT describe future events as certain.

Avoid statements such as:

"You will change job."

Prefer:

"Within this symbolic framework, the period may emphasise themes related to professional change or reassessment."

The user must always understand the difference between symbolic interpretation and factual prediction.

---

## 19. Safety of interpretations

Never generate interpretations designed to frighten or manipulate users.

Never predict as certain:

- death;
- serious illness;
- accidents;
- suicide;
- criminal behaviour;
- bankruptcy;
- financial collapse;
- divorce;
- pregnancy;
- infertility;
- disasters;
- violence;
- legal conviction;
- medical diagnosis.

Do not provide medical diagnosis.

Do not provide psychological diagnosis.

Do not use astrology or numerology to determine whether a person has a medical or mental health condition.

Do not encourage financial, medical, legal or other high-impact decisions based on symbolic analysis.

---

## 20. Professional visual identity

SYDERA must have a professional, modern and restrained visual identity.

It must NOT resemble:

- a fortune teller website;
- a cheap horoscope application;
- a tarot application;
- an occult advertising page.

Avoid:

- crystal balls;
- excessive zodiac imagery;
- excessive stars;
- neon mysticism;
- purple cosmic clichés;
- fake magical effects;
- excessive gradients;
- decorative clutter.

Prefer:

- clean typography;
- excellent spacing;
- restrained visual hierarchy;
- subtle astronomical references;
- professional dashboards;
- readable charts;
- elegant cards;
- excellent contrast;
- dark mode;
- light mode.

Keep It Simple.

Visual quality must never compromise usability.

---

## 21. Accessibility

Accessibility is mandatory.

Implement appropriate:

- semantic HTML;
- keyboard navigation;
- visible focus states;
- ARIA attributes where necessary;
- colour contrast;
- scalable text;
- touch target sizing;
- screen-reader-friendly labels.

Do not rely solely on colour to communicate convergence strength or status.

Respect reduced-motion preferences.

---

## 22. Disclaimer

SYDERA must contain a clear professional disclaimer.

The disclaimer must be available:

- during first use;
- permanently from Settings or About;
- in exported reports where appropriate.

The introductory disclaimer must require explicit acknowledgement before the first personal analysis.

Do not use dark patterns.

Suggested legal/communication principles:

SYDERA is a personal exploration tool based on the traditional symbolic systems of Western astrology and Pythagorean numerology.

Astrology and numerology are not scientifically validated predictive methods.

Results are provided for informational, cultural, entertainment and personal reflection purposes.

Astronomical positions and numerical results may derive from mathematical calculations, while their interpretation belongs to symbolic traditions and is not scientific evidence of personality, compatibility or future events.

SYDERA does not provide medical, psychological, psychiatric, financial, investment, legal, employment or other professional advice.

Users must not base important personal, health, financial, legal or professional decisions solely on SYDERA results.

Any decisions remain the responsibility of the user.

To the extent permitted by applicable law, the developer is not responsible for decisions, actions, losses or consequences resulting from reliance on symbolic interpretations provided by the application.

Do NOT claim that a disclaimer removes every possible legal responsibility.

Use legally cautious wording such as:

"to the extent permitted by applicable law."

---

## 23. Privacy notice

SYDERA must include a clear Privacy section written in understandable language.

It must explain the actual technical behaviour of the application.

If the final architecture remains entirely local, explain clearly that:

- personal profile information is processed locally on the user's device;
- no SYDERA account is required;
- personal profiles are not intentionally transmitted to a SYDERA server;
- SYDERA does not sell personal information;
- SYDERA does not use personal profile information for advertising;
- locally stored information can be deleted by the user.

Do NOT make privacy claims that are not technically true.

If future architecture changes introduce external data processing, the Privacy notice must be updated BEFORE deployment.

Privacy documentation must match actual source-code behaviour.

---

## 24. Disclaimer and privacy are different

Do not merge the Privacy Notice and Disclaimer into one confusing document.

Maintain separate sections:

PRIVACY

and

DISCLAIMER

Privacy explains:

- what data is used;
- where it is processed;
- where it is stored;
- whether it is transmitted;
- how it can be deleted.

Disclaimer explains:

- the symbolic nature of astrology and numerology;
- limitations of interpretations;
- absence of scientific validation;
- limitations of liability;
- absence of professional advice.

---

## 25. Security

Never commit:

- passwords;
- API keys;
- access tokens;
- private keys;
- authentication cookies;
- secrets;
- personal user data;
- real personal profiles.

Maintain a proper .gitignore.

Do not use unsafe dynamic code execution.

Avoid unnecessary third-party scripts.

Minimise dependencies.

Run dependency security checks when appropriate.

Do not automatically apply dependency upgrades that could break the application without testing them.

---

## 26. PWA requirements

SYDERA must be installable as a Progressive Web App where supported.

Implement:

- valid web app manifest;
- appropriate application icons;
- Service Worker;
- offline application shell;
- update strategy;
- responsive standalone experience.

The PWA must fail gracefully if a feature requires data not yet cached locally.

Do not make the application dependent on constant connectivity unless unavoidable.

---

## 27. Export

A future version may allow the user to export their personal analysis.

Export must occur only after explicit user action.

Do not automatically upload exported reports anywhere.

Any exported report should clearly distinguish:

- calculated information;
- symbolic interpretation.

Include an appropriate concise disclaimer in exported reports.

Do not expose hidden application metadata or unnecessary personal information.

---

## 28. Git rules

Repository:

SYDERA

Primary branch:

main

Use clear conventional-style commit messages.

Examples:

feat(numerology): add pythagorean life path calculation

feat(astrology): add natal chart calculation engine

feat(privacy): add local profile deletion

fix(responsive): improve foldable layout

test(numerology): add master number fixtures

docs(astrology): document ephemeris engine research

Never use:

Co-authored-by: Claude

or any other AI co-author attribution.

Alessandro Pezzali is the sole project author.

DO NOT PUSH TO GITHUB unless Alessandro Pezzali explicitly instructs you to push.

You may prepare local commits only when appropriate and explicitly requested.

Before any push:

- tests must pass;
- production build must pass;
- git status must be inspected;
- no personal information must be present;
- no secrets must be present.

---

## 29. Development methodology

Work autonomously inside the SYDERA project directory.

Do not modify files outside the SYDERA repository.

Before major changes:

1. inspect the existing project;
2. understand the current architecture;
3. preserve working functionality;
4. identify the smallest robust implementation;
5. implement;
6. run tests;
7. run the production build;
8. inspect warnings;
9. inspect Git status.

Do not rewrite working sections unnecessarily.

Do not make destructive filesystem changes outside the project.

Do not install system-wide software without explicit permission.

Do not modify global Git configuration.

Do not modify unrelated repositories.

---

## 30. Testing

Calculation correctness has priority over visual effects.

Create automated tests for:

- numerological calculations;
- master numbers;
- name conversion;
- date calculations;
- timezone conversion when implemented;
- planetary positions when implemented;
- Ascendant calculations when implemented;
- house calculations when implemented;
- aspect detection;
- convergence classification.

Tests must be deterministic.

Do not use Alessandro Pezzali's real personal data as public test fixtures.

Use synthetic technical fixtures.

Where astronomical results are tested, compare against reliable documented reference values.

Document the source of reference values when appropriate.

---

## 31. Astrology dependency research — mandatory before implementation

Do NOT immediately install an astrology library.

Before selecting the astrology engine, research completely free and open-source candidates.

Create:

docs/ASTROLOGY_ENGINE_RESEARCH.md

Evaluate candidate solutions for:

- planetary ephemerides;
- Sun;
- Moon;
- planets;
- Ascendant;
- house systems;
- aspects;
- coordinate requirements;
- historical timezone handling;
- historical daylight-saving time;
- browser compatibility;
- offline capability;
- package size;
- computational accuracy;
- maintenance status;
- license;
- redistribution requirements;
- compatibility with a public open-source PWA;
- possible economic costs.

Pay particular attention to licensing.

A technically excellent library with an incompatible or restrictive license must NOT be silently adopted.

Document uncertainties.

If no candidate satisfies the project requirements, report the problem instead of implementing an unsafe workaround.

---

## 32. Geographical and timezone research

Research how SYDERA can resolve birth locations and historical timezone information without paid services and without unnecessary privacy exposure.

Prefer solutions capable of local/offline operation.

Document:

- geographic dataset candidate;
- dataset size;
- license;
- update strategy;
- timezone mapping;
- historical DST support;
- browser feasibility.

Do not use a paid or potentially chargeable geocoding API.

---

## 33. Dependency policy

Keep dependencies to the minimum necessary.

Before adding a dependency ask:

- Can this be implemented safely with existing platform APIs?
- Is the dependency actively maintained?
- Is the license compatible?
- Does it communicate externally?
- Does it introduce tracking?
- Does it require an account?
- Could it generate costs?
- Is it unnecessarily large?

Document important architectural dependencies.

Do not add packages merely for trivial functionality.

---

## 34. No external AI dependency

SYDERA must NOT depend on:

- OpenAI API;
- Anthropic API;
- Gemini API;
- cloud LLM APIs;
- paid AI inference;
- usage-based AI services.

The core application must work without an AI API.

Interpretation should use deterministic local rules and curated text structures.

Do not create a feature labelled "AI" unless a future explicit project decision changes this requirement.

---

## 35. Transparency

Where practical, allow users to understand why an interpretation was produced.

For example:

ASTROLOGICAL FACTOR
Mercury in a specific sign or aspect

NUMEROLOGICAL FACTOR
Specific calculated number

INTERPRETATIVE THEME
Communication / analysis / creativity / etc.

CONVERGENCE
Strength and explanation

Do not present unexplained scores as objective psychological measurements.

SYDERA does not perform scientific personality testing.

---

## 36. Language architecture

The initial application may be developed in Italian.

However, structure user-facing text so future multilingual support can be added without rewriting application logic.

Avoid hard-coding large amounts of UI text directly into calculation functions.

Separate:

- UI strings;
- interpretation strings;
- calculation logic.

Do not automatically add translation services or external APIs.

---

## 37. Error handling

Never silently invent missing information.

If birth time is unknown, explain which calculations cannot be considered reliable.

If location cannot be resolved, request correction.

If timezone cannot be determined reliably, inform the user.

If a numerological input is unsupported, explain why.

Prefer:

"Unable to calculate reliably with the available information."

over fabricated output.

---

## 38. Initial development priority

Develop in this order:

1. project skeleton;
2. privacy architecture;
3. deterministic Pythagorean numerology engine;
4. automated numerology tests;
5. astrology engine research;
6. geographical/timezone research;
7. astrology calculation engine only after technical and licensing approval;
8. deterministic astrology tests;
9. interpretation rules;
10. convergence engine;
11. professional user interface;
12. PWA/offline functionality;
13. accessibility;
14. responsive and foldable optimisation;
15. export functionality;
16. final privacy review;
17. final disclaimer review;
18. final QA.

Do NOT start by creating decorative screens before calculation reliability is established.

---

## 39. First-run experience

The first launch should be professional and simple.

Recommended flow:

1. SYDERA identity;
2. concise explanation of what SYDERA does;
3. Privacy summary;
4. Disclaimer acknowledgement;
5. Create personal profile;
6. Enter required information;
7. Validate data;
8. Calculate;
9. Present results progressively.

Do NOT show a demo profile.

Do NOT preload personal data.

Do NOT force account creation.

---

## 40. Product philosophy

SYDERA should communicate:

Two symbolic systems.
One personal profile.
Transparent calculations.
Private by design.

The product should invite exploration rather than claim certainty.

Its credibility must come from:

- transparent calculations;
- careful language;
- privacy;
- professional design;
- reproducibility;
- technical correctness;
- clear limitations.

Never sacrifice credibility for sensationalism.

---

## 41. Final rule

When there is a conflict between:

- visual impact and correctness;
- convenience and privacy;
- additional functionality and zero cost;
- speed of implementation and calculation reliability;

choose:

CORRECTNESS
PRIVACY
ZERO COST
RELIABILITY

If a requested technical solution could create monetary costs, privacy risks, licensing problems or unreliable astrological calculations, STOP and report the issue before implementing it.