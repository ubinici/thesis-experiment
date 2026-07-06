param(
    [string]$Root = "github_assets\objects",
    [int]$MaxDimension = 600,
    [int]$TargetBytes = 1000000,
    [int]$MinDimension = 300,
    [switch]$Backup
)

Add-Type -AssemblyName System.Drawing

$resolvedRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\$Root"))
if (-not (Test-Path -LiteralPath $resolvedRoot)) {
    throw "Image root not found: $resolvedRoot"
}

$backupRoot = $null
if ($Backup) {
    $backupRoot = Join-Path $resolvedRoot ("_originals_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
    New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
}

function Save-ResizedPng {
    param(
        [Parameter(Mandatory=$true)][string]$SourcePath,
        [Parameter(Mandatory=$true)][string]$DestinationPath,
        [Parameter(Mandatory=$true)][int]$DimensionLimit
    )

    $source = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        $scale = [Math]::Min(1.0, $DimensionLimit / [Math]::Max($source.Width, $source.Height))
        $width = [Math]::Max(1, [int][Math]::Round($source.Width * $scale))
        $height = [Math]::Max(1, [int][Math]::Round($source.Height * $scale))

        $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $bitmap.SetResolution($source.HorizontalResolution, $source.VerticalResolution)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($source, 0, 0, $width, $height)
            }
            finally {
                $graphics.Dispose()
            }

            $bitmap.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        finally {
            $bitmap.Dispose()
        }
    }
    finally {
        $source.Dispose()
    }
}

$images = Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File -Filter "*.png" |
    Where-Object { $_.FullName -notlike (Join-Path $resolvedRoot "_originals_*") }

foreach ($image in $images) {
    $relativePath = $image.FullName.Substring($resolvedRoot.Length).TrimStart("\")
    $originalBytes = $image.Length

    if ($Backup) {
        $backupPath = Join-Path $backupRoot $relativePath
        New-Item -ItemType Directory -Force -Path (Split-Path $backupPath -Parent) | Out-Null
        Copy-Item -LiteralPath $image.FullName -Destination $backupPath
    }

    $tempPath = [System.IO.Path]::GetTempFileName()
    $dimension = $MaxDimension

    try {
        do {
            Save-ResizedPng -SourcePath $image.FullName -DestinationPath $tempPath -DimensionLimit $dimension
            $newBytes = (Get-Item -LiteralPath $tempPath).Length
            if ($newBytes -le $TargetBytes -or $dimension -le $MinDimension) {
                break
            }
            $dimension = [Math]::Max($MinDimension, [int][Math]::Floor($dimension * 0.9))
        } while ($true)

        Move-Item -LiteralPath $tempPath -Destination $image.FullName -Force
    }
    finally {
        if (Test-Path -LiteralPath $tempPath) {
            Remove-Item -LiteralPath $tempPath -Force
        }
    }

    [PSCustomObject]@{
        File = $relativePath
        OldKB = [Math]::Round($originalBytes / 1KB, 1)
        NewKB = [Math]::Round((Get-Item -LiteralPath $image.FullName).Length / 1KB, 1)
        MaxDimension = $dimension
    }
}
