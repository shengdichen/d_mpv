$DIR_CONFIG = "$env:APPDATA\mpv"

function CopyConfig
{
    New-Item $DIR_CONFIG -ItemType Directory -ErrorAction SilentlyContinue
    New-Item "$DIR_CONFIG\scripts" -ItemType Directory -ErrorAction SilentlyContinue

    Copy-Item ".\common\js\src\*" $DIR_CONFIG -Recurse -Force
    Copy-Item ".\common\mpv\*" $DIR_CONFIG -Recurse -Force
    Copy-Item ".\windows\mpv\*" $DIR_CONFIG -Recurse -Force
}

function SetupJs
{
    if (Test-Path ".\common\js\node_modules")
    {
        return
    }
    Push-Location ".\common\js"
    npm install
    Pop-Location
}

function Main
{
    CopyConfig
    SetupJs
}
Main
