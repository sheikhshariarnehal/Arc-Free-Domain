@echo off
title PowerDNS SSH Tunnel for ARC.BD Local Dev
echo ========================================================
echo   Connecting SSH Tunnel to PowerDNS on VPS (98.84.25.233)
echo   Local Port: 8081 -^> Remote VPS Port: 8081
echo ========================================================
echo.
echo Press Ctrl+C anytime to close the tunnel.
echo.
ssh -i "%~dp0..\vps_id_rsa" -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -N -L 8081:127.0.0.1:8081 ubuntu@98.84.25.233
pause
