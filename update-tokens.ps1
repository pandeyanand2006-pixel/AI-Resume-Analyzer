$files = @(
    "frontend/src/components/ui/Select.css",
    "frontend/src/components/ui/Textarea.css",
    "frontend/src/components/ui/Card.css"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    $content = $content -replace '--color-error','--error'
    $content = $content -replace '--color-primary','--primary'
    $content = $content -replace '--color-gray-300','--border-hover'
    $content = $content -replace '--color-gray-200','--border'
    $content = $content -replace '--surface-elevated','--surface'
    $content = $content -replace '--border-color','--border'
    $content = $content -replace '--bg-secondary','--surface-soft'
    $content = $content -replace '--color-primary-100','--primary-soft'
    $content = $content -replace '--color-primary-50','--primary-soft'
    $content = $content -replace '--color-primary-300','--primary'
    $content = $content -replace '--color-error-100','--error-soft'
    $content = $content -replace '--color-error-50','--error-soft'
    $content = $content -replace '--color-ai-200','--info'
    $content = $content -replace '--color-ai-50','--info-soft'
    $content = $content -replace '--color-ai','--info'
    $content = $content -replace ', box-shadow: var\(--shadow-xs\);',';'
    $content = $content -replace 'box-shadow: var\(--shadow-xs\);',''
    Set-Content -Path $file -Value $content -NoNewline
}

Write-Host "Updated design tokens in $($files.Count) files"
