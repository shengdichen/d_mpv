#!/usr/bin/env bash

. "${HOME}/.local/lib/filter.sh"
. "${HOME}/.local/lib/process.bash"
. "${HOME}/.local/lib/util.sh"

GREPPER="${GREPPER}:-rg"

WATCHLATER_DIR="${HOME}/.local/state/mpv/watch_later"
SOCKET_DIR="${HOME}/.local/state/mpv"

declare -a _TARGETS

__pre() {
    _TARGETS=()

    local _filter="yes"
    if [ "${1}" = "--no-filter" ]; then
        _filter=""
        shift
    fi

    if [ "${#}" -eq 0 ]; then
        printf "mpv> no arg from cmdln, reading from stdin...\n" >&2
    fi

    __process "${@}"

    if [ "${#_ARGS[@]}" -eq 0 ]; then
        printf "mpv> no arg received, exiting...\n" >&2
        exit 3
    fi

    if [ ! "${_filter}" ]; then
        _TARGETS+=("${_ARGS[@]}")
        printf "mpv> targets (unfiltered): [%s]\n" "${_TARGETS[*]}" >&2
        return
    fi

    local _target
    while read -r _target; do
        _TARGETS+=("${_target}")
    done < <(__filter_media "${_ARGS[@]}")
    if [ "${#_TARGETS[@]}" -eq 0 ]; then
        printf "mpv> no media to play, exiting...\n" >&2
        exit 3
    fi
    printf "mpv> targets: [%s]\n" "${_TARGETS[*]}" >&2
}

__mpv() {
    __x mpv \
        "${_OPTS[@]}" \
        -- "${_TARGETS[@]}"
}

__mpv_record() {
    _OPTS+=("--save-position-on-quit" "--resume-playback")
    __mpv
}

__mpv_record_exists() {
    local _name
    _name="$(basename "$(realpath "${1}")")"
    if [ "${GREPPER}" = "rg" ]; then
        rg \
            --quiet \
            --follow --fixed-strings \
            "${_name}" "${WATCHLATER_DIR}"
        return
    fi
    grep \
        --quiet \
        --dereference-recursive --fixed-strings \
        "${_name}" "${WATCHLATER_DIR}"
}

__mpv_record_delete() {
    local _f
    _f="$(
        grep \
            --files-with-matches \
            --dereference-recursive --fixed-strings \
            "${1}" "${WATCHLATER_DIR}"
    )"
    rm "${_f}"
    printf "mpv/record> deleted [%s]\n" "${_f}"
}

__mpv_default() {
    __pre "${@}"

    local _n_watchlaters=0 _f_watchlater=""
    local _f
    for _f in "${_TARGETS[@]}"; do
        if __mpv_record_exists "${_f}"; then
            printf "mpv> history found [%s]\n" "${_f}"
            _f_watchlater="${_f}"
            _n_watchlaters=$((_n_watchlaters + 1))
        fi
    done

    if [ "${_n_watchlaters}" -eq 0 ]; then
        __mpv "${_OPTS[@]}" -- "${_TARGETS[@]}"
        return
    fi

    __separator

    if [ "${_n_watchlaters}" -eq 1 ]; then
        printf "mpv> what's the play?\n"
        case "$(__fzf_opts "history (${_f_watchlater})" "blank" "delete")" in
            "history")
                printf "mpv> continuing history [%s]\n\n" "${_f_watchlater}"
                __mpv_record "${_OPTS[@]}" -- "${_TARGETS[@]}"
                ;;
            "blank")
                printf "mpv> starting new\n\n"
                __mpv "${_OPTS[@]}" -- "${_TARGETS[@]}"
                ;;
            "delete")
                __mpv_record_delete "${_f_watchlater}"
                printf "mpv> starting new\n\n"
                __mpv "${_OPTS[@]}" -- "${_TARGETS[@]}"
                ;;
        esac
        return
    fi

    printf "mpv> multiple (%i) files with history found; what now?\n" "${_n_watchlaters}"
    case "$(__fzf_opts "blank" "quit" "record (dangerous!)")" in
        "blank")
            printf "mpv> using none... "
            read -r _
            __mpv "${_OPTS[@]}" -- "${_TARGETS[@]}"
            printf "\n\n"
            ;;
        "quit")
            printf "mpv> quitting... "
            read -r _
            printf "\n\n"
            return
            ;;
        "record")
            __mpv_record "${_OPTS[@]}" -- "${_TARGETS[@]}"
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
                __mpv "${_target}"

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
    local _socket="throw"
    if [ "${1}" = "-s" ]; then
        _socket="${2}"
        shift 2
    fi

    __pre "${@}"

    if ! pgrep -u "$(whoami)" -a |
        cut -d " " -f 2- |
        grep -q "^mpv.*--input-ipc-server=.*/\.local/state/mpv/${_socket}\.sok"; then
        __mpv --input-ipc-server="${SOCKET_DIR}/${_socket}.sok" "${_OPTS[@]}" -- "${_ARGS[@]}"
        return
    fi

    __to_socket() {
        printf "%s\n" "${1}" | socat - "${SOCKET_DIR}/${_socket}.sok"
    }
    local _f
    case "$(__fzf_opts "append" "replace")" in
        "append")
            for _f in "${_ARGS[@]}"; do
                _f="$(realpath "${_f}")"
                __to_socket "loadfile \"${_f}\" append"
            done
            ;;
        "replace")
            local _is_first_file="yes"
            for _f in "${_ARGS[@]}"; do
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
        __pre "${@}"
        __mpv
        ;;
    "record")
        shift
        __pre "${@}"
        __mpv_record
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
