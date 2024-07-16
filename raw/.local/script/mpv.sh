#!/usr/bin/env dash

WATCHLATER_DIR="${HOME}/.local/state/mpv/watch_later"
SOCKET_DIR="${HOME}/.local/state/mpv"

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

__mpv_socket() {
    __to_socket() {
        printf "%s\n" "${1}" | socat - "${SOCKET_DIR}/${2}.sok"
    }

    __find_files() {
        find "${@}" -type f -print | sort
    }

    local _socket="throw"
    if [ "${1}" = "-s" ]; then
        _socket="${2}"
        shift && shift
    fi
    if [ "${1}" = "--" ]; then shift; fi

    __mpv_socket() {
        __find_files "${@}" | xargs -d "\n" -- \
            nohup mpv \
            --input-ipc-server="${SOCKET_DIR}/${_socket}.sok" \
            --
    }
    if ! pgrep -u "$(whoami)" -a |
        cut -d " " -f 2- |
        grep -q "^mpv.*--input-ipc-server=.*/\.local/state/mpv/${_socket}\.sok"; then
        __mpv_socket "${@}" >/dev/null 2>&1 &
        return
    fi

    local _mode
    _mode="$(for _mode in "replace" "append"; do
        printf "%s\n" "${_mode}"
    done | __fzf)"

    local _counter=0
    __find_files "${@}" |
        while IFS="" read -r _file; do
            _file="$(realpath "${_file}")"
            if [ "${_mode}" = "replace" ] && [ "${_counter}" -eq 0 ]; then
                _counter="$((_counter + 1))"
                __to_socket "loadfile \"${_file}\" replace" "${_socket}"
            else
                __to_socket "loadfile \"${_file}\" append" "${_socket}"
            fi
        done
    __to_socket "set pause no" "${_socket}"
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
    "socket")
        shift
        __mpv_socket "${@}"
        ;;
    *)
        __mpv_default "${@}"
        ;;
esac
