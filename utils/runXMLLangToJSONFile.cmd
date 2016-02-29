@echo off
REM java XMLLangToJSON "../www/lang/strings.xml" "../www/lang/strings-pt.xml" > ..\www\lang\pt.json
java XMLLangToJSON "../www/lang/strings.xml" "../www/lang/strings-pt.xml" > ..\www\js\localization.js

IF %ERRORLEVEL% EQU 1 pause
