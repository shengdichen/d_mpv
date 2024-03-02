function print_osd (text, duration) {
  if (!duration) {
    duration = 0.7
  }
  mp.osd_message(text, duration)
}

function _is_visible_by_default_osc () {
  var opt = { visibility: 'never' }
  mp.options.read_options(opt, 'osc')
  return opt.visibility != 'never'
}
var is_visible_osc = _is_visible_by_default_osc()
function toggle_osc () {
  if (is_visible_osc) {
    mp.command('no-osd script-message osc-visibility never')
  } else {
    mp.command('no-osd script-message osc-visibility always')
  }
  is_visible_osc = !is_visible_osc
}

module.exports.print_osd = print_osd
module.exports.toggle_osc = toggle_osc
