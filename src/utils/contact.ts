function onlyDigits(value: string | null | undefined): string {
  return (value || "").replace(/\D/g, "");
}

export function formatCpf(value: string | null | undefined): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function isCpfValidFormat(value: string | null | undefined): boolean {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formatCpf(value));
}

export function formatPhone(value: string | null | undefined): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function isPhoneValidFormat(value: string | null | undefined): boolean {
  return /^(\(\d{2}\) \d{4}-\d{4}|\(\d{2}\) \d{5}-\d{4})$/.test(formatPhone(value));
}
