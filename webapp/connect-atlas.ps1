# لوکل: Atlas سے جوڑیں — connection string یہاں پیسٹ کریں اور چلائیں
# Usage: .\connect-atlas.ps1 "mongodb+srv://user:pass@cluster.../ask_real_estate?retryWrites=true&w=majority"

param(
  [Parameter(Mandatory = $true)]
  [string]$MongoUri
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$server = Join-Path $root "server"
$envFile = Join-Path $server ".env"

$jwt = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 48 | ForEach-Object { [char]$_ })

@"
PORT=5000
MONGODB_URI=$MongoUri
JWT_SECRET=$jwt
CLIENT_URL=http://localhost:5000
ADMIN_EMAIL=abdulsamadkhattak5@gmail.com
ADMIN_PASSWORD=AskAdmin@$(Get-Random -Maximum 9999)
ADMIN_NAME=حافظ عبدالصمد خٹک
ADMIN_PHONE=03215315603
"@ | Set-Content -Path $envFile -Encoding UTF8

Write-Host "Wrote $envFile"
Write-Host "Building React client..."
Set-Location (Join-Path $root "client")
npm run build
Write-Host "Seeding Atlas from Properties.csv..."
Set-Location $server
npm run seed
Write-Host "Starting server at http://localhost:5000/"
npm start
