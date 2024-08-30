#!/usr/bin/env dash

GREPPER="${GREPPER}:-rg"

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

__mpv_has_record() {
    if [ "${GREPPER}" = "rg" ]; then
        rg \
            --quiet \
            --follow --fixed-strings \
            "${1}" "${WATCHLATER_DIR}"
        return
    fi
    grep \
        --quiet \
        --dereference-recursive --fixed-strings \
        "${1}" "${WATCHLATER_DIR}"
}

__mpv_default() {
    if [ "${1}" = "--" ]; then shift; fi

    local _n_watchlaters=0 _fname="" _f_watchlater=""
    for _f in "${@}"; do
        _fname="$(basename "$(realpath "${_f}")")"
        if __mpv_has_record "${_fname}"; then
            printf "mpv> history found [%s]\n" "${_f}"
            _f_watchlater="${_f}"
            _n_watchlaters=$((_n_watchlaters + 1))
        fi
    done

    if [ "${_n_watchlaters}" -eq 0 ]; then
        __mpv -- "${@}"
        return
    fi

    __separator

    if [ "${_n_watchlaters}" -eq 1 ]; then
        printf "mpv> what's the play?\n"
        case "$(__fzf_opts "history (${_f_watchlater})" "blank" "delete")" in
            "history")
                printf "mpv> continuing history [%s]\n\n" "${_f_watchlater}"
                __mpv_record -- "${@}"
                ;;
            "blank")
                printf "mpv> starting new\n\n"
                __mpv -- "${@}"
                ;;
            "delete")
                _f="$(
                    grep \
                        --files-with-matches \
                        --dereference-recursive --fixed-strings \
                        "${_f_watchlater}" "${WATCHLATER_DIR}"
                )"
                rm "${_f}"
                printf "mpv> starting new [also removed %s]\n\n" "${_f}"
                __mpv -- "${@}"
                ;;
        esac
        return
    fi

    printf "mpv> multiple (%i) files with history found; what now?\n" "${_n_watchlaters}"
    case "$(__fzf_opts "blank" "quit" "record (dangerous!)")" in
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
        "record")
            __mpv_record -- "${@}"
            ;;
    esac
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
    __find_files() {
        find "${@}" -type f -print | sort
    }

    local _socket="throw"
    if [ "${1}" = "-s" ]; then
        _socket="${2}"
        shift 2
    fi
    if [ "${1}" = "--" ]; then shift; fi

    if ! pgrep -u "$(whoami)" -a |
        cut -d " " -f 2- |
        grep -q "^mpv.*--input-ipc-server=.*/\.local/state/mpv/${_socket}\.sok"; then
        __mpv --input-ipc-server="${SOCKET_DIR}/${_socket}.sok" -- "${@}"
        return
    fi

    __to_socket() {
        printf "%s\n" "${1}" | socat - "${SOCKET_DIR}/${_socket}.sok"
    }
    case "$(__fzf_opts "append" "replace")" in
        "append")
            for _f in "${@}"; do
                _f="$(realpath "${_f}")"
                __to_socket "loadfile \"${_f}\" append"
            done
            ;;
        "replace")
            local _is_first_file="yes"
            for _f in "${@}"; do
                _f="$(realpath "${_f}")"
                if [ "${_is_first_file}" ]; then
                    __to_socket "loadfile \"${_f}\" replace" # only replace first
                    _is_first_file=""
                    continue
                fi
                __to_socket "loadfile \"${_f}\" append" # append rest
            done
            ;;
    esac
    __to_socket "set pause no" # unpause
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
