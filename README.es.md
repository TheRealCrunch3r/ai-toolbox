<div align="center">
<a href="README.md">English</a> · <a href="README.de.md">Deutsch</a> · <b>Español</b> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a><br/>
<h1>AI Toolbox — Plugin todo-en-uno de agentes y herramientas de IA autónomos para LLMs locales en LM Studio</h1><hr/>
<b>Dale manos reales a tu LLM local.</b> El plugin más completo del Hub de LM Studio — convierte cualquier modelo local en un agente de IA capaz y autosuficiente.<br/>Contexto autogestionado mantiene vivas las sesiones maratón · un solo plugin, sin pegamento, completamente offline por defecto.
<br/><a href="#"><img src="https://img.shields.io/badge/version-v1.9.19-2f80ed?style=flat-square" alt="version v1.9.19"/></a> <a href="#the-tool-arsenal-113-tools-across-every-family-all-yours-to-toggle"><img src="https://img.shields.io/badge/tools-113%20ready--made-7c3aed?style=flat-square" alt="tools 113 ready-made"/></a> <a href="#quick-start-2-minutes"><img src="https://img.shields.io/badge/tests-71%20suites%20%C2%B7%201020%20green-3fb950?style=flat-square" alt="tests 71 suites · 1020 green"/></a> <a href="#"><img src="https://img.shields.io/badge/LM%20Studio-Hub%20plugin-e84393?style=flat-square" alt="LM Studio Hub plugin"/></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/TheRealCrunch3r/ai-toolbox?style=flat-square" alt="license MIT (live-verified from LICENSE)"/></a> <a href="#"><img src="https://img.shields.io/badge/runtime-Node%20%E2%89%A5%2020-83cd29?style=flat-square&logo=node.js" alt="runtime Node ≥ 20"/></a><br/>
<b>Docs:</b> <a href="DOCUMENTATION.md">Documentation</a> · <a href="QUICK_START.md">Quick Start</a> · <a href="ARCHITECTURE.md">Architecture</a> · <a href="TOOLS_REFERENCE.md">Tool Reference</a> · <a href="CHANGELOG_v4.md">Changelog</a><br/>
<a href="CONTRIBUTING.md">Contributing</a> · <a href="SECURITY.md">Security</a><br/>
<code>Instalación: copia la carpeta <b>dist/</b> en LM Studio → actívalo bajo Plugins (Node.js 20+)</code>
</div>


**Kit de herramientas de agentes IA para LM Studio** — 113 herramientas para LLMs locales: edición de archivos, búsqueda en la codebase, RAG, automatización del navegador, Git & GitHub.

**Dale manos reales a tu LLM local.** El plugin más completo del Hub de LM Studio — convierte cualquier modelo local en un agente IA capaz y auto-gestionado con edición segura de archivos, búsqueda a prueba de cuelgues, builds en segundo plano, automatización de navegador headless, flujos de Git & GitHub, OCR, gráficos y RAG semántico; el **contexto auto-gestionado** mantiene vivas las sesiones maraton. Un plugin, cero código pegajoso, totalmente offline por defecto.

> `v1.9.19` · `113 herramientas listas` · `1020 tests en verde (71 suites)` · `5 localizaciones` · `MIT` · `Node 20+`

> ⚠️ **Traducción** — Versión española de [README.md](README.md). El inglés es la versión canónica; en caso de divergencia prevalece README.md. Mantener esta archivo sincronizado cuando el original cambie.

[!IMPORTANT] LM Studio NO admite actualizaciones automáticas. Si encuentras problemas, actualiza primero manualmente: elimina la versión actual y vuelve a descargarla desde el sitio del plugin. Ten en cuenta que LM Studio puede mostrar un tooltip de «ya instalado» aunque tu versión esté desactualizada.

## Contenido

[Por qué AI Toolbox (vs otros plugins)] · [Comparación directa] · [Resumen de funciones] · [Inicio rápido (2 minutos)] · [Configuración y conmutadores de herramientas — control total, cero código] · [Postura de seguridad — construido como si importara] · [Arquitectura para los curiosos] · [Arsenal: 113 herramientas] · [Destacados por release — historial completo en CHANGELOG_v4.md (activo), v1–v3 en docs/history/]

