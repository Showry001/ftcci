# Design parity report — Phase 1

Figma file `t9b9zYDpdHGkd2FKMt2n0T`, page **FTCCI UI Final Design** (`1873:22181`), checked on 28 Oct 2026.

## How this was checked

- **Desktop (1440).** I read the computed text styles of every visible text element on all 30 routes. I compared them with the Figma text nodes of each desktop frame by font, size, weight, line height and colour. I also compared full-page screenshots side by side with Figma renders.
- **Mobile (390).** Same comparison against the Figma mobile frames. Layout values (padding, gaps, borders, radii) came from the frames' auto-layout data.
- **Tablet.** The Figma tablet frames are the desktop frames scaled to 56%, with identical text and layout. See the Tablet section.
- **Responsiveness.** Horizontal overflow was checked at 14 widths from 320 to 1920 px on every route.

Only the mobile **About › History** frame (`1885:38204`) changed in Figma since the last sync. Every desktop mismatch below is a detail the earlier syncs missed.

## Desktop mismatches

| # | Page | Component | Figma | Code (before) |
|---|------|-----------|-------|---------------|
| D1 | Home | Newsletter "Join FTCCI Updates" button | 15px | 14.3px |
| D2 | Home | Who We Are eyebrow | #f0b84d | #f5b800 |
| D3 | Home | Who We Are title accent | #f0b84d | #efbf04 |
| D4 | Home | Leader role (under name) | line height 16.8 | 12 |
| D5 | Home | Membership benefit labels | Arimo 700 | Arimo 600 |
| D6 | About, Membership | Section eyebrows (SectionTitle) | Inter **700**, line height 22 / 26 / 25 / 28 / 28 / 24 (Our Legacy / Core Values / Objectives / Leadership / Managing Committee / Membership Benefits) | Inter 500, 22 |
| D7 | About | Section titles | line height 40 (Vision), 56 (Objectives), 42 (Bearers), 46 (Committee), 42 (Secretariat), 52 (Past Presidents) | 46 on all |
| D8 | About | Office Bearers names | line height 15.2 | 22 |
| D9 | About | "Managing Committee" accent word | #d79a26 | #c8922a |
| D10 | Membership | "How it works" eyebrow | Inter 700 14, letter-spacing 1.5, #c8922a | Inter 500, no letter-spacing |
| D11 | Services | CEO Forum lead paragraph | #4b5563, line height 22.5 | #5f646d, 24 |
| D12 | Halls | "Files" label | 11.4px / 800 / #5f646d | 10.7px / 700 / #606877 |
| D13 | Downloads | "Attachments" label | Inter 700 14, letter-spacing 1.5, #c8922a | Inter 600, no letter-spacing |
| D14 | Events | Card tag text | #152a5e | #000000 |
| D15 | Publications | Section headings | line height 20.3 | normal |
| D16 | Media | Coverage date / press-kit subtitle | line height 17.8 / 18px | normal / 16px |
| D17 | All | Footer copyright year | the current year | hard-coded "2026" |
| D18 | All | CTA band body | "**Join** the Federation…" | "Joint the Federation…" (typo) |

## Mobile mismatches (390 frames)

