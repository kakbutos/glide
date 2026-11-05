# PR #62: browser reproductions

Source under test: RamK-16/glide commit `84e40e3b52764a0ddd1134b0d878f6b8b7fd2202`.
The grid source was not changed. The harness mounts the actual internal DataGrid with a custom canvas renderer. React 18.3.1 was used.

- `tall-content.jpg`: two actual grids, 1px apart in scroll position. A 600px content rectangle shrinks to 429px, then its top jumps from y=40 to y=-132 when the block bottom crosses 469 -> 468.
- `css-scale-click.jpg`: real pointer clicks on the painted button. Scale 1: content Y=77.5, event Y=76.5, HIT. Scale 2: content Y=77.8, event Y / scale=37.8, MISS. The button occupies content Y=65..90. The 1px control difference is distinct from the scale-dependent 40 logical pixel error. Bounds printed below each grid come directly from DataGridRef.getContentBounds; render rectangles come directly from the renderer callback.

The scale demo clips the displayed grid container to 220 screen pixels to keep the button and diagnostics in one screenshot; the actual grid height remains 468.

## Run the harness

Place demo.tsx alongside a `repo` checkout of the tested commit and copy index.html into a `public` directory. Install the repository dependencies with `npm ci` inside repo. Bundle demo.tsx for the browser using esbuild with `nodePaths: [absolutePathToRepoNodeModules]`, `bundle: true`, `format: "iife"`, and `define: {"process.env.NODE_ENV": "\"development\""}`, outputting public/demo.js. Serve public using a local HTTP server.

No production code changes or fixes are included in this evidence branch.
