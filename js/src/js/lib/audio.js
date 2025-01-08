var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var volume = {
  /**
   * @param {number} offset
   */
  shift: function (offset) {
    var vol_prev = mpv.property.get_number("volume");
    var vol_next = vol_prev + offset;
    mpv.property.set_number("volume", vol_next);

    mpv.osd.print(
      "audio/volume> " +
        util.format.format_as_evolution(vol_prev, offset, vol_next)
    );
  },

  mute: function () {
    mpv.property.cycle("mute");
    mpv.osd.print(
      "audio/mute> " +
        util.format.format_boolean(mpv.property.get_boolean("mute"))
    );
  },
};

var activation = {
  /**
   * @param {integer} [incr]
   */
  navigate: function (incr) {
    mpv.property.shift("audio", incr || +1);
    report.tracking.print_pretty_audio();
  },

  /**
   * consider using volume.mute() instead
   */
  toggle: function () {
    if (activation.is_active()) {
      activation.disable();
      return;
    }
    activation.enable();
  },

  enable: function () {
    if (activation.is_active()) return;
    mpv.property.set_string("audio", "auto");
  },

  disable: function () {
    if (!activation.is_active()) return;
    mpv.property.set_boolean("audio", false);
  },

  /**
   * @returns {boolean}
   */
  is_active: function () {
    return mpv.property.get_autotype("audio") !== false;
  },
};

module.exports = {
  volume: volume,
  activation: activation,
};