| # | Page | Component | Figma | Code (before) |
|---|------|-----------|-------|---------------|
| M1 | All | Section headings | Neue Montreal 500 **24px** (line height per frame: Quick Actions 30.3, Century 32, Leadership 58, Updates 40, Privilege Card 52, Vision 40, Bearers 42, Committee 46, Presidents 52, Membership 34/32) | 28–32px |
| M1 | Events | "Upcoming Events" | Manrope 700 24 #152a5e | Neue Montreal 500 28 #000 |
| M1 | Contact | "Send Us a Message", "Our Office" | Inter 500 20/26 #152a5e | Neue Montreal 500 26 |
| M1 | Contact | Donation title | Inter 600 13/18 | Neue Montreal 500 20 |
| M1 | Media kit | "Media & Press Assets" | Inter 500 24/30 #001973 | Neue Montreal 500 28 #002452 |
| M1 | Event detail | "About This Event", "What to Expect" | Inter 600 20/28 and 22/28 | Neue Montreal 500 26/41.6 |
| M1 | Event detail, Services | Page/service titles | 24/36, 24/32 | 28 |
| M2 | Home | Section details | "Explore FTCCI Services" eyebrow 600; Vision/Mission labels 600; leadership intro 16/28; leader name line height 14.4 and role 11/20.1 | 500; 500; 15/26; 16; 11/12 |
| M3 | All | Header brand text | 3 lines (12/14 in ~150px) | 4 lines (142px box) |
| M4 | All | Footer brand block | logo 114×98; NM 16/20 name with a line break; no "FTCCI" label; tagline 13/20 #d1d5dc; "Quick Links" Inter 700; legal row with top border, gap 12 | different logo crop and size, extra label, Manrope headings |
| M5 | About, Events, Services, Membership | CTA band | padding 32/30, gap 16; title Inter 600 20 #001973; body Inter 14/18; button Inter 700 14 | 40px padding; Inter 700 22 #172566; Public Sans button |
| M6 | About › Vision | Vision/Mission cards | eyebrow 14/26; card title Lato 900 26/29; body Lato 15/24 | eyebrow 12/22; 26/34; 16/28 |
| M7 | About › Objectives | Objective rows | eyebrow 700; title Inter 600 15 #001973; body Inter 13 #334155; row border-bottom #e2e8f0, padding-bottom 12, gap 4; list gap 25 | NM 500 16 #172566; Public Sans 14 #475569; cards |
| M8 | About › Bearers | Names | NM 21.5/15.2; eyebrow 14/28 | 20/22; 12/22 |
| M9 | About › Committee | Panel tabs and member cards | active pill #152a5e, radius 20, padding 8/12, Inter 700 12 white; inactive Inter 500 13 #64748b; all 5 tabs visible; cards radius 12, padding 16, gap 12; name Inter 600 18/24; company Public Sans 13/18; eyebrow Public Sans 600 12/16 | NM 16 tabs; name 500 18/26; company 14/20 |
| M10 | About › Secretariat | Intro and roles | intro Inter 14/18 #334155; role Inter 500 12 #64748b | Public Sans 16/24 #475569; Public Sans 10 #676767 |
| M11 | About › Past Presidents | Rows | term pill rgba(240,184,77,.08) with 1px #f0b84d border, radius 6, padding 6/10, 11px 600; name 15 600; company 12/16.8 #e2e8f0 | 14px plain term; name 17; company 14 #fff |
| M12 | Membership | All sections | headings 24; "01–04" Inter 500 24 #d4a843; card titles Inter 500 18 #0c1835; body Manrope 13/20 #6b7280; benefit titles 16; eyebrows Manrope 700 12 #d4a843; dotted connectors between "How it works" steps | 28–32 NM, Inter 14 #5c6a79, no connectors |
| M13 | Events | Event cards | list padding 12/30/40/30, gap 20; card border #e5e7eb, radius 12; image ~180px; tag pill padding 4/12 Manrope 700 11 #002452; content padding 16, gap 12; title Inter 700 16/22; subtitle Manrope 13/18 #99a1af; divider; meta Manrope 500 12 #4a5565 | desktop card scaled down (NM 17.4, Inter 14) |
| M14 | Event detail | Body | lead 14/24; about body 14/22; detail labels 13.6/18.6; values 11.5–12.8/20.3; list 14/20; full-width Register button | 15–16px desktop sizes |
| M15 | Services | Detail panel | lead 14/22 #5f646d; bullets Manrope 14/20 #22252a; "Details & contact" Inter 500 20; labels Inter 700 10 #5f646d; values 600 13; file links Inter 500 12 | NM 24; Inter 14 #4b5563 |
| M16 | Media kit | Tiles | white background, padding 38/30/32/30; tiles 1px #dde1ee, radius 8, padding 20, gap 12; title Inter 500 18 #0d2240; text Inter 12/18 #858585; full-width download button (1px #152a5e, radius 6, padding 10/16, Manrope 600 13); subtitle Inter 14/20 #656565 | NM titles, Geist 13/20 text |
| M16 | Media › Coverage | List titles | NM 12.3/17 #1e2939; featured 13.2/15.1 | 15/20.25 #0d2240; 17/22.1 |
| M17 | Contact | Form and office cards | card padding 16, gap 16, 1px #e8e8e8, radius 8; labels Manrope 600 12/16 #1e293b; inputs Manrope 500 13/18; intro/consent Manrope 500 11/15 #64748b; office card #f8fafc, padding 20; office text Manrope 500 13/18; desk numbers Manrope 600 11/15; Send button Inter 600 13 | Inter 14 everywhere, NM headings |

### Found while fixing (also fixed)

