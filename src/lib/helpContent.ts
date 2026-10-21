// Content of the "Ayuda y glosario" (help and glossary) modal, in Spanish and English.
// Every new feature adds its entry here, in both languages.
// Definitions are written in plain language. An entry MAY have an "example" that
// shows how the term is used in astronomIA or how to phrase a request.

export type HelpEntry = {
  term: string;
  definition: string;
  example?: string;
};

export type HelpCategory = {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  entries: HelpEntry[];
};

export const HELP_CONTENT_ES: HelpCategory[] = [
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
          'Ejemplos: "Muéstrame M31", "Analiza M51", "Analiza la morfología completa de NGC 1300".',
      },
      {
        term: "Planificación de una observación",
        definition:
          "Para saber CUÁNDO y CÓMO observar un objeto desde tu ubicación: ventana de visibilidad, altitud máxima, fase lunar, clima, etc. Necesita objeto + lugar + fecha (si no, te los pregunta).",
        example:
          'Ejemplos: "Quiero ver Júpiter esta noche desde Córdoba", "Carta de visibilidad de M51 desde Madrid mañana", "¿Cuándo puedo observar Saturno desde Barcelona?".',
      },
      {
        term: "Pregunta informativa general",
        definition:
          "Para conocer datos básicos de un objeto sin abrir el visor ni planificar.",
        example:
          'Ejemplos: "¿Qué es UGC 10214?", "Cuéntame sobre la galaxia del Sombrero", "¿Cuál es la distancia de M87?".',
      },
      {
        term: "Idioma (ES | EN)",
        definition:
          'astronomIA funciona en español y en inglés. Cambia el idioma de la interfaz con el botón ES | EN junto al logo, en la barra lateral (la primera vez se usa el idioma de tu navegador). Las respuestas siguen el idioma en que escribes: si escribes en inglés, te responde en inglés aunque la interfaz esté en español. Si tu mensaje no deja claro el idioma (por ejemplo, solo "M31"), se usa el de tus mensajes anteriores y, si no, el del botón.',
        example: 'Ejemplo: "What can I see tonight from Madrid?" → respuesta en inglés.',
      },
      {
        term: "Si un servicio no responde",
        definition:
          "astronomIA depende de servicios externos (catálogos astronómicos, imágenes de surveys, efemérides, meteorología y modelos de lenguaje). Si alguno falla, verás un aviso de que esa parte está teniendo problemas y una sugerencia de otra función que sí puedes usar mientras tanto. El equipo recibe un aviso automático con el diagnóstico para arreglarlo. Si el problema sigue, vuelve a intentarlo en unos minutos.",
      },
      {
        term: "Botones de análisis",
        definition:
          'Cuando pides ver un objeto (por ejemplo "Muéstrame M51"), astronomIA lo abre en el visor y te ofrece botones con los análisis disponibles: morfología completa, segmentación e isofotas, fotometría básica y perfil de brillo. Ajusta antes el encuadre, el zoom y la banda en el visor, y haz clic en el análisis que quieras. También puedes seguir escribiendo para pedir algo más específico.',
        example: 'Ejemplo: "Muéstrame M51" → botón "Perfil de brillo".',
      },
      {
        term: "Frase mágica: morfología completa",
        definition:
          'Si pides "Analiza la morfología completa de X", obtienes el paquete entero: estructura, isofotas, parámetros CAS, perfil de brillo, ajuste de Sérsic y descripción narrativa. Es el análisis más exhaustivo que ofrece la app.',
        example: 'Ejemplo: "Analiza la morfología completa de M51".',
      },
    ],
  },
  {
    id: "privacidad",
    title: "Privacidad, datos e inteligencia artificial",
    emoji: "🔒",
    description:
      "Qué hace la inteligencia artificial en astronomIA, qué datos se guardan y para qué.",
    entries: [
      {
        term: "Modelos de lenguaje (IA): puede cometer errores",
        definition:
          "astronomIA usa modelos de lenguaje de OpenAI para entender tu pregunta y redactar la respuesta. Los cálculos (posiciones, horarios, fase lunar, clima) los hace el sistema con fuentes astronómicas y meteorológicas, pero el texto puede contener errores u omisiones. Comprueba los datos importantes antes de planificar una salida.",
      },
      {
        term: "Qué datos guardamos",
        definition:
          "El texto de tus consultas y lo que el sistema entendió (objeto, lugar y fecha), si la respuesta funcionó y cuánto tardó, el tipo de navegador, el idioma de la respuesta, y las valoraciones o comentarios que envíes. El correo con el que entras y tu historial de chats no se guardan en el servidor: se quedan en tu navegador.",
      },
      {
        term: "Para qué los usamos",
        definition:
          "Para mejorar astronomIA y analizar su uso de forma agregada, en el marco del Trabajo de Fin de Máster. No se usan con fines comerciales.",
      },
      {
        term: "Servicios externos",
        definition:
          "Para responder, el texto de tu consulta se envía a OpenAI. Los nombres de objetos, lugares y coordenadas se consultan en servicios científicos y meteorológicos: SIMBAD (CDS), JPL Horizons, SDSS, SkyView, MAST y Open-Meteo. No escribas datos personales en tus consultas.",
      },
      {
        term: "Correo de contacto (opcional)",
        definition:
          "Solo si en el formulario de comentarios marcas que quieres que te contactemos, guardamos el correo que escribas, y únicamente para responderte.",
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
          "Cómo se distribuye la luz dentro de la galaxia: si hay núcleo concentrado, disco extendido, brazos visibles o características irregulares.",
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
          "Radio efectivo o radio de semiluz. Es el radio dentro del cual se encuentra la mitad de la luz total de la galaxia. Sirve como medida estandarizada de tamaño.",
      },
      {
        term: "Tipo morfológico (Hubble)",
        definition:
          "Clasificación clásica de galaxias: E (elípticas), S (espirales), SA (espirales sin barra), SB (espirales barradas), SAB (intermedias), S0 (lenticulares), Irr (irregulares). Las espirales se subdividen en Sa, Sb y Sc según la prominencia de los brazos.",
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
          "Resumen completo de cuándo y cómo podrás ver un objeto desde tu ubicación: a qué hora sale, cuándo culmina, qué altitud alcanzará y cómo afectan la Luna y el clima.",
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
          "Dirección horizontal del objeto, medida en grados desde el norte hacia el este. 0° = norte, 90° = este, 180° = sur, 270° = oeste.",
      },
      {
        term: "Airmass (masa de aire)",
        definition:
          "Cantidad de atmósfera que la luz del objeto atraviesa para llegar a tu telescopio. 1.0 = objeto en el cenit (mínima atmósfera); a 30° de altitud es ~2.0 (el doble de atmósfera); por debajo crece rápido y la imagen empeora.",
      },
      {
        term: "Crepúsculo astronómico",
        definition:
          "Momento en que el Sol está 18° o más por debajo del horizonte. A partir de ahí el cielo está lo suficientemente oscuro para observar objetos débiles como galaxias y nebulosas.",
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
        term: "Meteorología de la noche",
        definition:
          "Nubosidad, viento, humedad y temperatura se calculan para las horas en que tu objeto es observable esa noche. Si no hay una ventana clara, se usa toda la noche, de la puesta a la salida del sol, en hora local del lugar (en latitudes altas en verano puede ser muy corta). Hasta unos 15 días se usa un pronóstico; para fechas más lejanas, los datos de las mismas fechas del año anterior como referencia.",
      },
      {
        term: "Seeing",
        definition:
          "Calidad de la atmósfera en términos de estabilidad. Buen seeing = imagen estable y nítida; mal seeing = imagen 'temblona'. Depende de turbulencias en la atmósfera y de tu altitud sobre el nivel del mar.",
      },
      {
        term: "Contaminación lumínica",
        definition:
          "Brillo artificial del cielo nocturno por luces urbanas. Reduce el contraste y hace casi invisibles los objetos débiles. Cielos rurales muy oscuros son ideales para fotografía de cielo profundo.",
      },
      {
        term: "Sol de medianoche",
        definition:
          "Fenómeno en latitudes muy al norte o muy al sur (cerca de los círculos polares) donde, en ciertas fechas, el Sol no se pone durante 24 horas. No hay noche y no se puede observar.",
      },
      {
        term: "Noche polar",
        definition:
          "Lo opuesto al sol de medianoche: el Sol no sale en 24 horas. Hay oscuridad continua, ideal para observar, pero solo si el objeto se eleva sobre el horizonte desde esa latitud extrema.",
      },
    ],
  },
  {
    id: "luna",
    title: "Fases y observación lunar",
    emoji: "🌙",
    description:
      "Cómo afecta la Luna a tu observación y qué significan las fases que aparecen en las respuestas.",
    entries: [
      {
        term: "Iluminación lunar (%)",
        definition:
          "Porcentaje de la cara visible de la Luna que está iluminada por el Sol. 0 % = luna nueva (invisible), 100 % = luna llena. Varía día a día.",
      },
      {
        term: "Luna nueva",
        definition:
          "Luna no iluminada (0 %). La cara visible está completamente en sombra. Es la mejor fase para observar cielo profundo: el cielo está más oscuro.",
      },
      {
        term: "Creciente / Cuarto creciente / Gibosa creciente",
        definition:
          "Fases entre luna nueva y luna llena. La iluminación va creciendo cada noche. Desde el hemisferio norte, el lado iluminado está a la DERECHA.",
      },
      {
        term: "Luna llena",
        definition:
          "Luna 100 % iluminada. Magnífica para observación selenográfica (cráteres, mares), pero el cielo se vuelve demasiado claro para objetos débiles.",
      },
      {
        term: "Gibosa menguante / Cuarto menguante / Menguante",
        definition:
          "Fases entre luna llena y luna nueva. La iluminación va decreciendo. Desde el hemisferio norte, el lado iluminado está a la IZQUIERDA.",
      },
      {
        term: "Impacto lunar",
        definition:
          "Cuánto interfiere la luz de la Luna con tu observación. 'Alto' cerca de luna llena (mal para objetos débiles); 'bajo' cerca de luna nueva (cielo más oscuro). 'Moderado' en las fases intermedias.",
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
        term: "RA (Right Ascension / ascensión recta)",
        definition:
          "Coordenada celeste análoga a la longitud terrestre. Mide la posición este-oeste del objeto en el cielo. Va de 0 h a 24 h (o de 0° a 360°).",
      },
      {
        term: "Dec (Declination / declinación)",
        definition:
          "Coordenada celeste análoga a la latitud terrestre. Mide la posición norte-sur del objeto. Va de -90° (polo sur celeste) a +90° (polo norte celeste).",
      },
      {
        term: "J2000",
        definition:
          "Sistema de referencia con época del 1 de enero de 2000. Las coordenadas se dan en este sistema porque los puntos de referencia rotan lentamente (precesión) y necesitamos una época fija para comparar entre catálogos.",
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
        term: "Constelación frente a asterismo",
        definition:
          "Una constelación es una región oficial del cielo (hay 88). Un asterismo es un grupo de estrellas reconocible que NO es una constelación oficial: por ejemplo, el Triángulo de Verano o el Cinturón de Orión.",
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
          "Catálogo de J. L. E. Dreyer (1888) con casi 8000 objetos no estelares. Mucho más extenso que Messier. Ejemplos: NGC 1300 (espiral barrada), NGC 4565 (galaxia de la Aguja).",
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
          "Servicio del Jet Propulsion Lab (NASA) que provee efemérides ultraprecisas de cuerpos del sistema solar (planetas, lunas, cometas, asteroides). astronomIA lo consulta para planificar observaciones de planetas.",
      },
    ],
  },
];

