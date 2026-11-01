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

The libraries load straight from the internet, so you need to be online. Camera frames
never leave the page.

If a page stays black, open DevTools (F12) and look at the Console for the error.