| # | Page | Component | Figma | Code (before) |
|---|------|-----------|-------|---------------|
| M18 | About › Objectives | Section background, photo | white; photo 330×200, radius 12 | grey band; 631:349 photo |
| M19 | About › Committee | Group photo | 220px tall, cover crop, radius 12 | 114px desktop crop |
| M20 | About › Vision | Card layout | gold corner brackets (top-right, bottom-left), 28px ornament row, 273px cards | no brackets, 63px ornament row |
| M21 | About › Secretariat | Staff cards | white, radius 6, padding 16, gap 24 | slate-50, radius 12 |
| M22 | Event detail | Breadcrumb and facts | grey strip (#f8f9fa, bottom border) with 12px text; 26px fact icons; 203px hero photo | inline crumbs; 33px icons; 16:9 photo |
| M23 | Mobile eyebrows | Weight | Inter 500 in most frames (700 Objectives, 600 Committee, Manrope 700 Options / How it works) | 700 everywhere |
| F1 | All | Fonts | Public Sans 500/600/700 and Manrope 400 are used in the design | only Public Sans 400 and Manrope 500–700 were loaded, so the browser faked the other weights |

## Tablet (768–1199)

The Figma tablet frames are the desktop frames scaled to 56%. The text is identical to desktop, and the navigation text renders at 7.9px. Copying that literally would make body text 8–9px, which is unreadable on a tablet.

**Approach (kept from the earlier syncs):** tablets use the desktop design at readable sizes, so text stays at least 12px. Grids drop to 2 columns where 3–4 columns would cramp. The header switches to the drawer menu below 1200px. This is a deliberate deviation, recorded here.

## Intentional deviations (not fixed)

| Area | Figma | Site | Reason |
|------|-------|------|--------|
| Mobile header height | 113px | 76px | Figma's frame includes a 50px phone status bar |
| Mobile About › History | KPI cards, a duplicate "Our Legacy" heading, then the desktop carousel scaled to 48% (4.7–8px text) | The readable mobile carousel (24px heading, one card per swipe) | The frame is the desktop component pasted at reduced scale; the copy would be unreadable |
| Mobile accent colours | Some mobile headings drop the gold accent word (Objectives, Committee) | Gold accent kept | Matches desktop and the other mobile headings |
| Mobile-only copy | Mobile frames have their own text in places: About KPI strip, 3 events on Home, footer copy, past-president order, Events/Services CTA bands, no Sitemap link | Desktop content | Rule D2: desktop content is the source of truth. One content set will be edited in the CMS (Phase 3). |
| Fonts | Neue Montreal; Instrument Sans (mobile Past Presidents); SF Pro / Segoe UI on a few labels | Inter stands in for Neue Montreal and Instrument Sans; system font stack for SF Pro / Segoe UI | Neue Montreal is a paid licence, and its files aren't in the repo (see Open questions). Inter is slightly wider, so a few headings wrap where Figma fits one line (e.g. mobile "Meet the Managing Committee"). The header and footer brand boxes are 156px and 200px instead of Figma's ~150px and 188px, so they keep Figma's 3-line wrap. |
| Services contact values (mobile) | Name and email SemiBold, long values Regular | All values Regular 13/18 | The data doesn't mark which values are short; desktop uses one weight |
| Text below 9px | Mobile media featured card (5.6–7.3px) and History preview (4.7–8.3px) | ≥ 11px | Readability and WCAG |
| Past Events default period | June 2025 – May 2026 selected | Latest period that has events | Open question (below) |

## Open questions

1. **Neue Montreal licence.** The site asks for `/fonts/NeueMontreal-*.woff2`, and those files don't exist. Each page load logs three 404s in the console, and Inter is shown instead. Either FTCCI supplies the licensed web-font files (recommended; drop them into `public/fonts/`), or the `@font-face` rules are removed until it does.
2. **Membership option buttons.** On desktop all five option cards say "Explore Corporate Membership". The mobile frame names each option ("Explore Corporate", "Explore Associate", …). Should each button name its own option?
3. **Past Events default period.** Figma shows June 2025 – May 2026 selected. That period has no events in the current data, so the page opens on the latest period that does.
4. **Privilege Card page.** Figma "Desktop - 203" (`1873:22502`) isn't built yet. Should it be part of Phase 1?

## Verification

- `npm run build`: passes.
- Horizontal overflow: none at 320, 360, 390, 414, 600, 768, 820, 1024, 1180, 1200, 1280, 1366, 1440 and 1920 px on all routes.
- Desktop page heights versus Figma: within ±17px on every route except Publications (+18). The remaining differences come from the Inter fallback.
- Every desktop item D1–D18 was re-checked in the browser's computed styles. Mobile pages were compared side by side with the Figma renders.
