// A GNOME Shell extension: code that runs inside GNOME Shell itself, the program that draws
// the desktop, the overview (Super key) and the lock screen.
//
// GNOME never draws windows in the overview or on the lock screen, only its background
// picture. So wallpaper.sh's window can't be the background on its own. Instead, wherever
// GNOME draws a background, we put a live copy of that window on top of it: a Clutter.Clone,
// which paints another actor (anything GNOME Shell draws is an "actor") a second time,
// scaled to its own size.

import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Background from 'resource:///org/gnome/shell/ui/background.js';

const WM_CLASS = '3d-bg-wallpaper'; // the --class that wallpaper.sh gives Chrome

export default class Wallpaper extends Extension {
  enable() {
    this._window = null; // the wallpaper window's actor, once it shows up
    this._clones = new Set();

    // Every background, wherever it is, is made by BackgroundManager._createBackgroundActor.
    // Wrap it, so each new background gets a copy of the window too.
    const extension = this;
    const original = Background.BackgroundManager.prototype._createBackgroundActor;
    this._original = original;
    Background.BackgroundManager.prototype._createBackgroundActor = function () {
      const background = original.call(this);
      extension._addClone(background);
      return background;
    };

    // Watch for the wallpaper window to open, and check the ones already open.
    this._mapId = global.window_manager.connect('map', (wm, actor) => this._found(actor));
    for (const actor of global.get_window_actors()) this._found(actor);
  }

  disable() {
    Background.BackgroundManager.prototype._createBackgroundActor = this._original;
    global.window_manager.disconnect(this._mapId);
    for (const clone of this._clones) clone.destroy();
    if (this._window) this._window.opacity = 255;
    this._window = null;
  }

  _found(actor) {
    if (actor.meta_window.get_wm_class() !== WM_CLASS) return;
    this._window = actor;
    // Hide the window itself. A clone draws its source at the clone's own opacity, so the
    // copies still show.
    actor.opacity = 0;
    actor.connect('destroy', () => {
      this._window = null;
      for (const clone of this._clones) clone.destroy();
    });
    // Put a copy on every background that already exists.
    this._forEachBackground(global.stage, (background) => this._addClone(background));
  }

  _forEachBackground(actor, callback) {
    if (actor instanceof Meta.BackgroundActor) callback(actor);
    for (const child of actor.get_children()) this._forEachBackground(child, callback);
  }

  _addClone(background) {
    if (!this._window) return;
    if (background.get_children().some((child) => this._clones.has(child))) return;
    const clone = new Clutter.Clone({ source: this._window });
    // Always the same size as the background it sits on, even the small ones in the overview.
    clone.add_constraint(new Clutter.BindConstraint({
      source: background,
      coordinate: Clutter.BindCoordinate.SIZE,
    }));
    background.add_child(clone);
    this._clones.add(clone);
    clone.connect('destroy', () => this._clones.delete(clone));
  }
}
