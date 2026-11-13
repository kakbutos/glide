# PR #61: review evidence

Reviewed head: `4b81c9e7f50a931ac812c156a60eae251f7736a0`.
Base: `3b14e7a26584240bc828cbdec32e88a8348dcf9a`.

The screenshot contains actual browser canvas output from the unmodified `drawGrid`
renderer. The first row compares a changed `drawCellCallback` plus selection with
a forced full redraw of the same state. The second row magnifies the left edge of
a highlight next to a frozen column, before and after a selection change, and
after a forced full redraw.

To reproduce, use a separate checkout of the reviewed PR head with dependencies
installed, copy `review-evidence.ts` and `review-evidence.html` to its repository
root, then run:

```sh
./node_modules/.bin/esbuild review-evidence.ts --bundle --platform=browser --outfile=review-evidence.js
python3 -m http.server 8768 --bind 127.0.0.1
```

Open `http://127.0.0.1:8768/review-evidence.html` in Chrome. The page renders both
reproductions automatically. The full-redraw reference is generated with
`drawGrid(current, undefined)`; the partial frame uses `drawGrid(current, previous)`.
The same reproductions on the base commit do not exhibit either regression.

This branch stores review artifacts only. It is not a proposed fix.
