import type {
  EasySetupAsyncResponse,
  EasySetupDevice,
  EasySetupHistoryEntry,
  EasySetupStatusDevice,
  EasySetupStatusResponse,
} from "@/types";
import { defineStore } from "pinia";
import { ref } from "vue";
import { EasySetupService } from "@/services";

const POLL_INTERVAL = 3000;

export const useEasySetupStore = defineStore("easySetup", () => {
  const devices = ref<EasySetupDevice[]>([]);
  const loading = ref(false);
  const executing = ref(false);
  const error = ref<string | null>(null);

  // Async task state
  const taskId = ref<string | null>(null);
  const taskResponse = ref<EasySetupAsyncResponse | null>(null);
  const statusResponse = ref<EasySetupStatusResponse | null>(null);
  const statusDevices = ref<EasySetupStatusDevice[]>([]);
  const overallStatus = ref<string | null>(null);
  const completedCount = ref(0);
  const totalCount = ref(0);

  // History
  const history = ref<EasySetupHistoryEntry[]>([]);
  const loadingHistory = ref(false);

  // Polling control
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const loadDevices = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await EasySetupService.getDevices();
      devices.value = data.devices;
    } catch (err: any) {
      error.value = err?.response?.data?.error || "Erro ao carregar dispositivos";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const executeSetup = async (deviceIds: number[]) => {
    executing.value = true;
    error.value = null;
    taskId.value = null;
    taskResponse.value = null;
    statusResponse.value = null;
    statusDevices.value = [];
    overallStatus.value = null;
    completedCount.value = 0;
    totalCount.value = 0;
    try {
      const data = await EasySetupService.executeSetup(deviceIds);
      taskResponse.value = data;
      taskId.value = data.task_id;
      totalCount.value = data.device_ids.length;
      overallStatus.value = "pending";

      // Inicializar status dos devices como pending
      statusDevices.value = data.device_ids.map((id) => {
        const dev = devices.value.find((d) => d.id === id);
        return {
          device_name: dev?.name || `Device ${id}`,
          status: "pending" as const,
        };
      });

      // Iniciar polling
      startPolling(data.task_id);
      return data;
    } catch (err: any) {
      error.value = err?.response?.data?.error || "Erro ao executar Easy Setup";
      executing.value = false;
      throw err;
    }
  };

  const pollStatus = async (tid: string) => {
    try {
      const data = await EasySetupService.getStatus(tid);
      statusResponse.value = data;
      statusDevices.value = data.devices;
      overallStatus.value = data.overall_status;
      completedCount.value = data.completed;
      totalCount.value = data.total;

      // Se terminou, parar polling
      if (["success", "partial", "failed"].includes(data.overall_status)) {
        stopPolling();
        executing.value = false;
      }
    } catch (err: any) {
      console.error("Erro no polling de status:", err);
      // Não parar polling por erro transitório, mas contar tentativas seria ideal
    }
  };

  const startPolling = (tid: string) => {
    stopPolling();
    pollTimer = setInterval(() => pollStatus(tid), POLL_INTERVAL);
    // Primeira chamada imediata após 1s (dá tempo do backend processar)
    setTimeout(() => pollStatus(tid), 1000);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const loadHistory = async (limit = 10) => {
    loadingHistory.value = true;
    error.value = null;
    try {
      const data = await EasySetupService.getHistory(limit);
      const rawResults = Array.isArray((data as any).results)
        ? (data as any).results
        : Array.isArray((data as any).executions)
          ? (data as any).executions
          : [];

      history.value = rawResults.map((entry: any) => ({
        task_id: entry.task_id,
        status: entry.status ?? entry.overall_status ?? "pending",
        device_count: entry.device_count ?? entry.total_devices ?? 0,
        started_at: entry.started_at,
        finished_at: entry.finished_at ?? null,
      }));
    } catch (err: any) {
      console.error("Erro ao carregar histórico:", err);
      error.value = err?.response?.data?.error || "Erro ao carregar histórico do Easy Setup";
      history.value = [];
    } finally {
      loadingHistory.value = false;
    }
  };

  const reset = () => {
    stopPolling();
    devices.value = [];
    error.value = null;
    loading.value = false;
    executing.value = false;
    taskId.value = null;
    taskResponse.value = null;
    statusResponse.value = null;
    statusDevices.value = [];
    overallStatus.value = null;
    completedCount.value = 0;
    totalCount.value = 0;
  };

  return {
    devices,
    loading,
    executing,
    error,
    taskId,
    taskResponse,
    statusResponse,
    statusDevices,
    overallStatus,
    completedCount,
    totalCount,
    history,
    loadingHistory,
    loadDevices,
    executeSetup,
    pollStatus,
    stopPolling,
    loadHistory,
    reset,
  };
});
