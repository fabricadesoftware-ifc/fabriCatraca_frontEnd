import type { MonitorAlert } from "@/types";
import { defineStore } from "pinia";
import { ControlIdMonitorService } from "@/services";

export const useAlertsStore = defineStore("alerts", {
  state: () => ({
    alerts: [] as MonitorAlert[],
    unreadCount: 0,
    activeCount: 0,
    totalCount: 0,
    loading: false,
    intervalId: null as number | null,
  }),

  actions: {
    async loadAlerts(params = {}) {
      this.loading = true;
      try {
        const response = await ControlIdMonitorService.getAlerts({ page_size: 8, ...params });
        this.alerts = response?.results || [];
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    async loadSummary() {
      try {
        const summary = await ControlIdMonitorService.getAlertSummary();
        this.unreadCount = summary.unread_count || 0;
        this.activeCount = summary.active_count || 0;
        this.totalCount = summary.total_count || 0;
      } catch (error) {
        console.error(error);
      }
    },

    async refresh() {
      await Promise.all([this.loadAlerts(), this.loadSummary()]);
    },

    async markAsRead(alertId: number) {
      try {
        await ControlIdMonitorService.markAlertAsRead(alertId);
        this.alerts = this.alerts.map(alert => (
          alert.id === alertId ? { ...alert, is_read: true } : alert
        ));
        await this.loadSummary();
      } catch (error) {
        console.error(error);
      }
    },

    async markAllAsRead() {
      try {
        await ControlIdMonitorService.markAllAlertsAsRead();
        this.alerts = this.alerts.map(alert => ({ ...alert, is_read: true }));
        await this.loadSummary();
      } catch (error) {
        console.error(error);
      }
    },

    startPolling(intervalMs = 60000) {
      if (this.intervalId !== null) {
        return;
      }
      this.intervalId = window.setInterval(() => {
        void this.refresh();
      }, intervalMs);
    },

    stopPolling() {
      if (this.intervalId !== null) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    async initialize() {
      await this.refresh();
      this.startPolling();
    },
  },
});
