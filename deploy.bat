@echo off
setlocal enabledelayedexpansion

:: Load environment variables from .env file
:: DEPLOY_HOSTNAME DEPLOY_PORT DEPLOY_USERNAME DEPLOY_PASSWORD
for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
  set "%%A=%%B"
)

echo open %DEPLOY_HOSTNAME% %DEPLOY_PORT% > ftp_commands.txt
echo user %DEPLOY_USERNAME% %DEPLOY_PASSWORD% >> ftp_commands.txt
echo binary >> ftp_commands.txt

:: Upload app.py, .env and requirements.txt to /
echo put test_app.py /app.py >> ftp_commands.txt
echo put .env /.env >> ftp_commands.txt

:: Upload templates/ folder and its contents
echo mkdir /templates >> ftp_commands.txt
for /r "templates" %%F in (*) do (
  set "file=%%~nxF"
  echo put "%%F" "/templates/!file!" >> ftp_commands.txt
)

:: Upload static/js/ folder and its contents
echo mkdir /static/js >> ftp_commands.txt
for /r "static/js" %%F in (*) do (
  set "file=%%~nxF"
  echo put "%%F" "/static/js/!file!" >> ftp_commands.txt
)

:: Upload static/css/ folder and its contents
echo mkdir /static/css >> ftp_commands.txt
for /r "static/css" %%F in (*) do (
  set "file=%%~nxF"
  echo put "%%F" "/static/css/!file!" >> ftp_commands.txt
)

:: Upload backend/ and its contents (only .py files)
echo mkdir /backend >> ftp_commands.txt
for /r "backend" %%F in (*.py) do (
  set "file=%%~nxF"
  echo put "%%F" "/backend/!file!" >> ftp_commands.txt
)

:: Upload backend/routes/ folder and its contents (only .py files)
echo mkdir /backend/routes >> ftp_commands.txt
for /r "backend/routes" %%F in (*.py) do (
  set "file=%%~nxF"
  echo put "%%F" "/backend/routes/!file!" >> ftp_commands.txt
)

:: List all files for debugging purposes
echo ls >> ftp_commands.txt

:: Logout and close the connection
echo bye >> ftp_commands.txt

:: Run FTP commands
ftp -n -s:ftp_commands.txt

:: Clean up
del ftp_commands.txt

echo Deployment completed!
