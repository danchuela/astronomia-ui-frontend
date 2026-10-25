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
    waitingTitle: "Mientras esperas, ¿sabías que…?",
    dragToResize: "Arrastra para redimensionar",
    // Chat input
    attachImage: "Adjuntar imagen (PNG, JPEG, TIFF o FITS; máximo 8 MiB)",
    removeImage: "Quitar imagen",
    analysisFile: "Archivo de análisis",
    attachmentMissing: "Archivo no adjunto",
    analyzeUploadedImage: "Analiza la morfología completa de la imagen adjunta.",
    uploadTooLarge: "Elige un archivo de entre 1 byte y 8 MiB.",
    uploadFormat: "Formatos admitidos: PNG, JPEG, TIFF y FITS 2D.",
    uploadReadError: "No se pudo leer el archivo. Vuelve a adjuntarlo.",
    uploadOneFile: "Adjunta una sola imagen cada vez.",
    uploadRejected: "No se ha podido admitir el archivo. Comprueba el formato y el límite de 8 MiB.",
    uploadTimeout: "Se ha agotado el tiempo de subida. Vuelve a intentarlo.",
    fitsHdu: "Índice HDU del FITS (vacío: selección automática)",
    imageTools: {
      title: "Preparar imagen", scienceHdu: "HDU de ciencia", psfHdu: "HDU de PSF (misma escala)",
      errorHdu: "HDU de error", errorKind: "Tipo de mapa de error", sigma: "Desviación estándar (σ)",
      variance: "Varianza (σ²)", inverseVariance: "Varianza inversa (1/σ²)",
      source: "Fuente", automatic: "Selección automática", selected: "Punto seleccionado",
      point: "Seleccionar fuente", region: "Delimitar región", reset: "Restablecer selección", refresh: "Actualizar vista previa",
      apply: "Aplicar", stability: "Estabilidad frente al ruido (16 realizaciones; hasta 512 × 512 px)",
      loading: "Preparando imagen", preview: "Vista previa de la imagen original", detections: "fuentes detectadas",
      failed: "No se pudo preparar la imagen. Revisa los HDU, el formato y los límites del archivo.",
      busy: "Hay otro análisis en curso. Vuelve a intentarlo en unos segundos.",
      resourceLimit: "La fuente supera la capacidad de detección. Adjunta un recorte a resolución original con margen para el fondo; no se ha reducido la imagen.",
    },
    fitsLimits: "Píxeles originales del FITS, sin reducción ni estirado de visualización. La calibración fotométrica no se ha verificado; el modelo de ruido y la PSF dependen de los datos aportados.",
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
    analysisQuality: {
      title: "Calidad del análisis", exploratory: "Exploratorio", partial: "Parcial", unavailable: "No disponible",
      limits: "Imagen renderizada sin calibración fotométrica ni PSF medida. Los errores del perfil solo incluyen ruido de fondo. El estirado de visualización puede alterar las medidas.",
      boundary: "La fuente alcanza el borde del campo; parte de su luz puede quedar fuera.",
      suspect: "Hay mediciones con indicadores de calidad desfavorables.",
      multiple: "Hay varias fuentes detectadas. La selección automática prioriza el área y la proximidad al centro, no confirma la identidad del objeto.",
      manual: "Fuente seleccionada manualmente sobre la imagen.",
      region: "Análisis limitado a la región seleccionada; las coordenadas siguen referidas a la imagen original.",
      suppliedPsf: "PSF aportada por el usuario, normalizada y aplicada al modelo de Sérsic. La coincidencia de escala y banda depende de los datos aportados.",
      suppliedSigma: "Mapa de error aportado por el usuario, convertido a desviación estándar por píxel. Su calibración y las correlaciones del ruido no se han verificado.",
      stability: "Dispersión frente a 16 perturbaciones de ruido independientes, con segmentación, fondo y PSF fijos. No incluye errores sistemáticos ni equivale a incertidumbres totales.",
      states: { ok: "Calculado", suspect: "Dudoso", unavailable: "Sin resultado válido", missing: "No ejecutado" },
      modules: { segment: "Segmentación", cas: "CAS", sersic: "Sérsic", radial_profile: "Perfil radial", isophotes: "Isofotas" },
    },
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
    attachImage: "Attach image (PNG, JPEG, TIFF or FITS; up to 8 MiB)",
    removeImage: "Remove image",
    analysisFile: "Analysis file",
    attachmentMissing: "File not attached",
    analyzeUploadedImage: "Analyse the full morphology of the attached image.",
    uploadTooLarge: "Choose a file between 1 byte and 8 MiB.",
    uploadFormat: "Supported formats: PNG, JPEG, TIFF and 2D FITS.",
    uploadReadError: "The file could not be read. Attach it again.",
    uploadOneFile: "Attach one image at a time.",
    uploadRejected: "The file was not accepted. Check its format and the 8 MiB limit.",
    uploadTimeout: "The upload timed out. Please try again.",
    fitsHdu: "FITS HDU index (blank: automatic selection)",
    imageTools: {
      title: "Prepare image", scienceHdu: "Science HDU", psfHdu: "PSF HDU (same pixel scale)",
      errorHdu: "Error HDU", errorKind: "Error map type", sigma: "Standard deviation (σ)",
      variance: "Variance (σ²)", inverseVariance: "Inverse variance (1/σ²)",
      source: "Source", automatic: "Automatic selection", selected: "Selected point",
      point: "Select source", region: "Select region", reset: "Reset selection", refresh: "Refresh preview",
      apply: "Apply", stability: "Noise stability (16 realizations; up to 512 × 512 px)",
      loading: "Preparing image", preview: "Original image preview", detections: "detected sources",
      failed: "The image could not be prepared. Check HDUs, file format and size limits.",
      busy: "Another analysis is running. Try again in a few seconds.",
      resourceLimit: "The source exceeds the detection budget. Attach a native-resolution cutout with surrounding sky; the image has not been resized.",
    },
    fitsLimits: "Native FITS pixels, without resizing or display stretching. Photometric calibration has not been verified; the noise model and PSF depend on the supplied data.",
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
    waitingTitle: "While you wait, did you know?",
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
    analysisQuality: {
      title: "Analysis quality", exploratory: "Exploratory", partial: "Partial", unavailable: "Unavailable",
      limits: "Rendered image without photometric calibration or a measured PSF. Profile errors include background noise only. Display stretching can alter measurements.",
      boundary: "The source reaches the field boundary; some of its light may be outside the image.",
      suspect: "Some measurements have unfavorable quality flags.",
      multiple: "Several sources were detected. Automatic selection prioritizes area and proximity to the center; it does not confirm the object's identity.",
      manual: "Source selected manually on the image.",
      region: "Analysis limited to the selected region; coordinates still refer to the original image.",
      suppliedPsf: "User-supplied PSF, normalized and applied to the Sérsic model. Matching pixel scale and band depend on the supplied data.",
      suppliedSigma: "User-supplied error map, converted to standard deviation per pixel. Its calibration and noise correlations have not been verified.",
      stability: "Scatter across 16 independent noise perturbations with fixed segmentation, background and PSF. It excludes systematic errors and is not a total uncertainty estimate.",
      states: { ok: "Computed", suspect: "Suspect", unavailable: "No valid result", missing: "Not executed" },
      modules: { segment: "Segmentation", cas: "CAS", sersic: "Sérsic", radial_profile: "Radial profile", isophotes: "Isophotes" },
    },
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
