# Wildlife Resilience — Issue Intake Handoff

## Context

We're tracking issues for the Wildlife Resilience project (website + web app)
using a **Google Form → Google Sheet → GitHub Issues** pipeline.

- **Google Form** ("Wildlife Resilience: Issues") is the intake point.
  Reporters pick a category (Text change / Bug-fix / New feature) and fill in
  the relevant fields. Responses land in a linked Google Sheet with triage
  columns (Status, Owner, Priority, GitHub Issue URL, etc.).

- **GitHub Issues** is where the work gets tracked alongside the code.
  The Sheet is the inbox; GitHub is the workbench.

- For now, the Form-to-GitHub step is manual. The structured issue data lives
  in `issues.json` (same directory as this file). Future batches will follow
  the same format.

## Current repo state (Feb 2026)

**Diverged branches.** Local `main` has 2 commits not on remote; remote has
6 commits not local. **Pull/merge before pushing any new work.**

**Big picture.** The repo has significant structural debt: the `docs/` folder
mixes Quarto source (`.qmd`) with built HTML output, there's a duplicate
`website/` folder (~150MB), no CI/CD, and the `.gitignore` is missing most
build artifacts. The plan is to clean this up with GitHub Actions so that
only source files live in the repo and HTML is built/deployed automatically.

## What's in issues.json

`issues.json` contains **13 issues** in two groups:

**Issues 1–5: Form submissions** (from the Google Form intake, Feb 11 2026)
- #1 Fix citation formatting on Tab 3 (text, high)
- #2 Add notes field to Tab 3 / snowline context (note, low)
- #3 Pop-up metrics crib sheet (feature, low)
- #4 Metrics selector for cross-scenario comparison (feature, low)
- #5 Fix "funnction" typo on applications page (text, high)

**Issues 6–13: Repo scan findings** (structural/infra, Feb 12 2026)
- #6  Remove duplicate `website/` folder (cleanup, high)
- #7  Set up GitHub Actions for Quarto build + deploy (infra, high)
- #8  Fix `.gitignore` — exclude build artifacts and large files (infra, high)
- #9  Restructure `docs/` to separate source from output (infra, high)
- #10 Delete stale `_site/` folders (cleanup, high)
- #11 Fix broken link and typo in `foodweb.qmd` (text, high)
- #12 Remove orphaned pages and stale references (cleanup, low)
- #13 Resolve diverged local/remote branches (infra, high)

## Task for Claude Code

Read `issues.json` and create all issues in the repo using `gh`.

**Important:** Do this work on a feature branch, not directly on `main`.

### Step 0 — Branch and sync

```bash
# First, sync main with remote
git checkout main
git pull origin main          # resolve divergence here

# Then create a feature branch for the issue-tracking setup
git checkout -b issues
```

The `issues/` folder is already in the working tree (untracked). It will
carry over to the new branch automatically.

### Step 1 — Create labels (idempotent)

The `labels` array in `issues.json` defines the label set. Create them
first. Use `--force` so reruns don't fail if labels already exist:

```
jq -r '.labels[] | "\(.name)\t\(.color)\t\(.description)"' issues.json |
while IFS=$'\t' read -r name color desc; do
  gh label create "$name" --color "$color" --description "$desc" --force
done
```

### Step 2 — Create issues from JSON

Use `jq` to extract each issue and `gh issue create` with `--body-file`
to avoid heredoc quoting problems:

```
jq -c '.issues[]' issues.json | while read -r issue; do
  title=$(echo "$issue" | jq -r '.title')
  labels=$(echo "$issue" | jq -r '.labels | join(",")')
  body_file=$(mktemp)
  echo "$issue" | jq -r '.body' > "$body_file"
  gh issue create --title "$title" --label "$labels" --body-file "$body_file"
  rm "$body_file"
done
```

The key trick is `--body-file` instead of `--body`. It reads the issue body
from a temp file, sidestepping all the escaping issues with heredocs, quotes,
special characters, DOIs, em-dashes, etc.

### Step 3 — Commit and push the issues/ folder

```bash
git add issues/
git commit -m "Add issue-tracking pipeline (form intake + 13 issues)"
git push -u origin issues
```

### Step 4 — Create GitHub issues from JSON

```
gh issue list --limit 20
```

Confirm 13 issues appeared with correct titles, labels, and formatted bodies.

### Step 5 — Open a PR

```bash
gh pr create --title "Add issue-tracking pipeline" \
  --body "Adds issues/ folder with:
- issues.json (13 issues: 5 from form intake, 8 from repo scan)
- ISSUES-HANDOFF.md (workflow docs)
- createWildlifeResilienceForm.js (Apps Script reference)"
```

The GitHub issues exist independently of the branch, so they're visible
immediately. The PR is just to get the tracking files into `main`.

## Reuse pattern

For future batches:

1. Export new rows from the Google Sheet (or copy-paste into a Cowork chat).
2. Append to `issues.json` (or create a new `issues-batch-N.json`).
3. Run the same `jq | gh issue create` loop.

The JSON structure per issue is:
```json
{
  "title": "Short descriptive title",
  "labels": ["category", "area", "severity"],
  "body": "Markdown body with \\n for newlines"
}
```

## Label taxonomy

| Label | Color | Use for |
|-------|-------|---------|
| `text` | green | Text/copy changes |
| `bug-fix` | red-orange | Bugs |
| `new-feature` | blue | Feature requests |
| `note` | lavender | Contextual notes or questions |
| `website` | yellow | Static site (wildliferesilience.github.io) |
| `web-app` | peach | Interactive web application |
| `high` | red | High severity |
| `low` | light green | Low severity |
| `infra` | purple | Build, CI/CD, repo structure |
| `cleanup` | teal | Technical debt and cleanup |

## Suggested execution order

Once issues are created, the recommended order of work is:

1. **Resolve branch divergence** (#13) — unblocks everything
2. **Fix .gitignore** (#8) — prevents tracking more junk
3. **Delete stale _site/ folders** (#10) — quick win
4. **Remove duplicate website/ folder** (#6) — big cleanup
5. **Set up GitHub Actions** (#7) — enables automated builds
6. **Restructure docs/** (#9) — depends on GH Actions being in place
7. **Fix text issues** (#5, #11) — quick content fixes
8. **Fix citation formatting** (#1) — content fix in web app
9. **Remove orphaned pages** (#12) — cleanup
10. **Feature requests** (#2, #3, #4) — longer-term roadmap
