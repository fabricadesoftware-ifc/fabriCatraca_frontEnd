param(
  [string]$PythonExe = "python",
  [string]$AgentScriptPath = "$PSScriptRoot\idbio_usb_agent.py"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $AgentScriptPath)) {
  throw "Arquivo do agente não encontrado: $AgentScriptPath"
}

$pythonCommand = Get-Command $PythonExe -ErrorAction SilentlyContinue
if (-not $pythonCommand) {
  throw "Python não encontrado no PATH. Informe -PythonExe com caminho completo."
}

$pythonPath = $pythonCommand.Source
$taskName = "FabriCatraca-IDBio-Agent"
$taskCmd = ('"{0}" "{1}"' -f $pythonPath, $AgentScriptPath)
$currentUser = "$env:USERDOMAIN\$env:USERNAME"

Write-Host "Registrando tarefa de inicializacao para o usuario: $currentUser"
schtasks /Create /TN $taskName /SC ONLOGON /RL LIMITED /RU $currentUser /TR $taskCmd /F | Out-Null
if ($LASTEXITCODE -ne 0) {
  throw "Falha ao criar tarefa agendada ($taskName). Execute o PowerShell como administrador ou remova tarefa existente com permissao elevada."
}

Write-Host "Tarefa agendada criada: $taskName"
Write-Host "Iniciando agente agora..."
Start-Process -FilePath $pythonPath -ArgumentList @($AgentScriptPath) -WindowStyle Hidden

$healthUrl = "http://127.0.0.1:45000/health"
$maxTries = 12
$started = $false

for ($i = 0; $i -lt $maxTries; $i++) {
  Start-Sleep -Milliseconds 500
  try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 2
    if ($response.ok -eq $true) {
      $started = $true
      break
    }
  } catch {
    # aguarda subida do processo
  }
}

if ($started) {
  Write-Host "Agente iniciado em background e respondendo em $healthUrl"
} else {
  Write-Warning "A tarefa foi registrada, mas o agente nao respondeu em $healthUrl."
  Write-Warning "Verifique se o Python usado tem o pacote idbio-sdk instalado."
}
