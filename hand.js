// Hand tracking, kept apart from the room so any step can use it:
//
//   const hand = await createHand();
//   const state = hand.look(video, performance.now()); // once per camera frame
//
// state.points:  the 21 points on your hand (wrist, knuckles, fingertips), or null if
//                there's no hand. Each has x and y from 0 to 1 across the picture.
// state.gesture: what MediaPipe thinks the hand is doing: 'Closed_Fist', 'Open_Palm',
//                'Pointing_Up', 'Thumb_Up', 'Thumb_Down', 'Victory', 'ILoveYou' or 'None'.
// state.fist:    true while you hold a fist. Steadier than checking state.gesture yourself.
// state.x, y:    where the hand is, smoothed.
//
// Everything is flipped left-right like a mirror, the same as the shadow: move your hand to
// your right and x gets bigger.

import { FilesetResolver, GestureRecognizer } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/vision_bundle.mjs';

export async function createHand() {
  // Same library as the silhouette, different network: this one finds one hand, then names
  // its gesture.
  const files = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm');
  const recognizer = await GestureRecognizer.createFromOptions(files, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/latest/gesture_recognizer.task',
      delegate: 'GPU',
    },
    runningMode: 'VIDEO',
    numHands: 1,
  });

  const state = { points: null, gesture: 'None', fist: false, x: 0.5, y: 0.5 };
  let disagree = 0; // how many frames in a row the network has disagreed with state.fist

  function look(video, time) {
    const result = recognizer.recognizeForVideo(video, time);
    const points = result.landmarks[0];
    const hadHand = state.points !== null;
    state.points = points ? points.map((p) => ({ x: 1 - p.x, y: p.y })) : null;
    state.gesture = points ? result.gestures[0][0].categoryName : 'None';

    // Where the hand is: point 9, the knuckle at the base of the middle finger. It barely
    // moves when you open or close your hand, unlike the fingertips. The points jitter a
    // little from frame to frame, so mix each new position with the old one. When a hand
    // first shows up, jump straight to it instead of sliding over from where it left.
    if (state.points) {
      const knuckle = state.points[9];
      const keep = hadHand ? 0.5 : 0;
      state.x = keep * state.x + (1 - keep) * knuckle.x;
      state.y = keep * state.y + (1 - keep) * knuckle.y;
    }

    // The network's answer flickers: one frame says fist, the next says nothing. So only
    // change our mind after it has said the other thing 3 frames in a row (a tenth of a
    // second).
    const fistNow = state.gesture === 'Closed_Fist';
    disagree = fistNow === state.fist ? 0 : disagree + 1;
    if (disagree >= 3) {
      state.fist = fistNow;
      disagree = 0;
    }
    return state;
  }

  return { look };
}