*Lista de secciones sin enlaces ancla; los títulos corresponden a las cabeceras más abajo.*

---

## Por qué AI Toolbox (vs otros plugins de LM Studio)

*Comparado contra un sondeo de agosto 2026 de ~115 plugins del Hub de LM Studio (~40 toolboxes, solo 9 con herramientas de archivo reales).*
**Leyenda:** 🥇 único en todo el campo · ⭐ raro (≤ unos pocos) · 🛡️ ingeniería de seguridad destacada

| Capacidad | Qué hace por ti | Posición en el campo |
|---|---|---|
| 🧠 **Contexto auto-gestionado** (`AutoTracker` + `ContextGuard`) | Los umbrales de tokens se disparan *a mitad de la cadena de herramientas* (75 % / 90 %), resumir y comprimir automáticamente la conversación antes del desborde — las sesiones largas del agente siguen funcionando en vez de morir. Detección de palabras clave del proyecto en el pipeline de prompts. | ⭐ **Ningún rival encuestado tiene gestión alguna de contexto/tokens** — todas las demás herramientas «memory» son CRUD plano de guardar/listar/buscar |
| 🌐 **Memoria entre proyectos** (`switch_context`, registro de proyectos) | Recuerda lo que *otro* proyecto registrado decidió la semana pasada. Puntuación recencia×frecuencia, poda TTL, conmutación previa confirmación (Step 0.7). | ⭐ **Ausente en todos los plugins encuestados** |
| 🏷️ **Resultados etiquetados por confianza + selección de herramientas consciente de clusters** (`confidenceTypes`, `toolPriority`) | Cada hecho auto-seguido se etiqueta EXTRACTED vs INFERRED vs AMBIGUOUS — así separas lo que el agente *sabe* de lo que está adivinando; y cuando 113 herramientas compiten por un turno, la prioridad consciente de clusters mantiene a las correctas al alcance bajo los límites gramaticales. | 🥇 **Ningún rival encuestado etiqueta la confianza del resultado** — y ninguno cabe con tantas herramientas sin soltarlas en los límites de contexto |
| 🧬 **Refactorización basada en AST** (`refactor_code`) | Rename / mover-función / extraer-función / limpieza de imports muertos — transformaciones AST seguras sintácticamente con **rollback automático ante fallo**, no hackeo textual con regex. | 🥇 **La única refactorización basada en AST entre ~115 plugins encuestados** |
| 🔍 **Búsqueda que no puede colgarse** (`ripgrep`, `find_replace_all`) | ripgrep nativo en un worker aislado fuera de la hilo del host con watchdog de 3 s en tiempo real; regexes del dialecto Rust degradadas automáticamente a cadenas fijas y anunciado vía `pattern_mode`; reemplazo multi-archivo en modo prueba. | 🛡️ Los rivales traen bucles grep sin límite — esta no puede girar para siempre físicamente |
| 💾 **Edición segura de archivos** (`replace_text_in_file`, `line_operations`) | Backup `.bak` en cada edición, inserciones ancladas a patrón, verificación por huella digital de líneas, comprobación MD5 de integridad tras la escritura. Restaurar cualquier archivo en una llamada (`restore_from_bak`). | 🛡️ **3 capas de salvaguardas** contra corrupción por números de línea obsoletos — los rivales ofrecen a lo sumo sim de backup por renombrado |
| ⏸️ **Comandos en segundo plano no bloqueantes** (`run_background_command` + monitor/cancel) | Lanza builds y trabajos largos, sigue chateando, consulta el estado cuando quieras, cancela si hace falta. Sin Docker necesario. | ⭐ Los rivales más cercanos **requieren Docker**; esta se ejecuta nativa en el host del plugin |
| 🌍 **Automatización real de navegador** (suite Puppeteer) | Chromium headless con sesiones persistentes e interacción de UI — no una llamada única de «obtener página». | Los plugins rivales de «visitar web» son ⚠️ *solo raspadores estáticos* |
| 📊 **RAG semántico local, cualquier formato** (`rag_index_pdf/docx/xlsx`, `rag_query_vector`, `rag_web_content`) | Indexa PDFs, documentos Word y hojas de cálculo para búsqueda vectorial — más extracción web relevante a la consulta. Un único conjunto reemplaza los 2–4 plugins separados de los rivales. Nada sale de tu máquina. | 🛡️ Chunking acotado: **sin OOM con documentos de longitud tóxica** (verificado contra un PDF de 1690 páginas) |
| 🧪 **Ejecuta tu suite de tests por ti** (`run_tests`) | Detecta Jest / Mocha / Vitest automáticamente desde `package.json` y lo ejecuta, resultados de vuelta en el chat. | ⭐ Ninguna otra toolbox del campo hace esto |
| 📈 **Visualización de datos como llamada de herramienta** (`generate_chart`) | Barras / líneas / circular / dona / dispersión / radar → archivo de imagen, con fallback HTML cuando el renderizador no está disponible. | 🥇 **No existía ningún plugin de data-viz en todo el campo** al momento del sondeo |
| 🗺️ **Planificación estructurada con progreso en vivo** (`create_plan`, `get_plan`, `update_plan_step`) | Planes multi-paso seguidos a través de una máquina de estados real (pending → in_progress → done, reintentar bloqueado) con métricas de finalización. | ⭐ Raro — la mayoría de toolboxes no tienen ninguna primitiva de planificación |

