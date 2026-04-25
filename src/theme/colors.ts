const chartPalette: readonly string[] = [
  "#8fdcff",
  "#ffd166",
  "#6fe6b4",
  "#ff9486",
  "#b7a6ff",
  "#ff9cd6",
  "#66f0d2",
  "#ffb86b",
  "#7ec8ff",
  "#ffe08a",
  "#8bf0c0",
  "#ffab9f",
  "#c7bbff",
  "#ffb5e3",
  "#7ff7df",
];

export const colors = {
  background: "#075a98",
  chartPalette,
  surface: "#0d6aad",
  surfaceMuted: "#084d80",
  border: "#71b8e6",
  text: "#f7fbff",
  textMuted: "#d7e9f8",
  primary: "#9fe1ff",
  primaryDark: "#053a61",
  primarySoft: "#d9f3ff",
  accent: "#ffd166",
  danger: "#ff9486",
  dangerSoft: "#6c2232",
  success: "#69e0a2",
  successSoft: "#174836",
  focus: "#ffffff",
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
} as const;
