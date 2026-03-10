export interface FormatApiDateTimeOptions {
  includeSeconds?: boolean;
}

export function formatApiDateTime(dateTime: string, options: FormatApiDateTimeOptions = {}) {
  if (!dateTime) return "-";

  const { includeSeconds = true } = options;
  const match = dateTime.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/);

  if (match) {
    const [, year, month, day, hour, minute, second = "00"] = match;
    const time = includeSeconds ? `${hour}:${minute}:${second}` : `${hour}:${minute}`;

    return `${day}/${month}/${year}, ${time}`;
  }

  const parsedDate = new Date(dateTime);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateTime;
  }

  return parsedDate.toLocaleString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(includeSeconds ? { second: "2-digit" as const } : {}),
  });
}
