#!/usr/bin/env dash

SCRIPT_PATH="$(realpath "$(dirname "${0}")")"
cd "${SCRIPT_PATH}" || exit 3

DIR_MPV="${HOME}/.config/mpv"

DIR_MPD_LIB="${HOME}/.config/mpd/bin/lib"
XDG_AUD="$(xdg-user-dir MUSIC | head -c -2)"

__mpv() {
    mkdir -p "${DIR_MPV}"
    mkdir -p "${DIR_MPV}/scripts"

    (
        cd "./common/js" || exit 3
        stow -R --target "${DIR_MPV}" "src"
        [ ! -d "./node_modules" ] && npm install
    )
    (
        cd "./common" && stow -R --target "${DIR_MPV}" "mpv"
    )
}

__misc() {
    __mpd() {
        mkdir -p "${DIR_MPD_LIB}"
        if [ -z "$(ls -A "${DIR_MPD_LIB}")" ]; then
            ln -s "${XDG_AUD}/a" "${DIR_MPD_LIB}/."
        fi
    }

    __cmus() {
        mkdir -p "${HOME}/.config/cmus"
    }

    __mpd
    __cmus
}

__stow() {
    stow -R --target "${HOME}" "linux"
}

__mpv
__misc
__stow
