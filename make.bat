@echo off

SET project_folder=%~dp0
REM SET jsbeutify_folder=E:\Piotrek\Temp\jsbeutify

IF NOT EXIST "%project_folder%\build\" MD "%project_folder%\build" || pause
IF NOT EXIST "%project_folder%\logs\" MD "%project_folder%\logs" || pause

cd /D "E:\MinGW\bin\"
REM path %jsbeutify_folder%;%PATH%

SET input=cookiepopupblocker.user.js
REM SET output=cookiepopupblocker.user.js
REM SET output=cookiepopupblocker-no_logs.user.js
SET output=cookiepopupblocker-logs.user.js
gcc -E -P -C -w -x c  "%project_folder%\%input%" -o "%project_folder%\build\%output%" || pause