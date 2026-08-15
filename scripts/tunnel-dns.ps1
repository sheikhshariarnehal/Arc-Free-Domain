# PowerDNS SSH Tunnel for ARC.BD Local Dev
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$keyPath = Join-Path $scriptDir "..\vps_id_rsa"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host " Connecting SSH Tunnel to PowerDNS on VPS (98.84.25.233)" -ForegroundColor Green
Write-Host " Local Port: 8081 -> Remote VPS Port: 8081" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C anytime to stop.`n"

ssh -i "$keyPath" -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -N -L 8081:127.0.0.1:8081 ubuntu@98.84.25.233
