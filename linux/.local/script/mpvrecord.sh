#!/usr/bin/env dash

. "${HOME}/.local/lib/util.sh"

SCRIPT_NAME="$(basename "${0}")"

WATCHLATER_PATH_GIT=".local/state/mpv/watch_later"
WATCHLATER_PATH="${HOME}/${WATCHLATER_PATH_GIT}"

__get_title() {
    if [ "${#}" -gt 0 ]; then
        head -n "1" "${1}"
    else
        head -n "1"
    fi | cut -d " " -f "2-"
}

__list() {
    local _title _time
    find "${WATCHLATER_PATH}" -follow -mindepth 1 | sort -n | while read -r _f; do
        _title="$(__get_title "${_f}")"
        _time="$(grep "^start=" "${_f}" | sed "s/^start=\(.*\)$/\1/")"
        printf "history/tracked> %s @ %s [%s]\n" "${_title}" "${_time}" "$(basename "${_f}")"
    done
}

__handle_modified() {
    local _list_only=""
    if [ "${1}" = "--list-only" ]; then
        _list_only="yes"
    fi

    __get_modified() {
        git diff --name-status "." | grep "^M" | cut -f 2 |
            sed "s/.*\/\(.*\)/\1/" |             # simulate |basename|
            grep --invert-match "${SCRIPT_NAME}" # exclude this script
    }

    (
        cd "${WATCHLATER_PATH}" || exit 3

        local _title
        __get_modified | while read -r _f; do
            _title="$(__get_title "${_f}")"
            printf "history/modified> %s [%s]\n" "${_title}" "${_f}"

            if [ "${_list_only}" ]; then
                continue
            fi

            case "$(__fzf_opts "skip" "commit (update)" "undo (restore)")" in
                "skip") ;;
                "commit")
                    git add -u -- "${_f}"
                    ;;
                "undo")
                    git restore -- "${_f}"
                    ;;
            esac
            printf "\n"
        done
    )
}

__handle_new() {
    local _list_only=""
    if [ "${1}" = "--list-only" ]; then
        _list_only="yes"
    fi

    (
        cd "${WATCHLATER_PATH}" || exit 3

        local _title
        git ls-files --others | while read -r _f; do
            _title="$(__get_title "${_f}")"
            printf "history/untracked> %s [%s]\n" "${_title}" "${_f}"

            if [ "${_list_only}" ]; then
                continue
            fi

            case "$(__fzf_opts "skip" "commit (add)" "undo (delete)")" in
                "skip") ;;
                "commit")
                    git add -- "${_f}"
                    ;;
                "undo")
                    rm -- "${_f}"
                    ;;
            esac
            printf "\n"
        done
    )
}

__handle_deleted() {
    local _list_only=""
    if [ "${1}" = "--list-only" ]; then
        _list_only="yes"
    fi

    (
        cd "${WATCHLATER_PATH}" || exit 3

        local _title
        git ls-files --deleted | while read -r _f; do
            _title="$(git show "@":"${WATCHLATER_PATH_GIT}/${_f}" | __get_title)"
            printf "history/deleted> %s [%s]\n" "${_title}" "${_f}"

            if [ "${_list_only}" ]; then
                continue
            fi

            case "$(__fzf_opts "skip" "undo (restore)" "commit (delete)")" in
                "skip") ;;
                "undo")
                    git restore "${_f}"
                    ;;
                "commit")
                    git add -u "${_f}"
                    ;;
            esac
            printf "\n"
        done
    )
}

__handle() {
    __handle_modified --list-only
    printf "\n"

    __handle_deleted --list-only
    printf "\n"
    __handle_new --list-only
    printf "\n"

    __separator

    __handle_modified

    __handle_deleted
    __handle_new
}

__delete() {
    local _files _title
    _files="$(
        find "${WATCHLATER_PATH}" -follow -mindepth 1 | while read -r _f; do
            _title="$(__get_title "${_f}")"
            printf "%s  // %s\n" "${_title}" "${_f}"
        done |
            __fzf --multi |
            sed "s/^.*  \/\/ \(.*\)$/\1/"
    )"

    if [ ! "${_files}" ]; then
        printf "mpv/delete> skipping [nothing to delete]\n"
        return
    fi

    printf "%s\n" "${_files}" | while read -r _f; do
        printf "mpv/delete> [%s]\n" "${_f}"
        rm -- "${_f}"
    done
}

__gitupdate() {
    (
        cd "${WATCHLATER_PATH}" || exit 3

        git add -u "."
        git add "."
    )
}

case "$(__fzf_opts "list" "handle" "delete" "update (force)")" in
    "list")
        __list
        ;;
    "handle")
        __handle
        ;;
    "delete")
        __delete
        ;;
    "update")
        __gitupdate
        ;;
esac
