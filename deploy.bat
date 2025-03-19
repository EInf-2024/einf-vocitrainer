@echo off
setlocal enabledelayedexpansion

:: Load environment variables from .env file
for /f "tokens=1,2 delims==" %%A in (.env) do (
  set %%A=%%B
)

:: Create temporary FTP command file
echo open %DEPLOY_HOSTNAME% %DEPLOY_PORT% > ftpcmd.txt
echo user %DEPLOY_USERNAME% %DEPLOY_PASSWORD% >> ftpcmd.txt
echo binary >> ftpcmd.txt
echo cd %DEPLOY_PATH% >> ftpcmd.txt
echo prompt off >> ftpcmd.txt

:: Function to create remote directories before uploading files
for /r %%F in (*) do (
  set "filename=%%F"
  set "relpath=%%F"
  set "relpath=!relpath:%CD%\=!"

  :: Create directories on the remote server
  if not "%%~xF"=="" (
    set "dir=!relpath!"
    set "dir=!dir:\=!"
    echo mkdir !dir! >> ftpcmd.txt
  )

  :: Add file to the upload list
  echo put "%%F" >> ftpcmd.txt
)

echo quit >> ftpcmd.txt

:: Run FTP with script file
ftp -n -v -s:ftpcmd.txt

:: Cleanup
del ftpcmd.txt

echo Deployment completed!
