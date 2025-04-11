export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN");
}

export function formatDateTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${formatDate(date)} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export function formatMoney(amount) {
  if (amount === null || amount === undefined) return "";
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}

export function formatPercent(value) {
  if (value === null || value === undefined) return "";
  return `${(value * 100).toFixed(1)}%`;
}
