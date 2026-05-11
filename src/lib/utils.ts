export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.7) return "text-emerald-400";
  if (confidence >= 0.5) return "text-yellow-400";
  return "text-red-400";
}

export function getConfidenceBg(confidence: number): string {
  if (confidence >= 0.7) return "bg-emerald-500/20 border-emerald-500/30";
  if (confidence >= 0.5) return "bg-yellow-500/20 border-yellow-500/30";
  return "bg-red-500/20 border-red-500/30";
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return "Cok Yuksek";
  if (confidence >= 0.65) return "Yuksek";
  if (confidence >= 0.5) return "Orta";
  if (confidence >= 0.35) return "Dusuk";
  return "Cok Dusuk";
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "live":
      return "CANLI";
    case "halftime":
      return "DEVRE ARASI";
    case "finished":
      return "BITTI";
    case "scheduled":
      return "PLANLI";
    case "postponed":
      return "ERTELENDI";
    default:
      return status.toUpperCase();
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "live":
      return "bg-red-500 text-white";
    case "halftime":
      return "bg-yellow-500 text-black";
    case "finished":
      return "bg-gray-600 text-gray-200";
    case "scheduled":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-500 text-white";
  }
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getFormColor(result: "W" | "D" | "L"): string {
  switch (result) {
    case "W":
      return "bg-emerald-500";
    case "D":
      return "bg-yellow-500";
    case "L":
      return "bg-red-500";
  }
}
