# LTCube Product Backlog

Last updated: Oct 6, 2026 · Owner: Ray

## How to use this backlog

Work top to bottom: finish every Must before starting a Should. Each story lists acceptance criteria as checkboxes, and a story is done when every box is ticked and the Definition of Done below holds.

| Key | Meaning |
| --- | --- |
| Must | Needed for v1 to be credible to learners and recruiters |
| Should | High value for v1.1, not blocking |
| Could | Worth doing if time allows |
| Won't (yet) | Out of scope on purpose, with a reason |
| Size S | Fits in one Claude Code session |
| Size M | One to two sessions |
| Size L | Three or more sessions; split it before starting |

**Definition of Done** (applies to every story):

- `npm run build` passes, with the dev server stopped first
- vitest and `caseValidator.ts` pass
- Checked at desktop width and at 375px
- Committed with a clear message and pushed to `main`
- Verified on [ltcube.vercel.app](https://ltcube.vercel.app) after Vercel redeploys

## Personas

Maya is the primary user: every Must story should make her first solve easier. Jordan and Sam shape the Should and Could stories.

| Persona | Who they are | What they want | What gets in the way |
| --- | --- | --- | --- |
| Maya, the first-timer | 15, got a cube as a gift, has never solved one | Solve it once and show someone | Notation looks like code; she can't tell which piece matters |
| Jordan, the stuck learner | College student who got through the cross from a YouTube video | Get past the last layer | Can't recognize which case they have or how to hold the cube |
| Sam, the improver | Solves in about 3 minutes with the beginner method | Learn 2-Look OLL and PLL to get faster | Needs repetition and recognition practice, not explanations |

One stakeholder also matters: recruiters and hiring managers, who judge the project in about two minutes from the live site and the GitHub repo.

## Now: Must

Six stories, all size S except the notation guide. Finish these before sharing the link widely.

### N1. Link preview image (S)

As Ray sharing the project on LinkedIn, I want a preview image when the link is pasted, so that people click it.

- [ ] A 1200×630 Open Graph image is served for the site, showing the LTCube name and a cube
- [ ] LinkedIn Post Inspector shows the image, title, and description for ltcube.vercel.app
- [ ] Pasting the link in iMessage or Slack shows the image

### N2. Real README and repo About section (S)

As a recruiter, I want to understand the project in 30 seconds from the GitHub repo, so that I take it seriously.

- [ ] README has a one-line pitch, live link, screenshot, features, tech stack, engineering highlights, and run-locally steps
- [ ] `docs/screenshot.png` exists and renders in the README
- [ ] Repo About has a description, the website link, and topics (nextjs, threejs, react-three-fiber, typescript, rubiks-cube)

### N3. Keep local files out of the public repo (S)

As the project owner, I want machine-specific files out of the repo, so that nothing private or confusing is public.

- [x] `.claude/settings.local.json` is untracked and in `.gitignore`
- [x] `docs/superpowers` is either kept on purpose or removed
- [x] A search of the repo history finds no `.env` files or API keys

### N4. Page titles name the site (S)

As a learner with several tabs open, I want each tab title to include LTCube, so that I can find the lesson I was on.

- [ ] Every page title reads like "Top face (OLL) · LTCube"
- [ ] The landing page title reads "LTCube: Learn to solve the Rubik's Cube"

### N5. Live-site check on real phones (S)

As Maya on her phone, I want every lesson to work on mobile, so that I can follow along with the cube in my hands.

- [ ] A full Cross lesson works in iPhone Safari and Android Chrome
- [ ] OLL glow, camera glide, and "?" tooltips work by tap
- [ ] The trainer quiz completes and shows results
- [ ] Refreshing directly on a lesson URL loads the page, not a 404
- [ ] The browser console shows no errors on any route

### N6. How to read moves (M)

As Maya, I want to learn what R, U, F and the apostrophe mean, so that the move list isn't a code I can't read.

- [ ] A "How to read moves" page or panel is reachable from every lesson
- [ ] Each face move (R, L, U, D, F, B) animates on the 3D cube, plus the ' (counter-clockwise), 2 (half turn), and lowercase wide-move variants
- [ ] Tapping or hovering a move in the player's move list shows one line, e.g. "R: turn the right face clockwise"
- [ ] The first Cross lesson links to it before any moves appear

## Next: Should (v1.1)

Start with analytics so later decisions rest on real usage, not guesses. The redesign is the largest item and is split into three parts.

### S1. See where learners drop off (S)

As Ray, I want to see which steps learners reach and where they stop, so that I fix the step that loses the most people.

- [ ] Vercel Web Analytics is on
- [ ] Events fire for: lesson opened, algorithm played, case marked complete, quiz finished
- [ ] No personal data is collected, and the footer says so in one line

### S2. Tell me where you got stuck (S)

As Jordan, I want an easy way to say which case confused me, so that it gets fixed.

- [ ] Every lesson has a "Stuck? Tell me" link
- [ ] It opens a short form or a GitHub issue template prefilled with the step and case name
- [ ] Ray is notified when one is submitted

### S3. Pick up where I left off (S)

As Maya coming back the next day, I want the site to take me to my next unfinished case, so that I don't hunt for my place.

- [ ] The landing page and /learn show "Continue: [step], [case]" when progress exists
- [ ] Clicking it opens that exact case
- [ ] First-time visitors don't see it

### S4. Bold product redesign (L, split into 3)

As Maya, I want the site to feel polished and distinct, so that I trust it enough to keep going. Use the three bold-product prompts, one per part.

- [ ] Part 1: dark design tokens, cube rim lighting, and shared components
- [ ] Part 2: landing page with the "Solve it." hero
- [ ] Part 3: every remaining page restyled, no light backgrounds left
- [ ] Cube edges are clearly visible on the dark background, and red and orange stay distinct
- [ ] All text meets WCAG AA contrast; no gradients, glows, or purple accents

### S5. Solve Along, guided practice (M)

As Jordan, I want to scramble my real cube and be guided stage by stage, so that I practice the whole method end to end.

- [ ] A 20-move scramble is shown and applied to the 3D cube
- [ ] The app detects which of the 5 stages the cube is in
- [ ] "I solved this stage" advances, with a tip from that step's lesson
- [ ] The feature flag is turned on only when every box above is ticked

## Later: Could and Won't (yet)

These wait until the Must and Should stories ship and analytics shows how people actually use the site. Write full acceptance criteria when one moves up.

| ID | Story | Persona | Priority | Size |
| --- | --- | --- | --- | --- |
| C1 | As Sam, I want to drill one algorithm on repeat, so that it becomes muscle memory | Sam | Could | S |
| C2 | As Sam, I want a built-in solve timer with session averages, so that I can track getting faster | Sam | Could | M |
| C3 | As Sam, I want all 57 OLL and 21 PLL cases, so that I can learn full CFOP | Sam | Could | L |
| C4 | As Sam, I want intuitive F2L lessons, so that I can replace the beginner first two layers | Sam | Could | L |
| C5 | As Maya, I want soft sounds when a case solves, with a mute toggle, so that progress feels rewarding | Maya | Could | S |
| W1 | As a returning learner, I want an account that syncs progress across devices | Maya | Won't (yet) | L |
| W2 | As Jordan, I want to scan my real cube with my camera to load its state | Jordan | Won't (yet) | L |

Why W1 and W2 wait: browser-saved progress is enough until analytics shows people returning on more than one device, and camera scanning is a project of its own.

## Shipped in v1

v1 went live in October 2026 with 28 lessons across 5 steps. These are the stories it delivered, useful for the README and for interview answers.

| Epic | Story delivered | Serves |
| --- | --- | --- |
| Learning a case | Every lesson opens already scrambled into its exact situation, and pressing play solves it | Maya |
| Focus | Irrelevant pieces turn gray; arrows and target rings show where the piece starts and ends | Maya |
| Recognition | OLL shows only yellow stickers; PLL grays the bottom two layers | Jordan, Sam |
| Recognition | The stickers to look for glow before the moves play | Jordan |
| Recognition | The camera shows the hidden feature, then turns to the hold position with a floating label | Jordan |
| Recognition | Every OLL and PLL case has a diagram generated from the cube engine | Jordan, Sam |
| Plain language | Every case has a plain title, explanation, how-to-spot hint, and how-to-hold line, plus "?" tooltips | Maya |
| Practice | OLL and PLL recognition quiz, timed or untimed, with results | Sam |
| Progress | Completed steps, learned cases, quiz accuracy, and a daily streak | Maya, Sam |
| Reference | Searchable, printable algorithm sheet that reads from the lesson data | Sam |
| Quality | 235 tests, a case validator for every lesson, 375px layout, 44px tap targets, reduced-motion support | All |
| Scope | Solve Along built but held back behind a flag to ship on time | All |

## Moving this into GitHub and Claude Code

Put each story in GitHub Issues so recruiters who open the repo see a real product process, then hand issues to Claude Code one at a time.

1. Create labels in the [ltcube repo](https://github.com/raymond913/ltcube): `must`, `should`, `could`, `wont`, `size:S`, `size:M`, `size:L`, and one `epic:` label per epic.
2. Create one issue per story. Title it with the ID and name ("N1 Link preview image"), put the story sentence in the body, and paste the acceptance criteria as a `- [ ]` checklist.
3. Create a GitHub Projects board with four columns: Backlog, Ready, In progress, Done. Group cards by priority label.
4. To start a story, paste its issue into Claude Code and add: "Turn each acceptance criterion into a test where possible. Report how you verified each one."
5. End the commit message with "closes #[issue number]" so the issue closes automatically when you push.

Shortcut: if the GitHub CLI is installed, ask Claude Code to read this backlog and run `gh issue create` for every story with the right labels.
