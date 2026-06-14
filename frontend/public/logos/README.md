# Organisation logos (Sources page marquee)

Each organisation has two logo variants — one optimised for light mode, one for dark mode.
The Sources page (`src/pages/SourcesPage/SourcesPage.tsx`) switches between them automatically
based on the active theme.

Naming convention: `SourcesPage/<NAME>-light.png` / `SourcesPage/<NAME>-dark.png`

| Organisation                           | Light                                  | Dark                                  |
| -------------------------------------- | -------------------------------------- | ------------------------------------- |
| American Academy of Pediatrics         | `SourcesPage/AAP-light.png`            | `SourcesPage/AAP-dark.png`            |
| American Academy of Sleep Medicine     | `SourcesPage/AASM-light.png`           | `SourcesPage/AASM-dark.png`           |
| American Psychological Association     | `SourcesPage/APA-light.png`            | `SourcesPage/APA-dark.png`            |
| ACM                                    | `SourcesPage/ACM-light.png`            | `SourcesPage/ACM-dark.png`            |
| UK Information Commissioner's Office   | `SourcesPage/ICO-light.png`            | `SourcesPage/ICO-dark.png`            |
| Center for Countering Digital Hate     | `SourcesPage/CCDH-light.png`           | `SourcesPage/CCDH-dark.png`           |
| Common Sense Media                     | `SourcesPage/CSM-light.png`            | `SourcesPage/CSM-dark.png`            |
| Harvard Kennedy School — Belfer Center | `SourcesPage/Harvard_Belfer-light.png` | `SourcesPage/Harvard_Belfer-dark.png` |
| Stanford HAI                           | `SourcesPage/HAI-light.png`            | `SourcesPage/HAI-dark.png`            |
| IEEE                                   | `SourcesPage/IEEE-light.png`           | `SourcesPage/IEEE-dark.png`           |
| PNAS                                   | `SourcesPage/PNAS-light.png`           | `SourcesPage/PNAS-dark.png`           |

To add a new logo, drop both `-light` and `-dark` variants into `SourcesPage/`, then add an
entry to the `ORGANISATIONS` array in `SourcesPage.tsx`. Respect each organisation's
brand/trademark guidelines when using their marks.
