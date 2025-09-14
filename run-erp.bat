@echo off
setlocal ENABLEDELAYEDEXPANSION

echo ============================================
echo   ERP Backend Launcher (MongoDB Atlas)
echo ============================================

REM Current project root
cd /d "C:\Users\harsh\Desktop\ERP"

if not exist mvnw.cmd (
  echo Maven wrapper not found. Exiting.
  pause
  exit /b 1
)

REM Optional: clean & build (uncomment if you want a fresh build each time)
REM call mvnw.cmd -q -DskipTests clean package

REM Run Spring Boot directly (fast startup, recompiles changes if devtools on classpath)
call mvnw.cmd spring-boot:run -DskipTests

echo.
echo Server stopped.
pause
endlocal
