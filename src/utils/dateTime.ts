export function formatApiDateTimeToInput(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function formatInputDateTimeToApi(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function getCurrentLocalDateTimeInput(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export function formatDateTimeForDisplay(value?: string | null): string {
  if (!value) {
    return "Nao registrada";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Nao registrada";
  }

  return date.toLocaleString("pt-BR");
}

export function formatApiDateTime(value?: string | null): string {
  return formatDateTimeForDisplay(value);
}
