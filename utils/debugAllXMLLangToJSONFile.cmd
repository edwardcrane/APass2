REM @echo off
"c:\Program Files\Java\jdk1.8.0_65\bin\jdb.exe" XMLLangToJSON "../www/lang/strings.xml" "../www/lang/strings-pt.xml" "../www/lang/strings-fr.xml"

IF %ERRORLEVEL% EQU 1 pause
