#!/usr/bin/env dash

SCRIPT_PATH="$(realpath "$(dirname "${0}")")"
cd "${SCRIPT_PATH}" || exit 3

DIR_MPV="${HOME}/.config/mpv"

DIR_MPD_LIB="${HOME}/.config/mpd/bin/lib"
XDG_AUD="$(xdg-user-dir MUSIC | head -c -2)"

__misc() {
    mkdir -p "${DIR_MPV}/scripts/"
    if [ ! -d "./common/js/node_modules" ]; then
        (cd "./common/js/" && npm install)
    fi

    mkdir -p "${DIR_MPD_LIB}"
    if [ -z "$(ls -A "${DIR_MPD_LIB}")" ]; then
        ln -s "${XDG_AUD}/a" "${DIR_MPD_LIB}/."
    fi

    mkdir -p "${HOME}/.config/cmus"
}

__stow() {
    stow -R --target="${HOME}" "linux"
    (
        cd "./common/js/" || exit 3
        stow -R --target="${DIR_MPV}/" "src"
    )
}

__misc
__stow
