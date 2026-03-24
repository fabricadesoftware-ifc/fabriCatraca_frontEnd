# IDBio USB Agent (Cliente)

Este agente roda localmente no Windows do usuario e conversa com o leitor USB via `idbio-sdk`.

## Requisitos

- Windows
- Python 3.10+
- Pacote `idbio-sdk` instalado no Python local

## Executar manualmente

```powershell
python idbio_usb_agent.py
```

Ao iniciar, o agente utiliza porta fixa `45000` (host `127.0.0.1`) e persiste em:

- `%APPDATA%/FabriCatraca/idbio-agent/config.json`

## Instalar para iniciar com o Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\install_startup.ps1
```

Se aparecer `ERRO: Acesso negado.` durante criacao da tarefa:

- execute o PowerShell como Administrador e rode novamente; ou
- remova tarefa antiga com permissao elevada:

```powershell
schtasks /Delete /TN "FabriCatraca-IDBio-Agent" /F
```

Opcional com python explicito:

```powershell
powershell -ExecutionPolicy Bypass -File .\install_startup.ps1 -PythonExe "C:\Python313\python.exe"
```

## Endpoints locais

- `GET http://127.0.0.1:45000/health`
- `GET /device-info`
- `POST /capture-template`

## Desinstalar inicializacao automatica

```powershell
schtasks /Delete /TN "FabriCatraca-IDBio-Agent" /F
```
