param(
  [string]$Environment = "preview",
  [string]$EnvFile = ".env.local",
  [string]$Visibility = "sensitive"
)

$ErrorActionPreference = "Stop"

$requiredVariables = @(
  "EXPO_PUBLIC_FIREBASE_API_KEY",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "EXPO_PUBLIC_FIREBASE_APP_ID",
  "EXPO_PUBLIC_OPENAI_API_KEY",
  "EXPO_PUBLIC_OPENAI_VISION_MODEL"
)

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "Could not find $EnvFile. Create it from .env.example first."
}

$envValues = @{}
Get-Content -LiteralPath $EnvFile | ForEach-Object {
  $line = $_.Trim()

  if (-not $line -or $line.StartsWith("#")) {
    return
  }

  $separatorIndex = $line.IndexOf("=")
  if ($separatorIndex -lt 1) {
    return
  }

  $name = $line.Substring(0, $separatorIndex).Trim()
  $value = $line.Substring($separatorIndex + 1).Trim().Trim('"').Trim("'")
  $envValues[$name] = $value
}

$missingVariables = $requiredVariables | Where-Object {
  -not $envValues.ContainsKey($_) -or [string]::IsNullOrWhiteSpace($envValues[$_])
}

if ($missingVariables.Count -gt 0) {
  throw "Missing required values in ${EnvFile}: $($missingVariables -join ', ')"
}

$npxCandidates = @(
  "C:\nvm4w\nodejs\npx.cmd",
  "npx.cmd",
  "npx"
)

$npxCommand = $npxCandidates | Where-Object {
  if ($_ -like "*\*") {
    Test-Path -LiteralPath $_
  } else {
    $null -ne (Get-Command $_ -ErrorAction SilentlyContinue)
  }
} | Select-Object -First 1

if (-not $npxCommand) {
  throw "Could not find npx. Install Node.js or update the npx path in this script."
}

Write-Host "Syncing EAS environment variables to '$Environment'..."

foreach ($name in $requiredVariables) {
  Write-Host "Creating $name..."

  & $npxCommand eas-cli@latest env:create `
    --environment $Environment `
    --name $name `
    --value $envValues[$name] `
    --visibility $Visibility `
    --non-interactive

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to create $name. If it already exists, delete or update it in the Expo dashboard, then rerun this script."
  }
}

Write-Host "Done. Rebuild with:"
Write-Host "$npxCommand eas-cli@latest build --platform android --profile preview --clear-cache"
