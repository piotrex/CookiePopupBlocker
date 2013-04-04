@echo off

SET project_folder=%~dp0
SET jsbeutify_folder=E:\Piotrek\Temp\jsbeutify

IF NOT EXIST "%project_folder%\build\" MD "%project_folder%\build" || pause
IF NOT EXIST "%project_folder%\logs\" MD "%project_folder%\logs" || pause

cd /D "E:\MinGW\bin\"
path %jsbeutify_folder%;%PATH%

SET input=cookiepopupblocker.user.js
SET output=cookiepopupblocker.user.js
gcc -E -P -C -w -x c  "%project_folder%\%input%" -o "%project_folder%\build\%output%" || pause