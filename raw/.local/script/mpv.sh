#!/usr/bin/env dash

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
esac