---

## Comparación directa vs las herramientas LM Studio de Beledarian

El competidor directo más cercano en el Hub: mismo oficio (herramientas para LLMs locales), construcción muy distinta. Donde AI Toolbox se adelanta:

| Lo que AI Toolbox tiene y ellos no |
|---|
| ✅ **Refactorización a nivel AST** (renombrar, mover funciones, limpiar imports muertos) — transformaciones seguras sintácticamente con rollback automático, no ediciones de cadena |
| ✅ **RAG real:** índice vectorial local sobre PDF / DOCX / XLSX con procedencia por página — no solo búsqueda por palabras clave |
| ✅ **Imagen y data-viz:** OCR en capturas y tomas, metadatos + comparación de imágenes, generación de gráficos |
| ✅ **113 herramientas** vs ~49 — respaldadas por 1020 tests superados en 71 suites |
| ✅ **Escrituras resistentes a crash + rollback ante fallo:** una edición fallida nunca puede corromper tu archivo |

Nuestra brecha de i18n anterior está cerrada: **ahora publicamos 5 localizaciones** (en · de · es · zh-CN · zh-TW), cada una un conjunto de traducción completo — y tests anti-stub custodian la suite para que los idiomas alias/fallback nunca regredan en silencio. Preferimos decírtelo a fingir que no existe.

---

## Míralo trabajar — Un turno, diez herramientas

> **Tú:** *«Refactoriza `auth.ts` — extrae la lógica de refresco del token a su propio módulo, mueve el helper junto a ella, ejecuta nuestra suite de tests y abre un PR si está en verde.»*
>
> → `refactor_code` (extracción AST + mover función, rollback automático armado) → `run_tests` (detectado **Jest** automáticamente: todo ✅) → `gh_create_pr` — **un turno. Cero copy-paste. Sin tutoreo.**

---

## Resumen de funciones

### Edición y búsqueda de archivos seguras
Reemplazo in-place · inserciones ancladas por línea · lecturas por chunks en archivos enormes · diffs · árboles de directorio — y **cada escritura se respalda primero** (`.bak`, restauración en una llamada). Búsqueda en todo el proyecto que físicamente no puede colgarse (`ripgrep`: escaneo nativo aislado en worker con watchdog de 3 s, directorios podados por defecto como `node_modules`) más reemplazo multi-archivo en modo prueba.

### Refactorización de código respetuosa con la sintaxis
Renombrados, mudanzas y extracciones de funciones dirigidas por AST con rollback automático — el agente refatora como un desarrollador, no como `sed`.

