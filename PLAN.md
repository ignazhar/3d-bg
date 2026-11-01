# Plan

## The idea

A 3D room on the screen. When you walk up to the laptop, your shadow appears in the room and
moves with you.

The trick: we never work out your 3D shape. The webcam finds where you are in the picture,
which gives a flat black shape. That shape goes in front of a lamp in the 3D room, like a
hand-shadow puppet, and the 3D library makes the shadow fall over the walls and objects.

## Done

1. The camera on screen.
2. Your silhouette from the camera (MediaPipe).
3. A room with a cube and a lamp (three.js).
4. The silhouette as a stencil on the lamp, so your shadow lands in the room.
5. Models in the room from a one-line-per-thing list (`GLTFLoader`), starting with a Porsche.
6. Hand tracking (MediaPipe Gesture Recognizer) in its own module, `hand.js`.
7. Grab the car with your fist and spin it, with momentum when you let go.

## Ideas for next

Roughly in order, but pick whatever is fun.

- **Craft your own room.** Started in step 5. Turn the plain room into a garage that feels like
  yours: a low-poly Porsche, a pull-up bar, better light, and whatever else you'd put in
  your own space. Simple things like the pull-up bar can be a few boxes and cylinders in
  code. The car is easier as a ready-made `.glb` model (free low-poly ones on Poly Pizza or
  Sketchfab; check the licence), loaded with three.js's `GLTFLoader`. To keep it
  customizable, describe the room as one short list of what's in it and where, so adding
  or moving a thing means editing one line. Later maybe drag things around with the mouse
  (`TransformControls`). Every object needs `castShadow` and `receiveShadow` turned on, or
  your shadow won't land on it.
- **A nicer shadow.** Blur its edges. Smooth it over time so it flickers less. Fade it in
  when you appear instead of popping in.
- **The real wallpaper.** Open the page as a fullscreen Chrome window and push it below
  all other windows with `wmctrl`. Later maybe a proper app with Electron.
- **Save battery.** Run slower or stop when nobody is there, and turn the camera off when
  the screen is locked.
- **The window effect.** Track your head with the camera and move the 3D camera with it,
  so the screen looks like a real window into the room.
- **A physically correct shadow.** With a real lamp behind you, walking toward the screen
  makes your shadow smaller and sharper. Our stencil does the opposite: the closer you
  are, the more of the camera picture you fill, so the shadow grows, as if you walked
  toward a projector. Both look fine.

## Things that will bite

- Windows cover the wallpaper most of the time, so you'll mostly see it on an empty desktop.
- Your camera is unusual: an Intel MIPI camera fed through a loopback device. It only offers
  1080p, adds some delay, and may stop after the laptop sleeps.
- Camera, network and 3D running all the time cost battery. You can see the current draw
  with `cat /sys/class/power_supply/BAT0/power_now` (in microwatts).
- Real shadows have no delay, so you will notice the lag on fast hand movements.
- The effect looks best in a dark room, but the camera needs light to see you.
- Close up, the camera only sees your head and shoulders. It sees your whole body from
  about 2 m away.
- A shadow only shows if one lamp clearly dominates the room: keep other light low and
  surfaces matte.
- The camera light is on whenever the page runs.

## Worth reading

- three.js docs: `SpotLight` (especially `.map`) and `WebGLRenderer`
- MediaPipe Image Segmenter guide for the web
- Inspiration: *Text Rain* (Utterback and Achituv, 1999), *Shadow Monsters* (Philip
  Worthington), Johnny Lee's Wii-remote head tracking demo (2007)
