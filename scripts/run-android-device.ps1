$ErrorActionPreference = "Stop"

$device = adb devices |
  Select-Object -Skip 1 |
  Where-Object { $_ -match "\sdevice$" } |
  ForEach-Object { ($_ -split "\s+")[0] } |
  Select-Object -First 1

if (-not $device) {
  Write-Error "No connected Android device found. Connect a device and make sure 'adb devices' shows it as 'device'."
  exit 1
}

Write-Host "Running on Android device: $device"
npx cap run android --target $device
