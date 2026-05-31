import { useEffect, useMemo, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
//  HelpButton — Botón flotante + modal con glosario completo de astronomIA.
//  Visible en cualquier pantalla del Chat. Permite buscar términos por
//  nombre, definición o ejemplo (búsqueda case-insensitive y sin acentos).
//  Se cierra con ESC, click en el backdrop o el botón X.
// ─────────────────────────────────────────────────────────────────────

type HelpEntry = {
  term: string;
  definition: string;
  example?: string;
};

type HelpCategory = {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  entries: HelpEntry[];
};

// ─── Contenido del glosario ───
// Todas las definiciones están escritas en lenguaje accesible.
// Cada entrada PUEDE tener un "example" que muestra cómo se usa el término
// dentro de astronomIA o cómo formular una consulta para que la app lo entienda.
const HELP_CONTENT: HelpCategory[] = [
  {
    id: "como-usar",
    title: "Cómo usar astronomIA",
    emoji: "🔭",
    description:
      "Tres tipos de consultas que la app entiende. Si pides algo y la respuesta no es lo que esperabas, prueba a reformular siguiendo estos ejemplos.",
    entries: [
      {
        term: "Análisis de una galaxia o cielo profundo",
        definition:
          "Para ver una galaxia, nebulosa o cúmulo en el visor y opcionalmente extraer sus propiedades morfológicas, fotométricas, isofotas, etc.",
        example:
          'Ejemplos: "muéstrame M31", "analiza M51", "analiza morfología completa de NGC 1300".',
      },
      {
        term: "Planificación de una observación",
        definition:
          "Para saber CUÁNDO y CÓMO observar un objeto desde tu ubicación: ventana de visibilidad, altitud máxima, fase lunar, clima, etc. Necesita objeto + lugar + fecha (si no, te los pregunta).",
        example:
          'Ejemplos: "Quiero ver Júpiter esta noche desde Córdoba", "Carta de visibilidad de M51 desde Madrid mañana", "Cuándo puedo observar Saturno desde Barcelona".',
      },
      {
        term: "Pregunta informativa general",
        definition:
          "Para conocer datos básicos de un objeto sin abrir el visor ni planificar.",
        example:
          'Ejemplos: "¿qué es UGC 10214?", "cuéntame sobre la Galaxia del Sombrero", "cuál es la distancia de M87".',
      },
      {
        term: "Frase mágica: morfología completa",
        definition:
          'Si pides "analiza morfología completa de X" obtienes el paquete entero: estructura, isofotas, parámetros CAS, perfil de brillo, ajuste de Sérsic y descripción narrativa. Es el análisis más exhaustivo que ofrece la app.',
        example: 'Ejemplo: "analiza morfología completa de M51".',
      },
    ],
  },
  {
    id: "analisis-morfologico",
    title: "Análisis morfológico de galaxias",
    emoji: "🔬",
    description:
      "Términos que aparecen en las respuestas del módulo de análisis (galaxias y cielo profundo).",
    entries: [
      {
        term: "Morfología",
        definition:
          "Forma y estructura general de una galaxia: si es alargada o redonda, si tiene brazos espirales, barra central, asimetrías, etc.",
      },
      {
        term: "Estructura",
        definition:
          "Cómo se distribuye la luz dentro de la galaxia: si hay núcleo concentrado, disco extendido, brazos visibles, o características irregulares.",
      },
      {
        term: "Elipticidad",
        definition:
          "Mide qué tan achatada o circular es la imagen del objeto. 0 = perfectamente circular; valores cercanos a 1 = muy alargado. Una espiral vista de canto tiene elipticidad alta.",
      },
      {
        term: "Segmentación",
        definition:
          "Proceso de aislar la galaxia del fondo de cielo, ignorando estrellas vecinas y ruido. Es como recortar con tijeras solo la parte de la imagen que pertenece a tu objeto.",
      },
      {
        term: "Isofotas",
        definition:
          "Curvas que conectan puntos de igual brillo en la imagen, como las curvas de nivel en un mapa topográfico. Cada elipse traza un anillo de brillo constante alrededor de la galaxia.",
        example:
          'En las respuestas verás algo como: "Isofotas para M51: 12 elipses ajustadas (sma=21.3–158.0 px, elipticidad media 0.180)".',
      },
      {
        term: "SMA (semi-major axis)",
        definition:
          "Semieje mayor de una isofota, en píxeles. Es básicamente el radio de la elipse a lo largo de su dirección más larga.",
      },
      {
        term: "Fotometría",
        definition:
          "Medición de la cantidad de luz que emite el objeto. Te dice cuánto brillo hay en cada zona o anillo de la galaxia.",
      },
      {
        term: "Perfil de brillo",
        definition:
          "Gráfica que muestra cómo decae el brillo desde el centro hacia los bordes. En la mayoría de galaxias el centro es muy brillante y baja exponencialmente conforme te alejas.",
      },
      {
        term: "Parámetros CAS",
        definition:
          "Trío de números que resumen la morfología en términos cuantitativos. C, A y S son las iniciales de Concentración, Asimetría y Suavidad.",
      },
      {
        term: "C — Concentración",
        definition:
          "Qué tan concentrada está la luz en el centro respecto a los bordes. Valores altos = galaxia con núcleo muy denso (típico de elípticas y bulbos prominentes).",
      },
      {
        term: "A — Asimetría",
        definition:
          "Cuánto difiere la galaxia de su versión rotada 180°. Valores altos delatan fusiones, brazos torcidos o irregularidades.",
      },
      {
        term: "S — Suavidad",
        definition:
          'Qué tan "lisa" o granulada se ve la imagen. Galaxias con muchas regiones de formación estelar activa muestran estructura fina (S alto). Las elípticas viejas son más suaves (S bajo).',
      },
      {
        term: "Índice de Sérsic (n)",
        definition:
          'Número que describe la forma del perfil de brillo. n≈1 es típico de galaxias espirales (perfil exponencial); n≈4 es típico de galaxias elípticas (ley de De Vaucouleurs). Es como un "código de barras" del tipo de galaxia.',
      },
      {
        term: "r_half",
        definition:
          "Radio efectivo o de mitad-luz. Es el radio dentro del cual se encuentra la mitad de la luz total de la galaxia. Sirve como medida estandarizada de tamaño.",
      },
      {
        term: "Tipo morfológico (Hubble)",
        definition:
          "Clasificación clásica de galaxias: E (elípticas), S (espirales), SA (espirales sin barra), SB (espirales barradas), SAB (intermedias), S0 (lenticulares), Irr (irregulares). Las espirales se subdividen en Sa, Sb, Sc según prominencia de brazos.",
      },
      {
        term: "AGN (núcleo galáctico activo)",
        definition:
          "Galaxia cuyo agujero negro supermasivo central está engullendo material y emitiendo enormes cantidades de luz. Subtipos comunes: Sy1, Sy2 (galaxias Seyfert), LINER, blazar, cuásar.",
      },
      {
        term: "Sy2 (Seyfert tipo 2)",
        definition:
          "Tipo de AGN cuyas líneas espectrales anchas están ocultas por polvo. M51 es un ejemplo clásico.",
      },
    ],
  },
  {
    id: "planificacion",
    title: "Planificación de observación",
    emoji: "📅",
    description:
      "Términos que aparecen en las cartas de visibilidad y planificación nocturna.",
    entries: [
      {
        term: "Carta de visibilidad / carta de observación",
        definition:
          "Resumen completo de cuándo y cómo podrás ver un objeto desde tu ubicación: a qué hora sale, cuándo culmina, qué altitud alcanzará, cómo afecta la luna y el clima.",
        example: 'Ejemplo: "Quiero la carta de visibilidad de M31 desde Granada esta noche".',
      },
      {
        term: "Ventana de observación",
        definition:
          "Intervalo de tiempo en el que el objeto está suficientemente alto sobre el horizonte Y la noche es lo suficientemente oscura para verlo. Es la franja útil para apuntar el telescopio.",
      },
      {
        term: "Tránsito (culminación)",
        definition:
          "Momento en el que un objeto alcanza su punto más alto en el cielo desde tu ubicación. Es el mejor momento para observar porque la luz atraviesa la mínima cantidad de atmósfera.",
      },
      {
        term: "Altitud",
        definition:
          "Ángulo del objeto sobre el horizonte, en grados. 0° = en el horizonte, 90° = justo encima de ti (cenit). Por debajo de ~10-20° la atmósfera distorsiona mucho la imagen.",
      },
      {
        term: "Azimut",
        definition:
          "Dirección horizontal del objeto, medida en grados desde el Norte hacia el Este. 0°=Norte, 90°=Este, 180°=Sur, 270°=Oeste.",
      },
      {
        term: "Airmass (masa de aire)",
        definition:
          "Cantidad de atmósfera que la luz del objeto atraviesa para llegar a tu telescopio. 1.0 = objeto en el cenit (mínima atmósfera); a 30° de altitud es ~2.0 (el doble de atmósfera); por debajo crece rápido y la imagen empeora.",
      },
      {
        term: "Crepúsculo astronómico",
        definition:
          "Momento en que el sol está 18° o más por debajo del horizonte. A partir de ahí el cielo está lo suficientemente oscuro para observar objetos débiles como galaxias y nebulosas.",
      },
      {
        term: "Noche astronómica",
        definition:
          "Período entre el final del crepúsculo astronómico de la tarde y el inicio del crepúsculo astronómico de la mañana. La 'verdadera noche oscura' para astrónomos.",
      },
      {
        term: "Sale / Se pone",
        definition:
          "Hora a la que el objeto cruza el horizonte subiendo (sale) o bajando (se pone). En cielo profundo, la app suele indicar 'sale sobre 10°' porque por debajo no se observa.",
      },
      {
        term: "Seeing",
        definition:
          "Calidad de la atmósfera en términos de estabilidad. Buen seeing = imagen estable y nítida; mal seeing = imagen 'temblona'. Depende de turbulencias en la atmósfera y de tu altitud sobre el nivel del mar.",
      },
      {
        term: "Contaminación lumínica",
        definition:
          "Brillo artificial del cielo nocturno por luces urbanas. Reduce el contraste y hace casi invisibles los objetos débiles. Cielos rurales muy oscuros son ideales para fotografía deep-sky.",
      },
      {
        term: "Sol de medianoche",
        definition:
          "Fenómeno en latitudes muy al norte o muy al sur (cerca de los círculos polares) donde, en ciertas fechas, el sol no se pone durante 24 horas. No hay noche y no se puede observar.",
      },
      {
        term: "Noche polar",
        definition:
          "Lo opuesto al sol de medianoche: el sol no sale en 24 horas. Hay oscuridad continua, ideal para observar pero solo si el objeto se eleva sobre el horizonte desde esa latitud extrema.",
      },
    ],
  },
  {
    id: "luna",
    title: "Fases y observación lunar",
    emoji: "🌙",
    description:
      "Cómo afecta la luna a tu observación y qué significan las fases que aparecen en las respuestas.",
    entries: [
      {
        term: "Iluminación lunar (%)",
        definition:
          "Porcentaje de la cara visible de la luna que está iluminada por el sol. 0% = luna nueva (invisible), 100% = luna llena. Varía día a día.",
      },
      {
        term: "Luna nueva",
        definition:
          "Luna no iluminada (0%). La cara visible está completamente en sombra. Es la mejor fase para observar cielo profundo: el cielo está más oscuro.",
      },
      {
        term: "Creciente / Cuarto creciente / Gibosa creciente",
        definition:
          "Fases entre luna nueva y luna llena. La iluminación va creciendo cada noche. Desde el hemisferio norte, el lado iluminado está a la DERECHA.",
      },
      {
        term: "Luna llena",
        definition:
          "Luna 100% iluminada. Magnífica para observación selenográfica (cráteres, mares), pero el cielo se vuelve demasiado claro para objetos débiles.",
      },
      {
        term: "Gibosa menguante / Cuarto menguante / Menguante",
        definition:
          "Fases entre luna llena y luna nueva. La iluminación va decreciendo. Desde el hemisferio norte, el lado iluminado está a la IZQUIERDA.",
      },
      {
        term: "Impacto lunar",
        definition:
          "Cuánto interfiere la luz de la luna con tu observación. 'Alto' cerca de luna llena (mal para objetos débiles); 'bajo' cerca de luna nueva (cielo más oscuro). 'Moderado' en las fases intermedias.",
      },
    ],
  },
  {
    id: "propiedades",
    title: "Propiedades de los objetos",
    emoji: "⭐",
    description:
      "Magnitudes, coordenadas y otros datos numéricos que aparecen en las respuestas.",
    entries: [
      {
        term: "Magnitud aparente",
        definition:
          "Escala de brillo de los objetos vista desde la Tierra. ATENCIÓN: es escala INVERSA — cuanto MENOR el número, MÁS brillante. Sirio (m=-1.46) es la estrella más brillante del cielo; M31 (m=3.4) se ve a simple vista; M51 (m=8.0) necesita binoculares; objetos m>13 requieren telescopio mediano.",
      },
      {
        term: "Redshift (z) / corrimiento al rojo",
        definition:
          "Cuánto se 'estira' la luz de un objeto lejano por la expansión del universo. z=0 indica que el objeto está prácticamente en reposo respecto a nosotros; z=0.05 indica una velocidad de recesión grande (objeto muy lejano). Es como el efecto Doppler aplicado a la luz.",
      },
      {
        term: "Velocidad radial (v_radial)",
        definition:
          "Velocidad a la que un objeto se aleja (positivo) o se acerca (negativo) de nosotros. Se mide en km/s. Relacionada con el redshift por la expansión del universo.",
      },
      {
        term: "RA (Right Ascension / Ascensión Recta)",
        definition:
          "Coordenada celeste análoga a la longitud terrestre. Mide la posición Este-Oeste del objeto en el cielo. Va de 0h a 24h (o 0° a 360°).",
      },
      {
        term: "Dec (Declination / Declinación)",
        definition:
          "Coordenada celeste análoga a la latitud terrestre. Mide la posición Norte-Sur del objeto. Va de -90° (polo sur celeste) a +90° (polo norte celeste).",
      },
      {
        term: "J2000",
        definition:
          "Sistema de referencia con época del 1 enero 2000. Las coordenadas se dan en este sistema porque los puntos de referencia rotan lentamente (precesión) y necesitamos una época fija para comparar entre catálogos.",
      },
      {
        term: "Constelación",
        definition:
          "Una de las 88 regiones oficiales en que se divide el cielo. Cada objeto pertenece a una constelación, lo cual ayuda a localizarlo: 'M31 está en Andrómeda', 'M51 está en Canes Venatici'.",
      },
    ],
  },
  {
    id: "objetos",
    title: "Tipos de objetos del cielo",
    emoji: "🌌",
    description:
      "Clases de objetos que la app puede analizar o planificar para observar.",
    entries: [
      {
        term: "Galaxia espiral",
        definition:
          "Galaxia con brazos espirales visibles, como la Vía Láctea, M31 (Andrómeda) o M51 (Torbellino). Se clasifican en SA (sin barra) y SB (con barra central).",
      },
      {
        term: "Galaxia elíptica (E)",
        definition:
          "Galaxia esferoidal sin estructura espiral visible. Suele ser vieja, con poco gas y poca formación estelar nueva. Ejemplo: M87.",
      },
      {
        term: "Galaxia irregular",
        definition:
          "Galaxia sin forma definida. Suelen ser pequeñas y muchas veces son resultado de interacciones o fusiones con otras galaxias. Ejemplo: UGC 10214 (la galaxia del Renacuajo).",
      },
      {
        term: "Galaxia lenticular (S0)",
        definition:
          "Intermedia entre espiral y elíptica: tiene disco como las espirales pero sin brazos visibles. Como un sombrero plano.",
      },
      {
        term: "Nebulosa de emisión",
        definition:
          "Nube de gas que emite su propia luz (típicamente roja por la línea H-alfa del hidrógeno). Suelen ser viveros estelares. Ejemplo: M42 (Orión).",
      },
      {
        term: "Nebulosa de reflexión",
        definition:
          "Nube de polvo que refleja la luz de estrellas cercanas (típicamente azulada). Ejemplo: la nebulosidad alrededor de las Pléyades.",
      },
      {
        term: "Nebulosa planetaria",
        definition:
          "Cáscara de gas expulsada por una estrella moribunda al estilo del Sol al final de su vida. No tiene nada que ver con planetas — el nombre viene de su aspecto redondeado en telescopios pequeños. Ejemplo: M57 (Anillo), M97 (Lechuza).",
      },
      {
        term: "Cúmulo abierto",
        definition:
          "Grupo de cientos a miles de estrellas jóvenes, débilmente ligadas por la gravedad. Suelen estar en el disco de la galaxia. Ejemplos: M45 (Pléyades), M44 (Colmena).",
      },
      {
        term: "Cúmulo globular",
        definition:
          "Grupo esférico de cientos de miles de estrellas viejas, fuertemente ligadas. Orbitan el halo de la galaxia. Ejemplos: Omega Centauri, M13 (Hércules).",
      },
      {
        term: "Estrella variable",
        definition:
          "Estrella cuyo brillo cambia con el tiempo, ya sea por causas internas (pulsaciones, manchas) o externas (eclipses por una compañera).",
      },
      {
        term: "Constelación vs asterismo",
        definition:
          "Una constelación es una región oficial del cielo (hay 88). Un asterismo es un grupo de estrellas reconocible que NO es una constelación oficial: ej. el Triángulo de Verano o el Cinturón de Orión.",
      },
    ],
  },
  {
    id: "catalogos",
    title: "Catálogos astronómicos",
    emoji: "📚",
    description:
      "Las siglas que verás en los nombres de los objetos (M, NGC, IC...) y de dónde vienen los datos.",
    entries: [
      {
        term: "M (Messier)",
        definition:
          "Catálogo del astrónomo francés Charles Messier (siglo XVIII). 110 objetos brillantes accesibles a aficionados con instrumental modesto. Ejemplos: M31 (Andrómeda), M42 (Orión), M45 (Pléyades).",
      },
      {
        term: "NGC (New General Catalogue)",
        definition:
          "Catálogo de J.L.E. Dreyer (1888) con casi 8000 objetos no estelares. Mucho más extenso que Messier. Ejemplos: NGC 1300 (espiral barrada), NGC 4565 (galaxia de la Aguja).",
      },
      {
        term: "IC (Index Catalogue)",
        definition:
          "Suplementos al NGC con ~5000 objetos adicionales descubiertos a finales del siglo XIX y principios del XX.",
      },
      {
        term: "UGC (Uppsala General Catalogue)",
        definition:
          "Catálogo de galaxias visibles desde el hemisferio norte hecho en Uppsala (Suecia). Ejemplo famoso: UGC 10214 (Galaxia del Renacuajo, una fusión galáctica).",
      },
      {
        term: "MCG, PGC, CGCG",
        definition:
          "Otros catálogos de galaxias menos famosos pero importantes para objetos oscuros. Los verás cuando consultes galaxias que no están en Messier o NGC.",
      },
      {
        term: "SIMBAD",
        definition:
          "Base de datos astronómica del CDS (Centre de Données astronomiques de Strasbourg). Centraliza identificadores, posiciones, magnitudes y otras propiedades básicas de millones de objetos. astronomIA la usa para resolver nombres.",
      },
      {
        term: "SDSS (Sloan Digital Sky Survey)",
        definition:
          "Survey fotográfico que cubre buena parte del cielo en varios colores (u, g, r, i, z). astronomIA usa sus imágenes para los visores y el análisis morfológico.",
      },
      {
        term: "DSS2 (Digitized Sky Survey 2)",
        definition:
          "Versión digitalizada de placas fotográficas del telescopio Hubble Schmidt. Cubre casi todo el cielo en filtros azul y rojo. Útil para objetos no cubiertos por SDSS.",
      },
      {
        term: "HST (Telescopio Espacial Hubble)",
        definition:
          "Telescopio en órbita lanzado por NASA y ESA. Si un objeto fue observado por el Hubble, astronomIA puede mostrar qué instrumento (WFPC2, ACS, WFC3) y filtro se usó.",
      },
      {
        term: "JWST (James Webb Space Telescope)",
        definition:
          "Sucesor del Hubble, lanzado en 2021. Observa principalmente en infrarrojo. astronomIA muestra observaciones JWST cuando están disponibles para el objeto consultado.",
      },
      {
        term: "JPL Horizons",
        definition:
          "Servicio del Jet Propulsion Lab (NASA) que provee efemérides ultra-precisas de cuerpos del Sistema Solar (planetas, lunas, cometas, asteroides). astronomIA lo consulta para planificar observaciones de planetas.",
      },
    ],
  },
];

// Normaliza texto para búsqueda: minúsculas + sin acentos.
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function HelpButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Cerrar con tecla ESC.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Evitar scroll del body cuando el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Filtrar contenido según la query (busca en término, definición y ejemplo).
  const filtered = useMemo(() => {
    if (!query.trim()) return HELP_CONTENT;
    const q = normalize(query);
    return HELP_CONTENT.map((cat) => ({
      ...cat,
      entries: cat.entries.filter(
        (e) =>
          normalize(e.term).includes(q) ||
          normalize(e.definition).includes(q) ||
          (e.example ? normalize(e.example).includes(q) : false)
      ),
    })).filter((cat) => cat.entries.length > 0);
  }, [query]);

  return (
    <>
      {/* Botón flotante: pequeño, semitransparente, esquina inferior derecha. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir ayuda y glosario"
        title="Ayuda y glosario de términos"
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-lg backdrop-blur transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* Modal: aparece solo si open=true. */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Ayuda y glosario de astronomIA"
        >
          <div
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card text-foreground shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Ayuda y glosario
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Definiciones, ejemplos y cómo aprovechar al máximo astronomIA.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar ayuda"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar un término (ej: Sérsic, isofotas, airmass, fase lunar...)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* Content (scrollable) */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-6">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-12 text-sm">
                  No encontramos ningún término que coincida con "{query}".
                </div>
              ) : (
                filtered.map((cat) => (
                  <section key={cat.id}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{cat.emoji}</span>
                      <h3 className="text-base font-semibold text-foreground">
                        {cat.title}
                      </h3>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                    <div className="space-y-2.5">
                      {cat.entries.map((entry) => (
                        <div
                          key={entry.term}
                          className="rounded-lg border border-border bg-muted/30 p-3"
                        >
                          <div className="text-sm font-semibold text-foreground mb-1">
                            {entry.term}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {entry.definition}
                          </p>
                          {entry.example && (
                            <p className="mt-2 text-xs text-primary/90 italic leading-relaxed">
                              💡 {entry.example}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}

              {/* Créditos del TFM — siempre visibles al final del contenido. */}
              <div className="mt-6 pt-5 border-t border-border text-center text-xs text-muted-foreground leading-relaxed space-y-2">
                <p>
                  Esta solución hace parte del{" "}
                  <span className="text-foreground font-medium">
                    Trabajo de Fin de Máster
                  </span>{" "}
                  del{" "}
                  <span className="text-foreground font-medium">
                    Máster Universitario en Astrofísica y Técnicas de
                    Observación Astronómica
                  </span>
                  , presentado en la{" "}
                  <span className="text-foreground font-medium">
                    Universidad Internacional de La Rioja (UNIR)
                  </span>{" "}
                  en{" "}
                  <span className="text-foreground font-medium">2026</span>.
                </p>
                <p>
                  Autores:{" "}
                  <span className="text-foreground font-medium">
                    Daniel Anchuela
                  </span>{" "}
                  y{" "}
                  <span className="text-foreground font-medium">
                    María Ilse Dovale
                  </span>
                  .
                </p>
                <p>
                  Directora:{" "}
                  <span className="text-foreground font-medium">
                    PhD. Francesca Pinna
                  </span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3 text-center text-[11px] text-muted-foreground">
              Pulsa{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono">
                Esc
              </kbd>{" "}
              o click fuera para cerrar
            </div>
          </div>
        </div>
      )}
    </>
  );
}