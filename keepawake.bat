@echo off
:loop
echo Keeping system awake... %time%
timeout /t 60 /nobreak >nul
goto loop
