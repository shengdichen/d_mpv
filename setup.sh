#!/usr/bin/env dash

SCRIPT_PATH="$(realpath "$(dirname "${0}")")"
cd "${SCRIPT_PATH}" || exit 3

DIR_MPV="${HOME}/.config/mpv"

__misc() {
    mkdir -p "${DIR_MPV}/scripts/"
    if [ ! -d "./js/node_modules" ]; then
        (cd "./js/" && npm install)
    fi

    mkdir -p "${HOME}/.config/cmus"
}

__stow() {
    stow -R --target="${HOME}" "raw"
    (
        cd "./js/" || exit 3
        stow -R --target="${DIR_MPV}/" "src"
    )
}

__misc
__stow
