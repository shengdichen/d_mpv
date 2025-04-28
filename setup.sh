#!/usr/bin/env dash

SCRIPT_PATH="$(realpath "$(dirname "${0}")")"
cd "${SCRIPT_PATH}" || exit 3

XDG_AUD="$(xdg-user-dir MUSIC | head -c -2)"

__mpv() {
    local _dir_config="${HOME}/.config/mpv"

    mkdir -p "${_dir_config}"
    mkdir -p "${_dir_config}/scripts"

    (
        cd "./common/js" || exit 3
        stow -R --target "${_dir_config}" "src"
        [ ! -d "./node_modules" ] && npm install
    )
    (
        cd "./common" && stow -R --target "${_dir_config}" "mpv"
    )
}

__misc() {
    __mpd() {
        local _dir_lib="${HOME}/.config/mpd/bin/lib"

        mkdir -p "${_dir_lib}"
        if [ -z "$(ls -A "${_dir_lib}")" ]; then
            ln -s "${XDG_AUD}/a" "${_dir_lib}/."
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
