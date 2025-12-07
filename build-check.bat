@echo off
echo Starting build...
npm run build > build-log.txt 2>&1
echo Build completed. Exit code: %ERRORLEVEL%
type build-log.txt
