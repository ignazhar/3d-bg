# 3d-bg

A 3D room on your screen where your webcam silhouette casts a shadow. The idea and what
could come next are in [PLAN.md](PLAN.md).

## Run

```bash
python3 -m http.server --bind 127.0.0.1
```

Open <http://localhost:8000> in Chrome, click a step, and allow the camera.

Why a server: browsers only allow the camera on `localhost` or HTTPS, and won't load the
libraries into a page opened as a plain file. `--bind 127.0.0.1` means only this laptop can
open it.

## Steps

Each file stands alone, so you can read it top to bottom. Each one builds on the one before.

| File | What it does | Library |
|---|---|---|
| `1-camera.html` | Shows the webcam, mirrored | none |
| `2-silhouette.html` | Finds you in the picture and draws a black shape where you are | MediaPipe |
| `3-room.html` | A room, a cube and a lamp | three.js |
| `4-shadow.html` | Steps 2 and 3 together: your silhouette blocks the lamp, so you cast a shadow into the room | both |
| `5-garage.html` | Step 4 with 3D models in the room instead of the cube | both |

The libraries load straight from the internet, so you need to be online. Camera frames
never leave the page.

## Adding things to the room

1. Download a model as `.glb` (one file, everything packed inside). On Sketchfab pick
   *Download 3D Model → GLB*.
2. Put it in `models/`.
3. Add a line to the `things` list near the top of `5-garage.html`:
   ```js
   { file: 'models/chair.glb', size: 0.9, position: [1.8, 0, -3.5], turn: -20 },
   ```
   `size` is its longest side in metres, `position` is where it stands (0 up = on the
   floor), `turn` is in degrees.

If a file is missing, the room still opens and the Console says which one it skipped.
Some models are compressed with Draco and need an extra loader; if one won't load, try a
different download or ask.

If a page stays black, open DevTools (F12) and look at the Console for the error.

## Credits

- "porsche 911 930 low poly" (https://skfb.ly/oIvY9) by Panderlon is licensed under Creative
  Commons Attribution (http://creativecommons.org/licenses/by/4.0/).
