@echo off

SET project_folder=%~dp0

IF NOT EXIST "%project_folder%\build\" MD "%project_folder%\build" || pause
IF NOT EXIST "%project_folder%\logs\" MD "%project_folder%\logs" || pause

cd /D "E:\MinGW\bin\"

SET define=MAKE_LOGS=0
SET input=cookiepopupblocker.user.js
SET output=cookiepopupblocker-no_logs.user.js
gcc -E -P -C -w -x c  "%project_folder%\%input%" -o "%project_folder%\build\%output%" -D %define% || pause

SET define=MAKE_LOGS=1
SET input=cookiepopupblocker.user.js
SET output=cookiepopupblocker-logs.user.js
gcc -E -P -C -w -x c  "%project_folder%\%input%" -o "%project_folder%\build\%output%" -D %define%  || pause