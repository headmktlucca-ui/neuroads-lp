param(
  [string]$OutputFile = "deploy-hostinger.zip"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$distDir = Join-Path $root "dist"

if (!(Test-Path $distDir)) {
  New-Item -ItemType Directory -Path $distDir | Out-Null
}

$outputPath = Join-Path $distDir $OutputFile
if (Test-Path $outputPath) {
  Remove-Item -LiteralPath $outputPath -Force
}

$excludeDirPrefixes = @(
  ".git\",
  ".claire\",
  ".claude\",
  ".next\",
  "node_modules\",
  ".agent\",
  ".firebase\",
  ".superpowers\",
  ".vscode\",
  "dist\",
  "logs\",
  "docs\",
  "my-video\",
  "temp-app\"
)

$excludeFileNames = @(
  ".env.local"
)

$excludePatterns = @(
  "server.pid",
  "*.tsbuildinfo",
  "*.log",
  "*.tmp",
  "tmp_*",
  "*.zip",
  "*.rar",
  "*.tar",
  "*.gz"
)

Write-Host "Preparing deploy package from: $root"

$allFiles = Get-ChildItem -Path $root -Recurse -File

$filtered = $allFiles | Where-Object {
  $relative = $_.FullName.Substring($root.Length).TrimStart('\')

  foreach ($prefix in $excludeDirPrefixes) {
    if ($relative.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $false
    }
  }

  foreach ($name in $excludeFileNames) {
    if ($_.Name.Equals($name, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $false
    }
  }

  foreach ($pattern in $excludePatterns) {
    if ($_.Name -like $pattern) {
      return $false
    }
  }

  return $true
}

if ($filtered.Count -eq 0) {
  throw "No files selected for zip package."
}

$zip = [System.IO.Compression.ZipFile]::Open($outputPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $filtered) {
    $relative = $file.FullName.Substring($root.Length).TrimStart('\')
    $entryPath = $relative -replace '\\', '/'
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryPath, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
} finally {
  $zip.Dispose()
}

$sizeMB = [math]::Round((Get-Item $outputPath).Length / 1MB, 2)
Write-Host "Done: $outputPath ($sizeMB MB)"
