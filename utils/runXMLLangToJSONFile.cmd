@echo off
java XMLLangToJSON "../www/lang/strings.xml" "../www/lang/strings-pt.xml" > ..\www\lang\pt.json

IF %ERRORLEVEL% EQU 1 pause
