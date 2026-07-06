param(
    [string]$Root = "github_assets\objects",
    [int]$MaxDimension = 600,
    [int]$TargetBytes = 1000000,
    [int]$MinDimension = 300,
    [int]$Quality = 90,
    [int]$MinQuality = 70,
    [switch]$Backup
)

Add-Type -AssemblyName System.Drawing

$resolvedRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\$Root"))
if (-not (Test-Path -LiteralPath $resolvedRoot)) {
    throw "Image root not found: $resolvedRoot"
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }

$backupRoot = $null
if ($Backup) {
    $backupRoot = Join-Path $resolvedRoot ("_originals_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
    New-Item -ItemType Directory -Force -Path $backupRoot | Out-Null
}

function Save-ResizedJpeg {
    param(
        [Parameter(Mandatory=$true)][string]$SourcePath,
        [Parameter(Mandatory=$true)][string]$DestinationPath,
        [Parameter(Mandatory=$true)][int]$DimensionLimit,
        [Parameter(Mandatory=$true)][int]$JpegQuality
    )

    $source = [System.Drawing.Image]::FromFile($SourcePath)
    try {
        $scale = [Math]::Min(1.0, $DimensionLimit / [Math]::Max($source.Width, $source.Height))
        $width = [Math]::Max(1, [int][Math]::Round($source.Width * $scale))
        $height = [Math]::Max(1, [int][Math]::Round($source.Height * $scale))

        $bitmap = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        try {
            $bitmap.SetResolution($source.HorizontalResolution, $source.VerticalResolution)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::White)
                $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $graphics.DrawImage($source, 0, 0, $width, $height)
            }
            finally {
                $graphics.Dispose()
            }

            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
                [System.Drawing.Imaging.Encoder]::Quality,
                [int64]$JpegQuality
            )
            $bitmap.Save($DestinationPath, $jpegCodec, $encoderParams)
        }
        finally {
            $bitmap.Dispose()
        }
    }
    finally {
        $source.Dispose()
    }
}

$images = Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File |
    Where-Object {
        $_.Extension -match "^\.(png|jpe?g)$" -and
        $_.FullName -notlike (Join-Path $resolvedRoot "_originals_*")
    }

foreach ($image in $images) {
    $relativePath = $image.FullName.Substring($resolvedRoot.Length).TrimStart("\")
    $outputPath = [System.IO.Path]::ChangeExtension($image.FullName, ".jpg")
    $originalBytes = $image.Length

    if ($Backup) {
        $backupPath = Join-Path $backupRoot $relativePath
        New-Item -ItemType Directory -Force -Path (Split-Path $backupPath -Parent) | Out-Null
        Copy-Item -LiteralPath $image.FullName -Destination $backupPath
    }

    $tempPath = [System.IO.Path]::GetTempFileName()
    $dimension = $MaxDimension
    $qualityForFile = $Quality

    try {
        do {
            Save-ResizedJpeg `
                -SourcePath $image.FullName `
                -DestinationPath $tempPath `
                -DimensionLimit $dimension `
                -JpegQuality $qualityForFile

            $newBytes = (Get-Item -LiteralPath $tempPath).Length
            if ($newBytes -le $TargetBytes) {
                break
            }
            if ($qualityForFile -gt $MinQuality) {
                $qualityForFile = [Math]::Max($MinQuality, $qualityForFile - 5)
            }
            elseif ($dimension -gt $MinDimension) {
                $dimension = [Math]::Max($MinDimension, [int][Math]::Floor($dimension * 0.9))
            }
            else {
                break
            }
        } while ($true)

        Move-Item -LiteralPath $tempPath -Destination $outputPath -Force
        if ($image.Extension -ieq ".png") {
            Remove-Item -LiteralPath $image.FullName -Force
        }
    }
    finally {
        if (Test-Path -LiteralPath $tempPath) {
            Remove-Item -LiteralPath $tempPath -Force
        }
    }

    [PSCustomObject]@{
        File = [System.IO.Path]::ChangeExtension($relativePath, ".jpg")
        OldKB = [Math]::Round($originalBytes / 1KB, 1)
        NewKB = [Math]::Round((Get-Item -LiteralPath $outputPath).Length / 1KB, 1)
        MaxDimension = $dimension
        Quality = $qualityForFile
    }
}
