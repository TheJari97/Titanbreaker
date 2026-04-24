@echo off
setlocal

set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..

python "%SCRIPT_DIR%update_from_catzee.py"

if exist "%ROOT_DIR%\sources\Titanbreaker-master" (
  python "%SCRIPT_DIR%sync_visual_assets.py" "%ROOT_DIR%\sources\Titanbreaker-master"
) else (
  echo [INFO] No local Catzee repo found at "%ROOT_DIR%\sources\Titanbreaker-master"
  echo [INFO] Data sync completed with remote text sources only.
)

echo Done.
pause

python "%~dp0build_artifacts.py"
