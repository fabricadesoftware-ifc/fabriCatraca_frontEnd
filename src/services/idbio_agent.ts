type AgentResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export type AgentCaptureData = {
  template: string;
  quality: number;
  width: number;
  height: number;
  image_base64: string;
};

type AgentHealth = {
  status: string;
  port?: number;
  host?: string;
};

const explicitAgentBaseUrl = (import.meta.env.VITE_IDBIO_AGENT_URL as string | undefined)?.replace(
  /\/$/,
  "",
);
const defaultAgentBaseUrl = "http://127.0.0.1:45000";

async function fetchHealth(baseUrl: string): Promise<AgentHealth | null> {
  try {
    const response = await fetch(`${baseUrl}/health`, { method: "GET" });
    if (!response.ok) return null;
    const payload = await parseJson<AgentHealth>(response);
    if (!payload.ok || !payload.data) return null;
    return payload.data;
  } catch {
    return null;
  }
}

async function resolveAgentBaseUrl(): Promise<string> {
  if (explicitAgentBaseUrl) {
    return explicitAgentBaseUrl;
  }

  const health = await fetchHealth(defaultAgentBaseUrl);
  if (health?.status === "ok") return defaultAgentBaseUrl;

  throw new Error("Agente USB indisponível em http://127.0.0.1:45000.");
}

async function parseJson<T>(response: Response): Promise<AgentResponse<T>> {
  const payload = (await response.json()) as AgentResponse<T>;
  return payload;
}

class IdBioAgentService {
  async healthCheck() {
    const baseUrl = await resolveAgentBaseUrl();
    const response = await fetch(`${baseUrl}/health`, { method: "GET" });
    const payload = await parseJson<AgentHealth>(response);
    if (!response.ok || !payload.ok || !payload.data)
      throw new Error(payload.error || "Agente USB indisponível");
    return payload.data;
  }

  async captureTemplate(): Promise<AgentCaptureData> {
    const baseUrl = await resolveAgentBaseUrl();
    const response = await fetch(`${baseUrl}/capture-template`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    const payload = await parseJson<AgentCaptureData>(response);
    if (!response.ok || !payload.ok || !payload.data) {
      throw new Error(payload.error || "Falha ao capturar template no agente USB");
    }

    return payload.data;
  }
}

export default new IdBioAgentService();
