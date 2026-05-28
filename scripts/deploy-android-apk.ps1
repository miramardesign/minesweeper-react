$ErrorActionPreference = "Stop"

$apkPath = Join-Path $PSScriptRoot "..\android\app\build\outputs\apk\debug\app-debug.apk"
$resolvedApkPath = Resolve-Path $apkPath -ErrorAction SilentlyContinue

if (-not $resolvedApkPath) {
  Write-Error "Debug APK not found at $apkPath. Run 'npm run android:debug' first."
  exit 1
}

$device = adb devices |
  Select-Object -Skip 1 |
  Where-Object { $_ -match "\sdevice$" } |
  ForEach-Object { ($_ -split "\s+")[0] } |
  Select-Object -First 1

if (-not $device) {
  Write-Error "No connected Android device found. Connect a device and make sure 'adb devices' shows it as 'device'."
  exit 1
}

Write-Host "Installing existing APK on Android device: $device"
adb -s $device install -r $resolvedApkPath

Write-Host "Launching app"
adb -s $device shell monkey -p com.mhazz.minesweeperreact 1
