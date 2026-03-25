<script setup lang="ts">
import type { IfcGroupSchedule } from "@/services/ifc_schedules";

defineProps<{
  schedulesLoading: boolean;
  schedulesError: string;
  selectedGroupNames: string[];
  groupSchedules: IfcGroupSchedule[];
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

function isSchedulePlaceholder(cell: string): boolean {
  const normalizedCell = cell.trim().toUpperCase();
  return normalizedCell === "" || normalizedCell === "---" || normalizedCell === "-X-";
}

function scheduleCellLines(cell: string): string[] {
  if (!cell) {
    return [];
  }

  return cell
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
</script>

<template>
  <v-container fluid class="pa-2">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between mb-3">
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                size="small"
                variant="text"
                @click="emit('refresh')"
              >
                Atualizar
              </v-btn>
            </div>

            <v-progress-linear v-if="schedulesLoading" color="primary" indeterminate />

            <v-alert
              v-else-if="selectedGroupNames.length === 0"
              border="start"
              type="info"
              variant="tonal"
            >
              O usuario ainda nao possui turma vinculada.
            </v-alert>

            <v-alert
              v-else-if="schedulesError"
              border="start"
              type="warning"
              variant="tonal"
            >
              {{ schedulesError }}
            </v-alert>

            <div v-else class="d-flex flex-column ga-3">
              <v-card
                v-for="schedule in groupSchedules"
                :key="schedule.groupName"
                border
                rounded="lg"
                variant="outlined"
              >
                <v-card-title class="text-subtitle-1 py-3">{{ schedule.groupName }}</v-card-title>

                <v-card-text class="pa-2">
                  <div class="schedule-table-wrapper">
                    <table class="schedule-table">
                      <thead>
                        <tr>
                          <th>Horario</th>
                          <th v-for="day in schedule.days" :key="`${schedule.groupName}-${day}`">
                            {{ day }}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr v-for="row in schedule.rows" :key="`${schedule.groupName}-${row.label}`">
                          <th>{{ row.label }}</th>
                          <td
                            v-for="(cell, cellIndex) in row.cells"
                            :key="`${schedule.groupName}-${row.label}-${cellIndex}`"
                            :class="{ 'schedule-cell-empty': isSchedulePlaceholder(cell) }"
                          >
                            <template v-if="scheduleCellLines(cell).length > 0">
                              <div
                                v-for="line in scheduleCellLines(cell)"
                                :key="`${schedule.groupName}-${row.label}-${cellIndex}-${line}`"
                              >
                                {{ line }}
                              </div>
                            </template>
                            <template v-else>---</template>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.schedule-table-wrapper {
  overflow: hidden;
}

.schedule-table {
  width: 100%;
  min-width: 880px;
  border-collapse: collapse;
  background: rgb(var(--v-theme-surface));
}

.schedule-table th,
.schedule-table td {
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 4px 6px;
  vertical-align: top;
  font-size: 0.72rem;
  line-height: 1.15;
  background: rgba(62, 62, 62, 0.92);
}

.schedule-table thead th {
  background: rgba(var(--v-theme-primary), 0.12);
  font-weight: 600;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 1;
}

.schedule-table tbody th {
  min-width: 92px;
  background: #212f3b;
  font-weight: 600;
  text-align: left;
  position: sticky;
  left: 0;
  z-index: 1;
}

.schedule-cell-empty {
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
  background: rgba(249, 250, 251, 0.98);
}

.schedule-table td div + div {
  margin-top: 2px;
}
</style>
