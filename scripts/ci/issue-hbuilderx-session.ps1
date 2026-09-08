param([Parameter(Mandatory = $true)][string]$CliPath)

$ErrorActionPreference = 'Stop'
$executable = Join-Path (Split-Path -Parent (Resolve-Path -LiteralPath $CliPath).Path) 'HBuilderX.exe'
$owned = @(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -ieq $executable })
$results = @()
foreach ($item in $owned) {
  $process = Get-Process -Id $item.ProcessId -ErrorAction SilentlyContinue
  if ($null -eq $process) { continue }
  # 只关闭本轮安装目录中的 IDE，先请求正常退出，再回收未退出的进程树。
  $requested = $process.CloseMainWindow()
  $graceful = $process.WaitForExit(15000)
  if (!$graceful) {
    & taskkill /PID $item.ProcessId /T /F | Out-Null
    if (!$process.WaitForExit(10000)) { throw "无法关闭本轮 HBuilderX：$($item.ProcessId)" }
  }
  $results += @{ pid = $item.ProcessId; executable = $executable; requested = $requested; graceful = $graceful }
}
ConvertTo-Json -InputObject $results -Depth 4
