#!/usr/bin/env dash

WATCHLATER_DIR="${HOME}/.local/state/mpv/watch_later"

. "${HOME}/.local/lib/util.sh"

__mpv() {
    __x mpv "${@}"
}

__mpv_record() {
    __mpv \
        --save-position-on-quit \
        --resume-playback \
        "${@}"
}

__mpv_default() {
    if [ "${1}" = "--" ]; then shift; fi

    local _n_watchlaters=0 _fname="" _f_watchlater=""
    for _f in "${@}"; do
        _fname="$(basename "$(realpath "${_f}")")"
        if grep --recursive --quiet "^# ${_fname}$" "${WATCHLATER_DIR}"; then
            _f_watchlater="${_f}"
            _n_watchlaters=$((_n_watchlaters + 1))
        fi
    done

    if [ "${_n_watchlaters}" -eq 0 ]; then
        __mpv -- "${@}"
    elif [ "${_n_watchlaters}" -eq 1 ]; then
        printf "mpv> history found; what's the play?  [%s]\n" "${_f_watchlater}"
        case "$(__fzf_opts "history" "blank")" in
            "history")
                printf "mpv> continuing history\n\n"
                __mpv_record -- "${@}"
                ;;
            "blank")
                printf "mpv> starting new\n\n"
                __mpv -- "${@}"
                ;;
        esac
    else
        printf "mpv> multiple files with history found; what now?\n"
        case "$(__fzf_opts "blank" "quit")" in
            "blank")
                printf "mpv> using none... "
                read -r _
                __mpv -- "${@}"
                printf "\n\n"
                ;;
            "quit")
                printf "mpv> quitting... "
                read -r _
                printf "\n\n"
                return
                ;;
        esac
    fi
}

__mpv_paste() {
    local _target _input
    while true; do
        _target="$(wl-paste)"
        printf "mpv-paste> \"%s\"  [%s]\n" "$(yt-dlp --get-title "${_target}")" "${_target}"
        printf "mpv-paste> go ahead? [y]es (default), [n]o "
        read -r _input
        case "${_input}" in
            "n" | "N")
                printf "mpv-paste> recopy to proceed "
                read -r _
                printf "\n"
                ;;
            *)
                printf "mpv-paste> launching...\n"
                __mpv -- "${_target}"

                printf "\n"
                printf "mpv-paste> break? [y]es (default), [n]o "
                read -r _input
                case "${_input}" in
                    "n" | "N")
                        printf "\n"
                        ;;
                    *)
                        printf "mpv-paste> quiting\n"
                        break
                        ;;
                esac
                ;;
        esac
    done
}

case "${1}" in
    "direct")
        shift
        __mpv "${@}"
        ;;
    "record")
        shift
        __mpv_record "${@}"
        ;;
    "paste")
        shift
        __mpv_paste
        ;;
    *)
        __mpv_default "${@}"
        ;;
esac
