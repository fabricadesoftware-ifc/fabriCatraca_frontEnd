from __future__ import annotations

import argparse
import atexit
import base64
import json
import os
import platform
import threading
from dataclasses import dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

CONFIG_DIR = (
    Path(os.getenv("APPDATA", str(Path.home()))) / "FabriCatraca" / "idbio-agent"
)
CONFIG_FILE = CONFIG_DIR / "config.json"
DEFAULT_PORT = 45000


class IDBioAgentError(Exception):
    pass


@dataclass
class AgentConfig:
    host: str
    port: int
    dll_path: str | None = None


class IDBioAgentService:
    def __init__(self, dll_path: str | None = None) -> None:
        self._dll_path = dll_path
        self._lock = threading.Lock()

    def _new_sdk(self):
        if platform.system() != "Windows":
            raise IDBioAgentError("IDBio USB Agent suporta apenas Windows.")

        try:
            from idbio_sdk import CIDBio
        except ImportError as exc:
            raise IDBioAgentError(
                "Pacote idbio-sdk não encontrado. Instale no ambiente do agente local."
            ) from exc

        try:
            return CIDBio(dll_path=self._dll_path)
        except OSError as exc:
            raise IDBioAgentError(
                "Falha ao carregar libcidbio.dll. Verifique configuração da DLL e arquitetura."
            ) from exc

    @staticmethod
    def _is_success(ret: Any) -> bool:
        try:
            return int(ret) >= 0
        except Exception:
            return False

    def _run(self, operation):
        with self._lock:
            sdk = self._new_sdk()
            init_code = sdk.init()
            if not self._is_success(init_code):
                raise IDBioAgentError(
                    sdk.get_error_message(init_code)
                    or f"Init failed ({int(init_code)})"
                )
            try:
                return operation(sdk)
            finally:
                sdk.terminate()

    def health(self) -> dict[str, Any]:
        return {"status": "ok", "platform": platform.system()}

    def device_info(self) -> dict[str, Any]:
        def operation(sdk):
            ret, version, serial, model = sdk.get_device_info()
            if not self._is_success(ret):
                raise IDBioAgentError(
                    sdk.get_error_message(ret) or f"GetDeviceInfo failed ({int(ret)})"
                )
            return {"model": model, "serial": serial, "firmware": version}

        return self._run(operation)

    def capture_template(self) -> dict[str, Any]:
        def operation(sdk):
            ret, template, image, width, height, quality = (
                sdk.capture_image_and_template()
            )
            if not self._is_success(ret):
                raise IDBioAgentError(
                    sdk.get_error_message(ret) or f"Capture failed ({int(ret)})"
                )
            if not template:
                raise IDBioAgentError("Dispositivo não retornou template biométrico.")

            return {
                "template": template,
                "quality": quality,
                "width": width,
                "height": height,
                "image_base64": base64.b64encode(image).decode("ascii")
                if image
                else "",
            }

        return self._run(operation)


def load_or_create_config(host: str, port: int, dll_path: str | None) -> AgentConfig:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    if CONFIG_FILE.exists():
        data = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        stored_host = str(data.get("host", host))

        config = AgentConfig(
            host=stored_host,
            port=port,
            dll_path=dll_path if dll_path is not None else data.get("dll_path"),
        )
    else:
        config = AgentConfig(
            host=host,
            port=port,
            dll_path=dll_path,
        )

    CONFIG_FILE.write_text(
        json.dumps(
            {
                "host": config.host,
                "port": config.port,
                "dll_path": config.dll_path,
            },
            ensure_ascii=True,
            indent=2,
        ),
        encoding="utf-8",
    )
    return config


class AgentHandler(BaseHTTPRequestHandler):
    service: IDBioAgentService
    config: AgentConfig

    def log_message(self, format: str, *args):
        return

    def _write_json(self, status_code: int, payload: dict[str, Any]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._write_json(200, {"ok": True})

    def do_GET(self):
        try:
            if self.path == "/health":
                self._write_json(
                    200,
                    {
                        "ok": True,
                        "data": {
                            **self.service.health(),
                            "port": self.config.port,
                            "host": self.config.host,
                        },
                    },
                )
                return

            if self.path == "/device-info":
                self._write_json(200, {"ok": True, "data": self.service.device_info()})
                return

            self._write_json(404, {"ok": False, "error": "Rota não encontrada"})
        except IDBioAgentError as exc:
            self._write_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write_json(500, {"ok": False, "error": str(exc)})

    def do_POST(self):
        try:
            if self.path == "/capture-template":
                self._write_json(
                    200, {"ok": True, "data": self.service.capture_template()}
                )
                return

            self._write_json(404, {"ok": False, "error": "Rota não encontrada"})
        except IDBioAgentError as exc:
            self._write_json(400, {"ok": False, "error": str(exc)})
        except Exception as exc:
            self._write_json(500, {"ok": False, "error": str(exc)})


def run_server(config: AgentConfig) -> None:
    AgentHandler.service = IDBioAgentService(dll_path=config.dll_path)
    AgentHandler.config = config
    server = ThreadingHTTPServer((config.host, config.port), AgentHandler)

    def on_exit():
        try:
            server.server_close()
        except Exception:
            pass

    atexit.register(on_exit)

    print(f"IDBio USB Agent ativo em http://{config.host}:{config.port}")
    print(f"Config: {CONFIG_FILE}")
    print("Rotas: GET /health, GET /device-info, POST /capture-template")
    server.serve_forever()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="IDBio USB Agent")
    parser.add_argument("--host", default="127.0.0.1", help="Host do agente local")
    parser.add_argument(
        "--port", type=int, default=DEFAULT_PORT, help="Porta fixa do agente local"
    )
    parser.add_argument("--dll-path", default=None, help="Caminho da libcidbio.dll")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    cfg = load_or_create_config(host=args.host, port=args.port, dll_path=args.dll_path)
    run_server(cfg)