### Tareas largas sin perder el hilo
Lanza builds y watchers en **segundo plano**, sigue chateando, hace polling o cancela bajo demanda. JS/Python en sandbox para lógica rápida; shell completo (pipes, redirecciones, variables de entorno) cuando haga falta — pero *desactivado por defecto*. Tu suite de tests se ejecuta sola: runner detectado automáticamente, resultados de vuelta en el chat.

### Investigación web y automatización del navegador
Búsqueda multi-motor con fallback automático · extracción limpia de texto de página · un **navegador headless real** con sesiones persistentes (no un raspador de una vez) · cliente HTTP para cualquier llamada JSON GET/POST — con salvaguarda SSRF.

### Flujos de Git & GitHub, sin manos
Local: status, diff, add, commit, log, checkout, **stash**, **blame**. Remoto: issues, PRs, comentarios, diffs, push — a través del CLI `gh` en el que ya confías.

### Datos que de verdad puede leer
PDFs, documentos Word y hojas de cálculo → **búsqueda vectorial semántica local** (nada sale de tu máquina). OCR en capturas de pantalla y tomas de escritorio; metadatos y comparación de imágenes. SQLite solo lectura con consultas parametrizadas a prueba de inyección. Tu agente *ve* pantallas literalmente.

### Memoria que sobrevive a la ventana del chat
Decisiones, patrones y configuraciones persisten por proyecto — **y entre proyectos**: alcance tipado, poda TTL, recuerdo puntuado por recencia×frecuencia, conmutación previa confirmación (`switch_context`). ContextGuard mantiene vivas las sesiones maraton: resumen automático al 75 %, compresión al 90 % — a mitad de la cadena.

### Salida que puedes ver
Gráficos renderizados a archivos de imagen desde datos crudos (barras/líneas/circular/dona/dispersión/radar). Componentes HTML/CSS/JS en vivo generados y previsualizados en el navegador, con los datos extraídos de vuelta al chat.

---

## Inicio rápido (2 minutos)

**Prerequisitos:** LM Studio (última versión) · Node.js 20+ · *opcional:* CLI `gh` para operaciones remotas de GitHub → https://cli.github.com/

1. **Instala** — suelta la carpeta y habilita el plugin en la configuración de LM Studio
2. **Conmuta** — activa las categorías de herramientas que quieras (Execution & Browser empiezan desactivadas por diseño)
3. *(Opcional)* `gh auth login` una vez en un terminal para desbloquear las herramientas remotas de GitHub
4. **Chatea** — tu agente ahora tiene a mano **113 herramientas**, gateadas exactamente como configuraste

```bash
# Developing instead of using?
npm install && npm run build   # ESM + CJS via tsup
npm test                        # full suite: 71 suites / 1020 tests green (owner-verified 10.10 TWO-TIER CLOSE-OUT — FIX A + FIX B, gate round 3 ~12:05; prior canon 69/1003 @ 09.10 [FIX #21 mid-loop forced-save, r7] · prior arcs: 68/990 @ 08.10 [LEVER-1], 68/987 @ 07.10 [Arc C sweep — entry unlogged], 65/952 @ 06.10 [DOC-PIN gate] 64/941 @ 06.10 [i18n gate], 64/938 @ 06.10 ×2 [F1 ~16:57 · PLAN-SEAM ~18:0x], 63/931 @ 05.10, 63/930 @ 04.10 ×3, 61/917 @ 04.10, 893/59 @ 02.10, 874/58 @ ~21.5 s on 01.10, 860/56 @ 29.09, 857/56 @ 28.09)
```

---

## Configuración y conmutadores de herramientas — Control total, cero código

| Control | Qué hace |
|---|---|
| 🎛️ **Gateado granular** | Cada familia de herramientas se conmuta independientemente en la UI de configuración de LM Studio |
| 👑 **Modo Dios** | Un interruptor lo habilita todo (solo para usuarios expertos — Execution está desactivado por defecto con motivo) |
| 🔁 **ContextGuard** | Fija umbrales de tokens + modelo de resumido; observa cómo la auto-compresión mantiene vivas las sesiones largas |
| 🧮 **Auto-seguimiento** | Seguimiento en segundo plano de decisiones y finalización de tareas con resultados etiquetados por confianza |

