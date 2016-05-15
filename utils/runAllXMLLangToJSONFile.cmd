@echo off
java XMLLangToJSON "../www/lang/strings.xml" "../www/lang/strings-pt.xml" "../www/lang/strings-fr.xml" "../www/lang/strings-es.xml" > ..\www\js\localization.js

IF %ERRORLEVEL% EQU 1 pause
