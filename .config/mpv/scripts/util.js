function print_osd (text, duration) {
  if (!duration) {
    duration = 0.7
  }
  mp.osd_message(text, duration)
}

function mp_run_command (fragments) {
  mp.commandv.apply(null, fragments)
}

function _is_visible_by_default_osc () {
  var opt = { visibility: 'never' }
  mp.options.read_options(opt, 'osc')
  return opt.visibility != 'never'
}
var is_visible_osc = _is_visible_by_default_osc()
function toggle_osc () {
  var frags_base = ['no-osd', 'script-message', 'osc-visibility']
  var frags_disable = frags_base.concat('never')
  var frags_enable = frags_base.concat('always')
  if (is_visible_osc) {
    mp_run_command(frags_disable)
  } else {
    mp_run_command(frags_enable)
  }
  is_visible_osc = !is_visible_osc
}

module.exports.print_osd = print_osd
module.exports.toggle_osc = toggle_osc