---

## Postura de seguridad — construido como si importara

- 🛡️ Cada herramienta que modifica archivos escribe primero un `.bak` — la restauración es una llamada (`restore_from_bak`)
- 🛡️ `ripgrep` / `find_replace_all`: escaneo aislado en worker (la hilo del host no puede atascarse), watchdog de 3 s, degradación automática del dialecto Rust divulgada vía `pattern_mode` + pista
- 🛡️ Rutas RAG y web: lecturas acotadas (presupuestos de 250K–500K caracteres), abortos de 30 s por intento de fetch, bucles de chunking que *terminan* — sin OOM del host del plugin por documentos tóxicos
- 🛡️ Ejecución JS/Python en sandbox; shell completo disponible pero **desactivado por defecto**
- Modelo de amenazas y proceso de divulgación completos → [SECURITY.md](SECURITY.md)

---

## Arquitectura bajo el capó (para los curiosos)

Registro declarativo de herramientas con inyección de dependencias basada en closures · asíncrono completo + escrituras atómicas resistentes a crash (utilidad `atomicWrite`, rollback ante fallo) · detección dinámica del contexto vía APIs nativas del SDK · resultados etiquetados por confianza (`EXTRACTED | INFERRED | AMBIGUOUS`) · prioridad de herramientas consciente de clusters para poda por límite gramatical.

Profundización → [ARCHITECTURE.md](ARCHITECTURE.md) · Guía de desarrollo en este archivo más abajo

---

## El arsenal: 113 herramientas en todas las familias, todas para conmutar

Un plugin reemplaza a una estantería entera. Aquí va cada familia, qué cubre y su estado por defecto:

| Familia | Cuenta | Qué da a tu agente | Defecto |
|---|---|---|---|
| 📁 **Sistema de archivos** | 24 | Leer/escribir/editar/buscar — rutas validadas, respaldos, lecturas por chunks en archivos enormes, diffs, árboles del proyecto, búsqueda `ripgrep` aislada en worker (watchdog de 3 s) + escaneo estructurado de contenido (`pattern_scan`) + cirugía de líneas con guards de huella digital (`line_operations`, incorporado 23.09 Q6) | ✅ |
| 🧬 **Refactorización y motor Recode** | `refactor_code` + reglas | Rename AST · mover-función · extraer · limpieza de imports muertos — más un motor de reglas enchufable (pistas de código muerto, inferencia de tipos, modernizador asíncrono) con diffs en modo prueba | ✅ |
| 🔍 **Procesamiento de texto** | 3 | Transformaciones regex (clase `sed`), extracción estructurada (clase `awk`), tablas Markdown instantáneas (cirugía de líneas movida a Sistema de archivos, 23.09 Q6) | ✅ |
| 📋 **Planificación de tareas** | 4 | Planes objetivo + pasos a través de una máquina de estados real con métricas de finalización en vivo — los pasos bloqueados reintentan limpiamente · `remove_plan` gateado por confirmación + auto-eliminación al finalizar naturalmente (05.10) | ✅ |
| ⚡ **Ejecución** | 5 | JS y Python en sandbox (eval/require bloqueados) · shell completo y terminal nativo (opt-in) · **auto-ejecuta la suite de tests de tu proyecto** (detecta Jest/Mocha/Vitest) | mixto |
| 🧠 **Contexto y memoria** | 22 | Auto-resumen, memoria tipada con poda TTL y recuerdo heurístico, seguimiento de eventos — **más entre proyectos**: registrar/buscar/conmutar entre proyectos, explorador del índice de sesiones + arranque de reanudación solo lectura en una llamada (`restore_session_context`, 25.09) | ✅ |
| 📊 **RAG vectorial** | 7 | Búsqueda semántica sobre tu codebase *y* PDFs · documentos Word · hojas de cálculo + extracción web relevante a la consulta — local, acotado, a prueba de OOM | ✅ |
| 💾 **Respaldo y restauración** | 5 | Snapshots ZIP de directorio completo (`create_backup`/`restore_backup`), listado, limpieza — más el sistema `.bak` por edición bajo todo | ✅ |
| 📈 **Visualización de datos** | 1 | `generate_chart`: barras / líneas / circular / dona / dispersión / radar → archivo de imagen con fallback HTML · hermanas en el mismo conmutador: `markdown_preview`, `get_repeat_tool_advice` (DOC-PIN) | ✅ |
| 🖼️ **Procesamiento de imagen** | 4 | OCR (`image_to_text`) · inspección de metadatos (`describe_image`) · captura de escritorio (`screenshot_desktop`) · comparación a nivel de bytes (`compare_images`) | ✅ |
| 📄 **Análisis de documentos** | 1 | PDF / DOCX / TXT directo a la conversación, seguro con binarios | ✅ |
| 🌐 **Investigación web** | 3 | Búsqueda multi-motor con fallback · extracción limpia de texto de página | ✅ |
| 🌍 **Automatización del navegador** | 5 | Chromium headless real: abrir páginas, sesiones persistentes, interacción de UI, previsualizar HTML | ✗ opt-in |
| 🐙 **Git & GitHub** | 15 | Git local completo incl. **stash y blame** · issues/PRs/comentarios/diffs/push vía tu CLI `gh` | ✗ opt-in |
| ⏳ **Comandos en segundo plano** | 3 | Ejecuta trabajos largos sin bloquear el chat — monitorea stdout/stderr, cancela cuando quieras. Sin Docker necesario. | ✗ opt-in |
| 📡 **Cliente HTTP** | 3 | Peticiones de cualquier método con reintento/timeout, ayudas GET/POST JSON — con salvaguarda SSRF | ✗ opt-in |
| 🎨 **Generación de UI** | 3 | Construye y previsualiza componentes HTML/CSS/JS en vivo en el navegador · extrae los datos de vuelta | ✗ opt-in |
| 🗃️ **Base de datos** | 1 | SQLite solo lectura con consultas parametrizadas a prueba de inyección | ✗ opt-in |

