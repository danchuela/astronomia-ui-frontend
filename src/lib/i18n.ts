// Interface language (Spanish or English) and every fixed text of the UI.
//
// The first time, the language comes from the browser (Spanish for es/ca/gl/eu,
// English otherwise); after that, from the ES | EN button (saved in localStorage).
// The answers follow the language of each message (decided in the BFF and n8n);
// this choice is also sent with every message, for ambiguous ones such as "M31".
import { createContext, useContext } from "react";

export type Lang = "es" | "en";

const STORAGE_KEY = "astronomia_language";
const SPANISH_BROWSER = /^(es|ca|gl|eu)\b/i;

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
  } catch {
    // Storage blocked: fall back to the browser language.
  }
  const browser = (navigator.languages && navigator.languages[0]) || navigator.language || "es";
  return SPANISH_BROWSER.test(browser) ? "es" : "en";
}

// Current language for code outside React (lib/api.ts).
let currentLang: Lang = initialLang();
export function getLang(): Lang {
  return currentLang;
}

const UI = {
  es: {
    // Sidebar
    assistant: "Asistente astronómico",
    expand: "Expandir",
    collapse: "Contraer",
    newChat: "Nuevo chat",
    conversations: "Conversaciones",
    noConversations: "Aún no hay conversaciones",
    untitled: "Sin título",
    newConversation: "Nueva conversación",
    logout: "Cerrar sesión",
    logoutShort: "Salir",
    languageLabel: "Idioma",
    // Login
    tagline:
      "Tu asistente astronómico con inteligencia artificial. Explora el universo, analiza galaxias y planifica observaciones.",
    demoAccess: "Acceso de demostración",
    email: "Correo electrónico",
    emailRequired: "Introduce tu correo electrónico.",
    demoNote: "No hace falta usar un correo real. Puedes introducir uno ficticio, como demo@example.com.",
    enter: "Entrar",
    loginCards: [
      ["🔭", "Visualización interactiva", "Explora el cielo en múltiples longitudes de onda con el visor Aladin integrado."],
      ["🌀", "Análisis de galaxias", "Segmentación, fotometría, morfología, perfiles de brillo e isofotometría."],
      ["🌙", "Planificación de observación", "Planifica noches de observación según tu ubicación, equipamiento y condiciones."],
    ],
    // Chat (empty state)
    chatCards: [
      ["🔭", "Visualización", "Explora el cielo con el visor interactivo en múltiples longitudes de onda."],
      ["🌀", "Análisis", "Segmentación, fotometría, morfología y perfiles de brillo de galaxias."],
      ["🌙", "Observación", "Planifica tus noches de observación según tu ubicación y condiciones."],
    ],
    suggestions: [
      "Muéstrame la galaxia de Andrómeda",
      "Analiza M51",
      "¿Qué puedo observar esta noche desde Madrid?",
      "Busca NGC 1300",
    ],
    interactiveView: "Vista interactiva",
    loadingViewer: "Cargando visor interactivo...",
    dragToResize: "Arrastra para redimensionar",
    // Chat input
    placeholder: "Escribe un mensaje...",
    send: "Enviar",
    aiNotice:
      "astronomIA usa modelos de lenguaje de OpenAI y puede cometer errores. Comprueba los datos importantes.",
    privacyLink: "Privacidad y datos",
    privacyQuery: "privacidad",
    // Chat message
    thanksRating: "Gracias por tu valoración",
    wasUseful: "¿Te ha sido útil?",
    markUseful: "Marcar como útil",
    markNotUseful: "Marcar como no útil",
    ratingError: "No se pudo enviar. Inténtalo más tarde.",
    close: "Cerrar",
    preview: "Ver vista previa",
    availableAnalyses: "Análisis disponibles",
    clickToEnlarge: "Clic para ampliar",
    analysisImage: "Imagen del análisis",
    analysisPlot: "Gráfico de análisis",
    enlargedView: "Vista ampliada",
    // Viewer
    bands: { xray: "Rayos X", uv: "UV", optical: "Óptico", ir: "IR", radio: "Radio" },
    viewerUnavailable: "Visor interactivo no disponible",
    webglHint:
      "Activa la aceleración por hardware en tu navegador (Chrome: chrome://settings/system) y recarga la página.",
    openAladin: "Abrir Aladin Lite en la web",
    // Feedback
    feedbackTitle: "Cuéntanos qué opinas",
    feedbackOpen: "Enviar comentarios",
    feedbackSubtitle: "Tu opinión ayuda a mejorar astronomIA.",
    feedbackThanks: "¡Gracias por tus comentarios!",
    feedbackSaved: "Los hemos registrado correctamente.",
    feedbackHow: "¿Cómo ha ido tu experiencia?",
    comment: "Comentario",
    optional: "(opcional)",
    commentPlaceholder: "Qué te ha gustado, qué mejorarías, qué falta...",
    wantsContact: "Quiero que me contacten para hablar más a fondo",
    emailPlaceholder: "tu@email.com",
    chooseRating: "Selecciona pulgar arriba o abajo.",
    contactEmailRequired: "Si quieres que te contactemos, introduce un correo electrónico válido.",
    unknownError: "Error desconocido.",
    sending: "Enviando...",
    pressEsc: "Pulsa",
    orClickOutside: "o haz clic fuera para cerrar",
    // Help
    helpOpen: "Abrir ayuda y glosario",
    helpTooltip: "Ayuda y glosario de términos",
    helpTitle: "Ayuda y glosario",
    helpDialog: "Ayuda y glosario de astronomIA",
    helpSubtitle: "Definiciones, ejemplos y cómo aprovechar al máximo astronomIA.",
    helpClose: "Cerrar ayuda",
    helpSearch: "Buscar un término (p. ej., Sérsic, isofotas, airmass, fase lunar...)",
    helpNoMatch: (q: string) => `No encontramos ningún término que coincida con "${q}".`,
    creditsTfm: "Esta solución forma parte del",
    creditsTfmName: "Trabajo de Fin de Máster",
    creditsOf: "del",
    creditsMaster: "Máster Universitario en Astrofísica y Técnicas de Observación Astronómica",
    creditsPresented: ", presentado en la ",
    creditsIn: "en",
    creditsAuthors: "Autores:",
    creditsAnd: "y",
    creditsDirector: "Directora:",
    creditsDirectorName: "Dra. Francesca Pinna",
    // Service errors (lib/api.ts)
    serviceUnavailable:
      "astronomIA no está disponible en este momento. Revisa tu conexión a internet e inténtalo de nuevo en unos minutos.",
    feedbackUnavailable: "No pudimos enviar tus comentarios en este momento. Inténtalo de nuevo en unos minutos.",
    notConfigured: "La conexión con el servicio no está configurada.",
  },
  en: {
    assistant: "Astronomy assistant",
    expand: "Expand",
    collapse: "Collapse",
    newChat: "New chat",
    conversations: "Conversations",
    noConversations: "No conversations yet",
    untitled: "Untitled",
    newConversation: "New conversation",
    logout: "Log out",
    logoutShort: "Exit",
    languageLabel: "Language",
    tagline:
      "Your AI astronomy assistant. Explore the universe, analyse galaxies and plan observations.",
    demoAccess: "Demo access",
    email: "Email",
    emailRequired: "Enter your email.",
    demoNote: "You do not need a real email. You can enter a made-up one, such as demo@example.com.",
    enter: "Enter",
    loginCards: [
      ["🔭", "Interactive viewer", "Explore the sky at many wavelengths with the built-in Aladin viewer."],
      ["🌀", "Galaxy analysis", "Segmentation, photometry, morphology, brightness profiles and isophotes."],
      ["🌙", "Observation planning", "Plan observing nights for your location, equipment and conditions."],
    ],
    chatCards: [
      ["🔭", "Viewer", "Explore the sky with the interactive viewer at many wavelengths."],
      ["🌀", "Analysis", "Segmentation, photometry, morphology and brightness profiles of galaxies."],
      ["🌙", "Observation", "Plan your observing nights for your location and conditions."],
    ],
    suggestions: [
      "Show me the Andromeda galaxy",
      "Analyse M51",
      "What can I see tonight from Madrid?",
      "Find NGC 1300",
    ],
    interactiveView: "Interactive view",
    loadingViewer: "Loading the interactive viewer...",
    dragToResize: "Drag to resize",
    placeholder: "Type a message...",
    send: "Send",
    aiNotice: "astronomIA uses OpenAI language models and can make mistakes. Check important information.",
    privacyLink: "Privacy and data",
    privacyQuery: "privacy",
    thanksRating: "Thanks for your rating",
    wasUseful: "Was this helpful?",
    markUseful: "Mark as helpful",
    markNotUseful: "Mark as not helpful",
    ratingError: "Could not send it. Please try again later.",
    close: "Close",
    preview: "See preview",
    availableAnalyses: "Available analyses",
    clickToEnlarge: "Click to enlarge",
    analysisImage: "Analysis image",
    analysisPlot: "Analysis plot",
    enlargedView: "Enlarged view",
    bands: { xray: "X-ray", uv: "UV", optical: "Optical", ir: "IR", radio: "Radio" },
    viewerUnavailable: "Interactive viewer not available",
    webglHint:
      "Turn on hardware acceleration in your browser (Chrome: chrome://settings/system) and reload the page.",
    openAladin: "Open Aladin Lite on the web",
    feedbackTitle: "Tell us what you think",
    feedbackOpen: "Send feedback",
    feedbackSubtitle: "Your opinion helps improve astronomIA.",
    feedbackThanks: "Thank you for your feedback!",
    feedbackSaved: "We have recorded it.",
    feedbackHow: "How was your experience?",
    comment: "Comment",
    optional: "(optional)",
    commentPlaceholder: "What you liked, what you would improve, what is missing...",
    wantsContact: "I would like to be contacted to talk in more depth",
    emailPlaceholder: "you@email.com",
    chooseRating: "Choose thumbs up or down.",
    contactEmailRequired: "If you want us to contact you, enter a valid email.",
    unknownError: "Unknown error.",
    sending: "Sending...",
    pressEsc: "Press",
    orClickOutside: "or click outside to close",
    helpOpen: "Open help and glossary",
    helpTooltip: "Help and glossary of terms",
    helpTitle: "Help and glossary",
    helpDialog: "astronomIA help and glossary",
    helpSubtitle: "Definitions, examples and how to get the most out of astronomIA.",
    helpClose: "Close help",
    helpSearch: "Search a term (e.g. Sérsic, isophotes, airmass, moon phase...)",
    helpNoMatch: (q: string) => `No term matches "${q}".`,
    creditsTfm: "This solution is part of the",
    creditsTfmName: "Master's Thesis",
    creditsOf: "of the",
    creditsMaster: "Master's Degree in Astrophysics and Astronomical Observation Techniques",
    creditsPresented: ", presented at the ",
    creditsIn: "in",
    creditsAuthors: "Authors:",
    creditsAnd: "and",
    creditsDirector: "Supervisor:",
    creditsDirectorName: "Dr Francesca Pinna",
    serviceUnavailable:
      "astronomIA is not available right now. Check your internet connection and try again in a few minutes.",
    feedbackUnavailable: "We could not send your feedback right now. Please try again in a few minutes.",
    notConfigured: "The connection to the service is not configured.",
  },
} as const;

export type UiTexts = (typeof UI)[Lang];

export function texts(lang: Lang = currentLang): UiTexts {
  return UI[lang];
}

export interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: UiTexts;
}

export const LanguageContext = createContext<LanguageContextValue>({
  lang: currentLang,
  setLang: () => undefined,
  t: UI[currentLang],
});

// Saves the choice and makes it the language of the requests (see LanguageProvider).
export function storeLang(next: Lang): void {
  currentLang = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage blocked: the choice lasts for this visit only.
  }
}

export function useLang(): LanguageContextValue {
  return useContext(LanguageContext);
}
