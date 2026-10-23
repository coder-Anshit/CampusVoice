// CampusVoice Theme Registry
// Add a new theme by adding one entry to CV_THEME_REGISTRY below.
// Each theme owns only visual tokens. Components stay untouched.

const shared = {
  "--cv-text-inverse": "255 255 255",
};

export const CV_THEME_REGISTRY = {
  lavender: {
    label: "Lavender",
    description: "Soft, warm and calm",
    icon: "🪻",
    preview: "#7C6A86",
    variables: {
      "--cv-bg": "247 244 239",
      "--cv-surface": "255 253 249",
      "--cv-surface-soft": "250 248 246",
      "--cv-surface-muted": "244 240 235",
      "--cv-text": "48 43 49",
      "--cv-text-secondary": "95 86 98",
      "--cv-text-muted": "117 104 121",
      "--cv-text-subtle": "157 147 138",
      "--cv-primary": "124 106 134",
      "--cv-primary-hover": "112 95 122",
      "--cv-primary-soft": "243 237 245",
      "--cv-primary-border": "216 203 221",
      "--cv-border": "233 225 218",
      "--cv-border-strong": "225 218 213",
      "--cv-divider": "238 232 226",
      "--cv-accent": "244 178 140",
      "--cv-accent-soft": "253 242 236",
      ...shared,
    },
  },
  sage: {
    label: "Sage",
    description: "Natural and welcoming",
    icon: "🌿",
    preview: "#8BAF87",
    variables: {
      "--cv-bg": "247 243 238",
      "--cv-surface": "255 252 248",
      "--cv-surface-soft": "249 247 242",
      "--cv-surface-muted": "242 239 233",
      "--cv-text": "45 58 46",
      "--cv-text-secondary": "91 101 89",
      "--cv-text-muted": "122 142 118",
      "--cv-text-subtle": "165 157 148",
      "--cv-primary": "139 175 135",
      "--cv-primary-hover": "107 140 104",
      "--cv-primary-soft": "239 246 237",
      "--cv-primary-border": "198 213 194",
      "--cv-border": "226 224 216",
      "--cv-border-strong": "211 216 207",
      "--cv-divider": "234 235 228",
      "--cv-accent": "196 172 155",
      "--cv-accent-soft": "247 240 235",
      ...shared,
    },
  },
  ocean: {
    label: "Ocean",
    description: "Cool and focused",
    icon: "🌊",
    preview: "#4E899D",
    variables: {
      "--cv-bg": "243 247 249",
      "--cv-surface": "253 255 255",
      "--cv-surface-soft": "246 250 252",
      "--cv-surface-muted": "237 244 247",
      "--cv-text": "34 48 55",
      "--cv-text-secondary": "78 96 105",
      "--cv-text-muted": "91 125 139",
      "--cv-text-subtle": "143 160 168",
      "--cv-primary": "78 137 157",
      "--cv-primary-hover": "60 111 130",
      "--cv-primary-soft": "232 244 248",
      "--cv-primary-border": "190 218 227",
      "--cv-border": "220 231 235",
      "--cv-border-strong": "207 223 228",
      "--cv-divider": "231 238 241",
      "--cv-accent": "121 174 185",
      "--cv-accent-soft": "235 246 248",
      ...shared,
    },
  },
  rose: {
    label: "Rose",
    description: "Warm and expressive",
    icon: "🌸",
    preview: "#A4707D",
    variables: {
      "--cv-bg": "249 245 245",
      "--cv-surface": "255 252 252",
      "--cv-surface-soft": "251 247 247",
      "--cv-surface-muted": "245 239 240",
      "--cv-text": "59 45 49",
      "--cv-text-secondary": "103 82 88",
      "--cv-text-muted": "139 108 117",
      "--cv-text-subtle": "166 145 149",
      "--cv-primary": "164 112 125",
      "--cv-primary-hover": "140 91 105",
      "--cv-primary-soft": "248 237 240",
      "--cv-primary-border": "226 204 210",
      "--cv-border": "235 222 225",
      "--cv-border-strong": "224 208 212",
      "--cv-divider": "241 230 232",
      "--cv-accent": "207 153 132",
      "--cv-accent-soft": "250 240 235",
      ...shared,
    },
  },
  midnight: {
    label: "Midnight",
    description: "Dark and immersive",
    icon: "🌙",
    preview: "#AE97BB",
    colorScheme: "dark",
    variables: {
      "--cv-bg": "27 25 31",
      "--cv-surface": "35 32 40",
      "--cv-surface-soft": "42 39 48",
      "--cv-surface-muted": "48 44 54",
      "--cv-text": "245 241 246",
      "--cv-text-secondary": "205 198 208",
      "--cv-text-muted": "166 154 171",
      "--cv-text-subtle": "132 121 137",
      "--cv-primary": "174 151 187",
      "--cv-primary-hover": "194 173 204",
      "--cv-primary-soft": "63 52 70",
      "--cv-primary-border": "91 75 101",
      "--cv-border": "70 64 75",
      "--cv-border-strong": "84 76 90",
      "--cv-divider": "61 56 66",
      "--cv-accent": "244 178 140",
      "--cv-accent-soft": "70 49 41",
      "--cv-text-inverse": "27 25 31",
    },
  },
  forest: {
    label: "Forest",
    description: "Deep, natural and grounded",
    icon: "🌲",
    preview: "#557A63",
    variables: {
      "--cv-bg": "243 247 243",
      "--cv-surface": "253 255 252",
      "--cv-surface-soft": "247 250 247",
      "--cv-surface-muted": "236 242 237",
      "--cv-text": "35 52 41",
      "--cv-text-secondary": "70 88 75",
      "--cv-text-muted": "93 119 99",
      "--cv-text-subtle": "145 157 148",
      "--cv-primary": "85 122 99",
      "--cv-primary-hover": "65 99 79",
      "--cv-primary-soft": "231 242 234",
      "--cv-primary-border": "190 211 195",
      "--cv-border": "219 229 220",
      "--cv-border-strong": "202 217 204",
      "--cv-divider": "231 238 232",
      "--cv-accent": "186 154 105",
      "--cv-accent-soft": "248 241 228",
      ...shared,
    },
  },
  graphite: {
    label: "Graphite",
    description: "Minimal, neutral and modern",
    icon: "◼️",
    preview: "#5B616A",
    variables: {
      "--cv-bg": "244 245 246",
      "--cv-surface": "255 255 255",
      "--cv-surface-soft": "249 250 251",
      "--cv-surface-muted": "238 240 242",
      "--cv-text": "35 39 44",
      "--cv-text-secondary": "75 81 89",
      "--cv-text-muted": "107 115 124",
      "--cv-text-subtle": "151 157 164",
      "--cv-primary": "91 97 106",
      "--cv-primary-hover": "69 75 83",
      "--cv-primary-soft": "235 237 240",
      "--cv-primary-border": "207 211 216",
      "--cv-border": "224 227 230",
      "--cv-border-strong": "207 211 216",
      "--cv-divider": "235 237 239",
      "--cv-accent": "176 142 107",
      "--cv-accent-soft": "247 240 232",
      ...shared,
    },
  },
  sunset: {
    label: "Sunset",
    description: "Warm, optimistic and energetic",
    icon: "🌅",
    preview: "#B86F58",
    variables: {
      "--cv-bg": "250 246 242",
      "--cv-surface": "255 253 250",
      "--cv-surface-soft": "252 248 245",
      "--cv-surface-muted": "245 238 233",
      "--cv-text": "60 45 40",
      "--cv-text-secondary": "105 81 72",
      "--cv-text-muted": "143 105 91",
      "--cv-text-subtle": "174 151 142",
      "--cv-primary": "184 111 88",
      "--cv-primary-hover": "157 87 67",
      "--cv-primary-soft": "249 235 229",
      "--cv-primary-border": "229 196 185",
      "--cv-border": "237 224 218",
      "--cv-border-strong": "226 208 200",
      "--cv-divider": "242 231 225",
      "--cv-accent": "218 162 83",
      "--cv-accent-soft": "252 243 227",
      ...shared,
    },
  },
  cocoa: {
    label: "Cocoa",
    description: "Warm, refined and grounded",
    icon: "☕",
    preview: "#8B6650",
    variables: {
      "--cv-bg": "248 244 240",
      "--cv-surface": "255 252 248",
      "--cv-surface-soft": "250 247 243",
      "--cv-surface-muted": "241 235 229",
      "--cv-text": "57 43 35",
      "--cv-text-secondary": "100 79 66",
      "--cv-text-muted": "132 108 92",
      "--cv-text-subtle": "169 150 138",
      "--cv-primary": "139 102 80",
      "--cv-primary-hover": "112 78 59",
      "--cv-primary-soft": "245 235 228",
      "--cv-primary-border": "225 204 191",
      "--cv-border": "232 220 211",
      "--cv-border-strong": "216 199 188",
      "--cv-divider": "239 229 221",
      "--cv-accent": "201 155 105",
      "--cv-accent-soft": "249 240 229",
      ...shared,
    },
  },
  arctic: {
    label: "Arctic",
    description: "Bright, crisp and spacious",
    icon: "❄️",
    preview: "#5C8FA8",
    variables: {
      "--cv-bg": "242 247 250",
      "--cv-surface": "253 255 255",
      "--cv-surface-soft": "246 250 252",
      "--cv-surface-muted": "234 243 247",
      "--cv-text": "32 48 58",
      "--cv-text-secondary": "70 94 107",
      "--cv-text-muted": "91 128 145",
      "--cv-text-subtle": "143 165 175",
      "--cv-primary": "92 143 168",
      "--cv-primary-hover": "67 115 140",
      "--cv-primary-soft": "231 244 249",
      "--cv-primary-border": "188 217 228",
      "--cv-border": "218 232 238",
      "--cv-border-strong": "201 221 229",
      "--cv-divider": "231 241 245",
      "--cv-accent": "133 173 178",
      "--cv-accent-soft": "235 247 248",
      ...shared,
    },
  },
};

export const CV_THEMES = Object.fromEntries(
  Object.entries(CV_THEME_REGISTRY).map(([id, theme]) => [id, {
    label: theme.label,
    description: theme.description,
  }])
);

export const DEFAULT_THEME = "lavender";

function applyThemeVariables(themeId) {
  const root = document.documentElement;
  const theme = CV_THEME_REGISTRY[themeId];
  if (!theme) return;

  Object.entries(theme.variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  root.style.colorScheme = theme.colorScheme || "light";
  root.dataset.theme = themeId;
}

export function setTheme(theme) {
  if (!CV_THEME_REGISTRY[theme]) return;
  applyThemeVariables(theme);
  localStorage.setItem("cv-theme", theme);
  window.dispatchEvent(new CustomEvent("cv-theme-change", { detail: theme }));
}

export function getTheme() {
  const stored = localStorage.getItem("cv-theme");
  return CV_THEME_REGISTRY[stored] ? stored : DEFAULT_THEME;
}

export function initializeTheme() {
  applyThemeVariables(getTheme());
}

export function getThemeDefinition(theme = getTheme()) {
  return CV_THEME_REGISTRY[theme] || CV_THEME_REGISTRY[DEFAULT_THEME];
}
