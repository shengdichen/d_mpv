function print_osd (text, duration) {
  if (!duration) {
    duration = 0.7
  }
  mp.osd_message(text, duration)
}

module.exports.print_osd = print_osd