export const HELP_CONTENT_EN: HelpCategory[] = [
  {
    id: "como-usar",
    title: "How to use astronomIA",
    emoji: "🔭",
    description:
      "Three kinds of requests the app understands. If you ask for something and the answer is not what you expected, try rephrasing it like these examples.",
    entries: [
      {
        term: "Analysis of a galaxy or deep-sky object",
        definition:
          "To see a galaxy, nebula or cluster in the viewer and, optionally, extract its morphological and photometric properties, isophotes, etc.",
        example: 'Examples: "Show me M31", "Analyse M51", "Analyse the full morphology of NGC 1300".',
      },
      {
        term: "Observation planning",
        definition:
          "To know WHEN and HOW to observe an object from your location: visibility window, maximum altitude, moon phase, weather, etc. It needs object + place + date (if one is missing, it asks you).",
        example:
          'Examples: "I want to see Jupiter tonight from Córdoba", "Visibility chart of M51 from Madrid tomorrow", "When can I observe Saturn from Barcelona?".',
      },
      {
        term: "General information question",
        definition: "To learn basic facts about an object without opening the viewer or planning.",
        example: 'Examples: "What is UGC 10214?", "Tell me about the Sombrero galaxy", "What is the distance to M87?".',
      },
      {
        term: "Language (ES | EN)",
        definition:
          'astronomIA works in Spanish and in English. Change the interface language with the ES | EN button next to the logo in the sidebar (the first time, your browser language is used). Answers follow the language you write in: if you write in Spanish, it answers in Spanish even if the interface is in English. If your message does not make the language clear (for example, just "M31"), your previous messages decide and, failing that, the button.',
        example: 'Example: "¿Qué puedo ver esta noche desde Madrid?" → answer in Spanish.',
      },
      {
        term: "If a service does not respond",
        definition:
          "astronomIA relies on external services (astronomical catalogues, survey images, ephemerides, weather and language models). If one fails, you will see a notice that this part is having problems and a suggestion of another feature you can use in the meantime. The team receives an automatic alert with the diagnosis to fix it. If the problem continues, try again in a few minutes.",
      },
      {
        term: "Analysis buttons",
        definition:
          'When you ask to see an object (for example "Show me M51"), astronomIA opens it in the viewer and offers buttons with the available analyses: full morphology, segmentation and isophotes, basic photometry and brightness profile. First adjust the framing, zoom and band in the viewer, then click the analysis you want. You can also keep typing to ask for something more specific.',
        example: 'Example: "Show me M51" → "Brightness profile" button.',
      },
      {
        term: "Magic phrase: full morphology",
        definition:
          'If you ask "Analyse the full morphology of X", you get the whole package: structure, isophotes, CAS parameters, brightness profile, Sérsic fit and a narrative description. It is the most complete analysis the app offers.',
        example: 'Example: "Analyse the full morphology of M51".',
      },
    ],
  },
  {
    id: "privacidad",
    title: "Privacy, data and artificial intelligence",
    emoji: "🔒",
    description: "What artificial intelligence does in astronomIA, what data is stored and why.",
    entries: [
      {
        term: "Language models (AI): they can make mistakes",
        definition:
          "astronomIA uses OpenAI language models to understand your question and write the answer. The calculations (positions, times, moon phase, weather) are done by the system with astronomical and weather sources, but the text can contain errors or omissions. Check important information before planning a night out.",
      },
      {
        term: "What data we store",
        definition:
          "The text of your requests and what the system understood (object, place and date), whether the answer worked and how long it took, the type of browser, the language of the answer, and any ratings or comments you send. The email you sign in with and your chat history are not stored on the server: they stay in your browser.",
      },
      {
        term: "What we use it for",
        definition:
          "To improve astronomIA and to analyse its use in aggregate, as part of the Master's Thesis. It is not used for commercial purposes.",
      },
      {
        term: "External services",
        definition:
          "To answer, the text of your request is sent to OpenAI. Object names, places and coordinates are looked up in scientific and weather services: SIMBAD (CDS), JPL Horizons, SDSS, SkyView, MAST and Open-Meteo. Do not write personal data in your requests.",
      },
      {
        term: "Contact email (optional)",
        definition:
          "Only if you tick in the feedback form that you want us to contact you do we store the email you write, and only to reply to you.",
      },
    ],
  },
  {
    id: "analisis-morfologico",
    title: "Morphological analysis of galaxies",
    emoji: "🔬",
    description: "Terms that appear in the answers of the analysis module (galaxies and deep sky).",
    entries: [
      {
        term: "Morphology",
        definition:
          "Overall shape and structure of a galaxy: whether it is elongated or round, whether it has spiral arms, a central bar, asymmetries, etc.",
      },
      {
        term: "Structure",
        definition:
          "How light is distributed within the galaxy: whether there is a concentrated nucleus, an extended disc, visible arms or irregular features.",
      },
      {
        term: "Ellipticity",
        definition:
          "Measures how flattened or circular the image of the object is. 0 = perfectly circular; values close to 1 = very elongated. An edge-on spiral has a high ellipticity.",
      },
      {
        term: "Segmentation",
        definition:
          "Isolating the galaxy from the sky background, ignoring nearby stars and noise. It is like cutting out with scissors only the part of the image that belongs to your object.",
      },
      {
        term: "Isophotes",
        definition:
          "Curves that join points of equal brightness in the image, like the contour lines of a topographic map. Each ellipse traces a ring of constant brightness around the galaxy.",
        example:
          'In the answers you will see something like: "Isophotes for M51: 12 fitted ellipses (sma=21.3–158.0 px, mean ellipticity 0.180)".',
      },
      {
        term: "SMA (semi-major axis)",
        definition:
          "Semi-major axis of an isophote, in pixels. It is basically the radius of the ellipse along its longest direction.",
      },
      {
        term: "Photometry",
        definition:
          "Measurement of the amount of light the object emits. It tells you how much brightness there is in each area or ring of the galaxy.",
      },
      {
        term: "Brightness profile",
        definition:
          "Plot that shows how brightness falls from the centre towards the edges. In most galaxies the centre is very bright and brightness drops exponentially as you move away.",
      },
      {
        term: "CAS parameters",
        definition:
          "Three numbers that summarise morphology quantitatively. C, A and S stand for Concentration, Asymmetry and Smoothness.",
      },
      {
        term: "C — Concentration",
        definition:
          "How concentrated the light is in the centre compared with the edges. High values = galaxy with a very dense nucleus (typical of ellipticals and prominent bulges).",
      },
      {
        term: "A — Asymmetry",
        definition:
          "How much the galaxy differs from its own image rotated by 180°. High values reveal mergers, twisted arms or irregularities.",
      },
      {
        term: "S — Smoothness",
        definition:
          'How "smooth" or grainy the image looks. Galaxies with many active star-forming regions show fine structure (high S). Old ellipticals are smoother (low S).',
      },
      {
        term: "Sérsic index (n)",
        definition:
          'Number that describes the shape of the brightness profile. n≈1 is typical of spiral galaxies (exponential profile); n≈4 is typical of elliptical galaxies (de Vaucouleurs law). It is like a "barcode" of the galaxy type.',
      },
      {
        term: "r_half",
        definition:
          "Effective radius or half-light radius. It is the radius that contains half of the total light of the galaxy. It is used as a standard measure of size.",
      },
      {
        term: "Morphological type (Hubble)",
        definition:
          "Classic classification of galaxies: E (elliptical), S (spiral), SA (unbarred spiral), SB (barred spiral), SAB (intermediate), S0 (lenticular), Irr (irregular). Spirals are subdivided into Sa, Sb and Sc according to how prominent the arms are.",
      },
      {
        term: "AGN (active galactic nucleus)",
        definition:
          "Galaxy whose central supermassive black hole is swallowing material and emitting huge amounts of light. Common subtypes: Sy1, Sy2 (Seyfert galaxies), LINER, blazar, quasar.",
      },
      {
        term: "Sy2 (Seyfert type 2)",
        definition: "Type of AGN whose broad spectral lines are hidden by dust. M51 is a classic example.",
      },
    ],
  },
  {
    id: "planificacion",
    title: "Observation planning",
    emoji: "📅",
    description: "Terms that appear in the visibility charts and night planning.",
    entries: [
      {
        term: "Visibility chart / observation chart",
        definition:
          "Complete summary of when and how you will be able to see an object from your location: when it rises, when it culminates, how high it will get and how the Moon and the weather affect it.",
        example: 'Example: "I want the visibility chart of M31 from Granada tonight".',
      },
      {
        term: "Observation window",
        definition:
          "Time interval in which the object is high enough above the horizon AND the night is dark enough to see it. It is the useful time to point the telescope.",
      },
      {
        term: "Transit (culmination)",
        definition:
          "Moment when an object reaches its highest point in the sky from your location. It is the best time to observe because the light crosses the least amount of atmosphere.",
      },
      {
        term: "Altitude",
        definition:
          "Angle of the object above the horizon, in degrees. 0° = on the horizon, 90° = right above you (zenith). Below ~10-20° the atmosphere distorts the image a lot.",
      },
      {
        term: "Azimuth",
        definition:
          "Horizontal direction of the object, measured in degrees from north towards east. 0° = north, 90° = east, 180° = south, 270° = west.",
      },
      {
        term: "Airmass",
        definition:
          "Amount of atmosphere the light of the object crosses to reach your telescope. 1.0 = object at the zenith (least atmosphere); at 30° altitude it is ~2.0 (twice the atmosphere); lower down it grows quickly and the image gets worse.",
      },
      {
        term: "Astronomical twilight",
        definition:
          "Moment when the Sun is 18° or more below the horizon. From then on the sky is dark enough to observe faint objects such as galaxies and nebulae.",
      },
      {
        term: "Astronomical night",
        definition:
          "Period between the end of evening astronomical twilight and the start of morning astronomical twilight. The 'true dark night' for astronomers.",
      },
      {
        term: "Rises / Sets",
        definition:
          "Time at which the object crosses the horizon going up (rises) or down (sets). For deep-sky objects the app usually says 'rises above 10°' because below that it cannot be observed.",
      },
      {
        term: "Weather for the night",
        definition:
          "Cloud cover, wind, humidity and temperature are computed for the hours when your object is observable that night. If there is no clear window, the whole night is used, from sunset to sunrise, in the local time of the place (at high latitudes in summer it can be very short). Up to about 15 days ahead a forecast is used; for later dates, the data for the same dates of the previous year as a reference.",
      },
      {
        term: "Seeing",
        definition:
          "Quality of the atmosphere in terms of stability. Good seeing = steady, sharp image; bad seeing = 'shaky' image. It depends on turbulence in the atmosphere and on your altitude above sea level.",
      },
      {
        term: "Light pollution",
        definition:
          "Artificial brightness of the night sky caused by city lights. It reduces contrast and makes faint objects almost invisible. Very dark rural skies are ideal for deep-sky photography.",
      },
      {
        term: "Midnight sun",
        definition:
          "Phenomenon at very northern or southern latitudes (near the polar circles) where, on certain dates, the Sun does not set for 24 hours. There is no night and you cannot observe.",
      },
      {
        term: "Polar night",
        definition:
          "The opposite of the midnight sun: the Sun does not rise for 24 hours. There is continuous darkness, ideal for observing, but only if the object rises above the horizon at that extreme latitude.",
      },
    ],
  },
  {
    id: "luna",
    title: "Moon phases and lunar observation",
    emoji: "🌙",
    description: "How the Moon affects your observation and what the phases in the answers mean.",
    entries: [
      {
        term: "Moon illumination (%)",
        definition:
          "Percentage of the visible face of the Moon lit by the Sun. 0 % = new moon (invisible), 100 % = full moon. It changes day by day.",
      },
      {
        term: "New moon",
        definition:
          "Unlit Moon (0 %). The visible face is completely in shadow. It is the best phase for observing the deep sky: the sky is darker.",
      },
      {
        term: "Waxing crescent / First quarter / Waxing gibbous",
        definition:
          "Phases between new moon and full moon. The illumination grows every night. From the northern hemisphere, the lit side is on the RIGHT.",
      },
      {
        term: "Full moon",
        definition:
          "Moon 100 % lit. Great for observing the Moon itself (craters, maria), but the sky becomes too bright for faint objects.",
      },
      {
        term: "Waning gibbous / Last quarter / Waning crescent",
        definition:
          "Phases between full moon and new moon. The illumination decreases. From the northern hemisphere, the lit side is on the LEFT.",
      },
      {
        term: "Moon impact",
        definition:
          "How much moonlight interferes with your observation. 'High' near full moon (bad for faint objects); 'low' near new moon (darker sky). 'Moderate' in the phases in between.",
      },
    ],
  },
  {
    id: "propiedades",
    title: "Object properties",
    emoji: "⭐",
    description: "Magnitudes, coordinates and other numerical data that appear in the answers.",
    entries: [
      {
        term: "Apparent magnitude",
        definition:
          "Brightness scale of objects as seen from Earth. NOTE: the scale is REVERSED — the SMALLER the number, the BRIGHTER the object. Sirius (m=-1.46) is the brightest star in the sky; M31 (m=3.4) is visible to the naked eye; M51 (m=8.0) needs binoculars; objects with m>13 need a medium telescope.",
      },
      {
        term: "Redshift (z)",
        definition:
          "How much the light of a distant object is 'stretched' by the expansion of the universe. z=0 means the object is practically at rest relative to us; z=0.05 means a large recession velocity (a very distant object). It is like the Doppler effect applied to light.",
      },
      {
        term: "Radial velocity",
        definition:
          "Speed at which an object moves away from us (positive) or towards us (negative). It is measured in km/s and related to redshift through the expansion of the universe.",
      },
      {
        term: "RA (Right Ascension)",
        definition:
          "Celestial coordinate similar to longitude on Earth. It measures the east-west position of the object in the sky. It goes from 0 h to 24 h (or from 0° to 360°).",
      },
      {
        term: "Dec (Declination)",
        definition:
          "Celestial coordinate similar to latitude on Earth. It measures the north-south position of the object. It goes from -90° (south celestial pole) to +90° (north celestial pole).",
      },
      {
        term: "J2000",
        definition:
          "Reference system with epoch 1 January 2000. Coordinates are given in this system because the reference points rotate slowly (precession) and a fixed epoch is needed to compare catalogues.",
      },
      {
        term: "Constellation",
        definition:
          "One of the 88 official regions the sky is divided into. Every object belongs to a constellation, which helps to find it: 'M31 is in Andromeda', 'M51 is in Canes Venatici'.",
      },
    ],
  },
  {
    id: "objetos",
    title: "Types of sky objects",
    emoji: "🌌",
    description: "Kinds of objects the app can analyse or plan to observe.",
    entries: [
      {
        term: "Spiral galaxy",
        definition:
          "Galaxy with visible spiral arms, such as the Milky Way, M31 (Andromeda) or M51 (Whirlpool). They are classified as SA (unbarred) and SB (with a central bar).",
      },
      {
        term: "Elliptical galaxy (E)",
        definition:
          "Spheroidal galaxy with no visible spiral structure. It is usually old, with little gas and little new star formation. Example: M87.",
      },
      {
        term: "Irregular galaxy",
        definition:
          "Galaxy with no defined shape. They are usually small and are often the result of interactions or mergers with other galaxies. Example: UGC 10214 (the Tadpole galaxy).",
      },
      {
        term: "Lenticular galaxy (S0)",
        definition:
          "In between a spiral and an elliptical: it has a disc like spirals but no visible arms. Like a flat hat.",
      },
      {
        term: "Emission nebula",
        definition:
          "Cloud of gas that emits its own light (typically red, from the H-alpha line of hydrogen). They are often stellar nurseries. Example: M42 (Orion).",
      },
      {
        term: "Reflection nebula",
        definition:
          "Cloud of dust that reflects the light of nearby stars (typically bluish). Example: the nebulosity around the Pleiades.",
      },
      {
        term: "Planetary nebula",
        definition:
          "Shell of gas expelled by a dying Sun-like star at the end of its life. It has nothing to do with planets — the name comes from its round look in small telescopes. Examples: M57 (Ring), M97 (Owl).",
      },
      {
        term: "Open cluster",
        definition:
          "Group of hundreds to thousands of young stars, loosely bound by gravity. They are usually in the disc of the galaxy. Examples: M45 (Pleiades), M44 (Beehive).",
      },
      {
        term: "Globular cluster",
        definition:
          "Spherical group of hundreds of thousands of old stars, tightly bound. They orbit in the halo of the galaxy. Examples: Omega Centauri, M13 (Hercules).",
      },
      {
        term: "Variable star",
        definition:
          "Star whose brightness changes over time, either for internal reasons (pulsations, spots) or external ones (eclipses by a companion).",
      },
      {
        term: "Constellation versus asterism",
        definition:
          "A constellation is an official region of the sky (there are 88). An asterism is a recognisable group of stars that is NOT an official constellation: for example, the Summer Triangle or Orion's Belt.",
      },
    ],
  },
  {
    id: "catalogos",
    title: "Astronomical catalogues",
    emoji: "📚",
    description: "The abbreviations you will see in object names (M, NGC, IC...) and where the data comes from.",
    entries: [
      {
        term: "M (Messier)",
        definition:
          "Catalogue of the French astronomer Charles Messier (18th century). 110 bright objects within reach of amateurs with modest equipment. Examples: M31 (Andromeda), M42 (Orion), M45 (Pleiades).",
      },
      {
        term: "NGC (New General Catalogue)",
        definition:
          "Catalogue by J. L. E. Dreyer (1888) with almost 8000 non-stellar objects. Much larger than Messier. Examples: NGC 1300 (barred spiral), NGC 4565 (Needle galaxy).",
      },
      {
        term: "IC (Index Catalogue)",
        definition:
          "Supplements to the NGC with ~5000 additional objects discovered at the end of the 19th and the beginning of the 20th century.",
      },
      {
        term: "UGC (Uppsala General Catalogue)",
        definition:
          "Catalogue of galaxies visible from the northern hemisphere made in Uppsala (Sweden). Famous example: UGC 10214 (the Tadpole galaxy, a galaxy merger).",
      },
      {
        term: "MCG, PGC, CGCG",
        definition:
          "Other galaxy catalogues, less famous but important for faint objects. You will see them when you ask about galaxies that are not in Messier or NGC.",
      },
      {
        term: "SIMBAD",
        definition:
          "Astronomical database of the CDS (Centre de Données astronomiques de Strasbourg). It gathers identifiers, positions, magnitudes and other basic properties of millions of objects. astronomIA uses it to resolve names.",
      },
      {
        term: "SDSS (Sloan Digital Sky Survey)",
        definition:
          "Imaging survey that covers a large part of the sky in several colours (u, g, r, i, z). astronomIA uses its images for the viewer and the morphological analysis.",
      },
      {
        term: "DSS2 (Digitized Sky Survey 2)",
        definition:
          "Digitised version of photographic plates from Schmidt telescopes. It covers almost the whole sky in blue and red filters. Useful for objects not covered by SDSS.",
      },
      {
        term: "HST (Hubble Space Telescope)",
        definition:
          "Telescope in orbit launched by NASA and ESA. If an object was observed by Hubble, astronomIA can show which instrument (WFPC2, ACS, WFC3) and filter were used.",
      },
      {
        term: "JWST (James Webb Space Telescope)",
        definition:
          "Hubble's successor, launched in 2021. It observes mainly in the infrared. astronomIA shows JWST observations when they are available for the requested object.",
      },
      {
        term: "JPL Horizons",
        definition:
          "Service of the Jet Propulsion Laboratory (NASA) that provides very precise ephemerides of Solar System bodies (planets, moons, comets, asteroids). astronomIA uses it to plan observations of planets.",
      },
    ],
  },
];

export const HELP_CONTENT = { es: HELP_CONTENT_ES, en: HELP_CONTENT_EN } as const;
