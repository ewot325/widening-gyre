# The Widening Gyre

Website for *The Widening Gyre*, a monthly magazine by Ted Schmiedeler.

It's a plain static site (no build step). Every page is driven by one data
file, so publishing an issue doesn't require touching any code.

## Adding a new issue (manual method)

1. Put the issue's PDF in `issues/` (e.g. `issues/vol1-no2.pdf`).
2. Put its cover image in `covers/` (e.g. `covers/vol1-no2.jpg`).
3. Add an entry to the top of the `issues` list in `data/issues.json`.

The newest issue (by `sortDate`) automatically becomes the homepage; the rest
fall into the Archive.

> An admin panel is being added so this can be done from a web form instead of
> editing the file by hand.

## Local preview

```
python3 -m http.server 8797
```

Then open http://localhost:8797

## Structure

- `index.html` — current (newest) issue
- `archive.html` — all past issues
- `about.html` — Statement of Purpose
- `submit.html` — call for submissions
- `reader.html` — in-browser PDF reader (`reader.html?issue=<id>`)
- `data/issues.json` — the list of issues (the one file that changes each month)
- `css/`, `js/`, `covers/`, `issues/`
