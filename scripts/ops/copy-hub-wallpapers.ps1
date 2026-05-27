$artifactDir = "C:\Users\claud\.gemini\antigravity-ide\brain\64f1b5e1-f9c4-46a4-a8fb-2abd63083d01"
$publicDir = "C:\Users\claud\OneDrive\Documentos\NeuroAds\LP\public\images"

$files = @(
    @{ Src = "hub_dark_wallpaper_v1_1779905367533.png"; Dst = "background_hub_dark_v1.png" },
    @{ Src = "hub_dark_wallpaper_v2_1779905380349.png"; Dst = "background_hub_dark_v2.png" },
    @{ Src = "hub_dark_wallpaper_v3_1779905394988.png"; Dst = "background_hub_dark_v3.png" }
)

foreach ($file in $files) {
    $src = Join-Path $artifactDir $file.Src
    $dst = Join-Path $publicDir $file.Dst
    if (Test-Path $src) {
        Copy-Item $src $dst -Force
        Write-Host "✅ Copiado: $($file.Dst)"
    } else {
        Write-Warning "❌ Arquivo não encontrado: $src"
    }
}

Write-Host "`n🎨 Wallpapers Dark Hub copiados para public/images/"