> *Las cuentas están verificadas por código (auditoría source-of-truth, sept. 2026); la cantidad de herramientas expuestas depende siempre del gateado.*

> *Parámetros, valores por defecto y ejemplos por herramienta → [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md) (auditado contra el código fuente). Recorridos: [DOCUMENTATION.md](DOCUMENTATION.md) · [QUICK_START.md](QUICK_START.md)*

---

## Destacados por release (historial completo → CHANGELOG_v4.md — activo; v1–v3 en docs/history/)

| Versión | Titular |
|---|---|
| **v1.9.18** | 🔒 Suite D corrección de escritura perdida en archivo compartido — bloqueo in-proceso por ruta sobre la sección crítica snap→renombrar (nuevo `sharedFileLock.ts`, conectado a ambos escritores) · 🧾 EOL-FIX v4 — ida y vuelta exacta a nivel de bytes para finales de línea en `replace_text_in_file` sobre archivos mixtos/CRLF + visibilidad pre-edición eol/bom vía informe de `get_file_metadata` (bloqueador TS7022 del gate tsc cerrado en el mismo arco) · 🧯 PIPELINE HYGIENE D 25.09 — taxonomía unificada de resultados de la Tool Execution Pipeline + invariante finalizeContent, reset por turno del guard de toolsProvider, describeError limpio en lint, mapper RC#4 de jest; suite completa 836/51 en verde + eslint limpio; docs CHANGELOG_v3 + ARCHITECTURE actualizados |
| **v1.9.17** | 💾 Perfil de gateado de herramientas — conmutadores persistentes (rev 29, publicada el 14.09) · 🔍 TOOL SWAP de ripgrep + registro unificado de proyectos + corrección del vaivén del pool de workers (rev 30, última publicación en GitHub el 15.09) — todo el trabajo rev-31 (DE-STRAngle, AutoTracker F1+F2, orden de herramientas consciente de clusters, reubicación del estado CWD, SPEC-C) publicado en v1.9.18; ⏳ publicación v1.9.18 / rev 33 pendiente (decisión del propietario) |
| **v1.9.16** | 🔍 Corrección del fallback de resultados nulos en `web_search` — un motor muerto/vacío ya no detiene la cadena · rev 28: reinstalación + reinicio verificado en vivo el mismo día (`ddg-api` bloqueado saltado → `ddg-fetch` devolvió resultados) |
| **v1.9.15** | ⚡ B' prefiltro fase-1 de ripgrep para `pattern_scan` (garantía de fallback JS idéntico byte a byte) · rev 27: `ripgrep` promovido a dependencia de tiempo de ejecución, corrigiendo la pérdida silenciosa del camino rápido en instalaciones del Hub — verificado en vivo en la máquina del usuario |
| **v1.9.14** | 🧠 Guard de análisis de archivo local en `get_memory` — los registros auto-contexto sin clave ya no abortan lecturas (hotfix) |
| **v1.9.13** | 🔍 Motor regex respaldado por ripgrep para `grep_files` (prefiltro WASM in-proceso, el fallback transparente mantiene cada guard contra cuelgues; herramienta eliminada en el TOOL SWAP del 14.09 → `ripgrep` nativa independiente) · sello de verdad terreno `executedTool` en todos los resultados de herramientas · eliminación de código muerto Tier-1 (~90 KB) |
| **v1.9.12** | 🆕 Búsqueda recursiva de contenido `pattern_scan` (regex inseguro degradado automáticamente a literal; límites duros 256 KB / 10k líneas) · corrección de lectura de propiedad `connected` de puppeteer · eliminación de archivos muertos — sincronización completa de docs MD |
| **v1.9.10** | 🔧 Suite de endurecimiento contra OOM: lecturas web/RAG acotadas, terminación en punto fijo del chunking, desduplicado de `rag_web_content` — el heap del host del plugin ahora es seguro bajo cargas tóxicas |
| **v1.9.9** | ⏱️ `grep_files` limitado por plazo (resultados parciales + bandera `aborted`) · los deltas de tokens de AutoTracker disparan umbrales *dentro* de cadenas largas de herramientas · log DELTA en vivo `chat used ≈ N tok` |
| **v1.9.8** | 🔒 Solo registro explícito de proyectos · prevención de cuelgues (`max_depth`, límites de líneas) · detección de palabras clave Step-0.7 + sincronización perezosa del registro elimina el bucle «project not found» |
| **v1.9.7** | 💾 Escrituras atómicas resistentes a crash en todas partes — nombres temporales aleatorizados, rollback ante fallo, cero E/S bloqueante |
| **v1.9.5–6** | 🧠 Inteligencia inspirada en Graphify: resultados etiquetados por confianza, clustering con exclusión de hub, prioridad de herramientas consciente de clusters · deprecación `shell:true` eliminada |
| **v1.8.x** | 🛡️ 3 capas de salvaguardas para edición por líneas · exactitud de conteo de tokens SDK v1.x (coincide con la barra lateral dentro de <0,3 %) · refactor del registro declarativo (~80 líneas if/else → registro de 20 entradas) |

---

## Dependencias principales

`@lmstudio/sdk` ^1.5.0 · `puppeteer` ^24 · `isomorphic-git` ^1.38 · `sharp` ^0.35.3 · `tesseract.js` ^7 · `pdf-parse` / `mammoth` / `xlsx` (pipeline de documentos) · `ripgrep` ^0.3.1 (motor regex WASM, carga perezosa) · `@dqbd/tiktoken` (ContextGuard) · `zod` (validación en tiempo de ejecución)

---

## Licencia

**MIT** — libre de usar, modificar y distribuir. Ver [LICENSE](LICENSE).

---

*AI Toolbox es un plugin todo-en-uno para LM Studio y kit de herramientas de agentes IA para LLMs locales: herramientas de archivo seguras, búsqueda a prueba de cuelgues, builds en segundo plano, automatización de navegador headless, flujos de Git & GitHub, OCR, visualización de datos, RAG semántico local sobre PDF/DOCX/XLSX, memoria entre proyectos, ventanas de contexto auto-gestionadas — 113 llamadas de herramienta listas que tu modelo puede usar con cero código pegajoso.*
