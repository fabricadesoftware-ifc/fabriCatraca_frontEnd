import axios from "axios";

const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const IFC_SCHEDULES_URL =
  import.meta.env.VITE_IFC_SCHEDULES_PROXY_URL ||
  `${apiUrl}/control_id_monitor/ifc-schedules/source`;

export interface IfcScheduleRow {
  label: string;
  cells: string[];
}

export interface IfcGroupSchedule {
  groupName: string;
  days: string[];
  rows: IfcScheduleRow[];
}

interface PendingSpanCell {
  remaining: number;
  value: string;
}

function normalizeGroupName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function decodeCellHtml(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html.replace(/<br\s*\/?>/gi, "\n");

  return (container.textContent || "")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function parseScheduleTable(table: Element): IfcGroupSchedule | null {
  const groupName = table.querySelector("caption .name")?.textContent?.trim();
  const dayHeaders = Array.from(table.querySelectorAll("thead th.xAxis")).map((header) =>
    header.textContent?.trim() || "",
  );

  if (!groupName || dayHeaders.length === 0) {
    return null;
  }

  const pendingSpans: Array<PendingSpanCell | null> = Array.from({ length: dayHeaders.length }, () => null);
  const rows: IfcScheduleRow[] = [];
  const bodyRows = Array.from(table.querySelectorAll("tbody tr")).filter(
    (row) => !row.classList.contains("foot"),
  );

  for (const row of bodyRows) {
    const label = row.querySelector("th.yAxis")?.textContent?.trim();
    if (!label) {
      continue;
    }

    const dataCells = Array.from(row.children).filter((child) => child.tagName === "TD");
    const cells: string[] = [];
    let tdIndex = 0;

    for (let dayIndex = 0; dayIndex < dayHeaders.length; dayIndex += 1) {
      const pendingCell = pendingSpans[dayIndex];
      if (pendingCell) {
        cells.push(pendingCell.value);
        pendingCell.remaining -= 1;
        if (pendingCell.remaining <= 0) {
          pendingSpans[dayIndex] = null;
        }
        continue;
      }

      const td = dataCells[tdIndex];
      tdIndex += 1;

      if (!td) {
        cells.push("");
        continue;
      }

      const value = decodeCellHtml(td.innerHTML);
      const rowspan = Number.parseInt(td.getAttribute("rowspan") || "1", 10);
      if (rowspan > 1) {
        pendingSpans[dayIndex] = {
          remaining: rowspan - 1,
          value,
        };
      }

      cells.push(value);
    }

    rows.push({ label, cells });
  }

  return {
    groupName,
    days: dayHeaders,
    rows,
  };
}

class IfcSchedulesService {
  private cache: Promise<IfcGroupSchedule[]> | null = null;

  private async loadAllSchedules(): Promise<IfcGroupSchedule[]> {
    if (!this.cache) {
      this.cache = this.fetchAllSchedules();
    }

    return this.cache;
  }

  private async fetchAllSchedules(): Promise<IfcGroupSchedule[]> {
    const response = await axios.get(IFC_SCHEDULES_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });


    const html = response.data
    if (html.includes('<div id="app"></div>')) {
      throw new Error("A origem dos horarios retornou a pagina da aplicacao em vez do HTML do IFC.");
    }
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(html, "text/html");

    return Array.from(documentNode.querySelectorAll('table[id^="table_"]'))
      .map((table) => parseScheduleTable(table))
      .filter((schedule): schedule is IfcGroupSchedule => schedule !== null);
  }

  async getSchedulesByGroupNames(groupNames: string[]): Promise<IfcGroupSchedule[]> {
    const normalizedNames = groupNames.map(normalizeGroupName).filter(Boolean);

    if (normalizedNames.length === 0) {
      return [];
    }

    const schedules = await this.loadAllSchedules();

    return normalizedNames
      .map((normalizedName) => {
        const exactMatch = schedules.find(
          (schedule) => normalizeGroupName(schedule.groupName) === normalizedName,
        );

        if (exactMatch) {
          return exactMatch;
        }

        return schedules.find((schedule) => {
          const normalizedScheduleName = normalizeGroupName(schedule.groupName);
          return (
            normalizedScheduleName.includes(normalizedName) ||
            normalizedName.includes(normalizedScheduleName)
          );
        });
      })
      .filter((schedule): schedule is IfcGroupSchedule => schedule !== undefined);
  }

  clearCache(): void {
    this.cache = null;
  }
}

export default new IfcSchedulesService();
