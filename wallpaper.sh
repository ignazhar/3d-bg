#!/bin/bash
# Runs a step as your desktop wallpaper: behind all windows and behind the desktop icons.
#
#   ./wallpaper.sh                 runs 7-spin.html
#   ./wallpaper.sh 4-shadow.html   runs another step
#
# Stop it with Ctrl+C. Works on GNOME with X11, not Wayland.

cd "$(dirname "$0")"
page=${1:-7-spin.html}

# The same little server as in the README, on its own port so it doesn't clash with yours.
python3 -m http.server 8123 --bind 127.0.0.1 >/dev/null 2>&1 &
server=$!

# A separate Chrome just for the wallpaper:
#   --user-data-dir  its own profile, so it doesn't mix with your normal Chrome
#   --kiosk          fullscreen, no tabs or address bar
#   --class          a name we can find its window by
#   --use-fake-ui-for-media-stream  allows the camera without asking, only in this Chrome
google-chrome --user-data-dir="$HOME/.cache/3d-bg-chrome" --no-first-run --kiosk \
  --class=3d-bg-wallpaper --use-fake-ui-for-media-stream \
  "http://localhost:8123/$page" >/dev/null 2>&1 &
chrome=$!
trap 'kill $chrome $server 2>/dev/null' EXIT

# Wait for its window. xprop talks to the X server: _NET_CLIENT_LIST on the root window lists
# every window, and WM_CLASS says which program a window belongs to.
window=
until [ -n "$window" ]; do
  sleep 0.5
  for id in $(xprop -root _NET_CLIENT_LIST | grep -oE '0x[0-9a-f]+'); do
    xprop -id "$id" WM_CLASS | grep -q 3d-bg-wallpaper && window=$id
  done
done

# Tell GNOME the window is a desktop, the same kind of window the desktop icons live in.
# GNOME then keeps it below all other windows, on every workspace, and out of Alt+Tab and
# the dock.
xprop -id "$window" -f _NET_WM_WINDOW_TYPE 32a -set _NET_WM_WINDOW_TYPE _NET_WM_WINDOW_TYPE_DESKTOP

# The desktop icons sit on their own see-through desktop window. Move ours below it, so the
# icons stay on top. xprop can't move windows, but GTK's Python bindings (part of Ubuntu) can.
python3 - "$window" <<'EOF'
import sys, gi
gi.require_version('Gdk', '3.0')
gi.require_version('GdkX11', '3.0')
from gi.repository import Gdk, GdkX11
display = Gdk.Display.get_default()
GdkX11.X11Window.foreign_new_for_display(display, int(sys.argv[1], 16)).lower()
display.flush()
EOF

echo "Wallpaper running. Ctrl+C to stop."
wait $chrome
