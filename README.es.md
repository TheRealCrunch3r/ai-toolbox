<div align="center">
<a href="README.md">English</a> ý <a href="README.de.md">Deutsch</a> ý <b>Espaýol</b> ý <a href="README.zh-CN.md">ýS-ý</a> ý <a href="README.zh-TW.md">Aý-ý</a><br/>
<h1>AI Toolbox  Plugin todo-en-uno de agentes y herramientas de IA autýnomos para LLMs locales en LM Studio</h1><hr/>
<b>117 herramientas. Un plugin. Sin nube.</b> El plugin mýs completo del Hub de LM Studio  convierte cualquier modelo local en un agente de IA capaz y autosuficiente.<br/>Contexto autogestionado mantiene vivas las sesiones maratýn ý un solo plugin, sin pegamento, completamente offline por defecto.
<br/><a href="#"><img src="https://img.shields.io/badge/version-v1.9.24-2f80ed?style=plastic" alt="version v1.9.24"/></a> <a href="#the-tool-arsenal-117-tools-across-every-family-all-yours-to-toggle"><img src="https://img.shields.io/badge/tools-117%20ready--made-7c3aed?style=plastic" alt="tools 117 ready-made"/></a> <a href="#quick-start-2-minutes"><img src="https://img.shields.io/badge/tests-86%20suites%20%C2%B7%201291%20green-3fb950?style=plastic" alt="tests 86 suites ý 1291 green"/></a> <a href="#"><img src="https://img.shields.io/badge/LM%20Studio-Hub%20plugin-e84393?style=plastic" alt="LM Studio Hub plugin"/></a> <a href="LICENSE"><img src="https://img.shields.io/github/license/TheRealCrunch3r/ai-toolbox?style=plastic" alt="license MIT (live-verified from LICENSE)"/></a> <a href="#"><img src="https://img.shields.io/badge/runtime-Node%20%E2%89%A5%2020-83cd29?style=plastic&logo=node.js" alt="runtime Node e 20"/></a><br/>
<b>Docs:</b> <a href="DOCUMENTATION.md">Documentation</a> ý <a href="QUICK_START.md">Quick Start</a> ý <a href="ARCHITECTURE.md">Architecture</a> ý <a href="TOOLS_REFERENCE.md">Tool Reference</a> ý <a href="CHANGELOG_v5.md">Changelog</a><br/>
<a href="CONTRIBUTING.md">Contributing</a> ý <a href="SECURITY.md">Security</a><br/>
<br>
<b>=ý Instalaciýn fýcil:</b> <a href="https://lmstudio.ai/crunch3r/ai-toolbox">Consigue AI Toolbox desde el Hub de LM Studio</a> <br> OR </br>
<code>Instalaciýn: copia la carpeta <b>dist/</b> en LM Studio ý actývalo bajo Plugins (Node.js 20+)</code>
<br>
</div>


**Kit de herramientas de agentes IA para LM Studio**  117 herramientas para LLMs locales: ediciýn de archivos, býsqueda en la codebase, RAG, automatizaciýn del navegador, Git & GitHub.

**116 herramientas. Un plugin. Sin nube.** El plugin mýs completo del Hub de LM Studio  convierte cualquier modelo local en un agente IA capaz y auto-gestionado con ediciýn segura de archivos, býsqueda a prueba de cuelgues, builds en segundo plano, automatizaciýn de navegador headless, flujos de Git & GitHub, OCR, grýficos y RAG semýntico; el **contexto auto-gestionado** mantiene vivas las sesiones maraton. Un plugin, cero cýdigo pegajoso, totalmente offline por defecto.

> `v1.9.24` ý `117 herramientas listas` ý `1291 tests en verde (86 suites)` ý `5 localizaciones` ý `MIT` ý `Node 20+`

> ý **Traducciýn**  Versiýn espaýola de [README.md](README.md). El inglýs es la versiýn canýnica; en caso de divergencia prevalece README.md. Mantener esta archivo sincronizado cuando el original cambie.

<div align="center"><table><tr><td style="border-left:4px solid #d1242f; padding:8px 16px;"><b>ý LM Studio NO admite actualizaciones automýticas.</b><br/>Si encuentras problemas, actualiza primero manualmente: elimina la versiýn actual y vuelve a descargarla desde el sitio del plugin. Ten en cuenta que LM Studio puede mostrar un tooltip de ýya instaladoý aunque tu versiýn estý desactualizada.</td></tr></table></div>

## Contenido

[Por quý AI Toolbox (vs otros plugins)] ý [Comparaciýn directa] ý [Resumen de funciones] ý [Inicio rýpido (2 minutos)] ý [Configuraciýn y conmutadores de herramientas  control total, cero cýdigo] ý [Postura de seguridad  construido como si importara] ý [Arquitectura para los curiosos] ý [Arsenal: 117 herramientas] ý [Destacados por release  historial completo ý CHANGELOG_v5.md  activo; v1v4 en docs/history/]

*Lista de secciones sin enlaces ancla; los týtulos corresponden a las cabeceras mýs abajo.*

---

## Por quý AI Toolbox (vs otros plugins de LM Studio)

*Comparado contra un sondeo de agosto 2026 de ~115 plugins del Hub de LM Studio (~40 toolboxes, solo 9 con herramientas de archivo reales).*
**Leyenda:** >G ýnico en todo el campo ý P raro (d unos pocos) ý =ý ingenierýa de seguridad destacada

| Capacidad | Quý hace por ti | Posiciýn en el campo |
|---|---|---|
| >ý **Contexto auto-gestionado** (`AutoTracker` + `ContextGuard`) | Los umbrales de tokens se disparan *a mitad de la cadena de herramientas* (75 % / 90 %), resumir y comprimir automýticamente la conversaciýn antes del desborde  las sesiones largas del agente siguen funcionando en vez de morir. Detecciýn de palabras clave del proyecto en el pipeline de prompts. | P **Ningýn rival encuestado tiene gestiýn alguna de contexto/tokens**  todas las demýs herramientas ýmemoryý son CRUD plano de guardar/listar/buscar |
| < **Memoria entre proyectos** (`switch_context`, registro de proyectos) | Recuerda lo que *otro* proyecto registrado decidiý la semana pasada. Puntuaciýn recenciaýfrecuencia, poda TTL, conmutaciýn previa confirmaciýn (Step 0.7). | P **Ausente en todos los plugins encuestados** |
| <ý **Resultados etiquetados por confianza + selecciýn de herramientas consciente de clusters** (`confidenceTypes`, `toolPriority`) | Cada hecho auto-seguido se etiqueta EXTRACTED vs INFERRED vs AMBIGUOUS  asý separas lo que el agente *sabe* de lo que estý adivinando; y cuando 117 herramientas compiten por un turno, la prioridad consciente de clusters mantiene a las correctas al alcance bajo los lýmites gramaticales. | >G **Ningýn rival encuestado etiqueta la confianza del resultado**  y ninguno cabe con tantas herramientas sin soltarlas en los lýmites de contexto |
| >ý **Refactorizaciýn basada en AST** (`refactor_code`) | Rename / mover-funciýn / extraer-funciýn / limpieza de imports muertos  transformaciones AST seguras sintýcticamente con **rollback automýtico ante fallo**, no hackeo textual con regex. | >G **La ýnica refactorizaciýn basada en AST entre ~115 plugins encuestados** |
| = **Býsqueda que no puede colgarse** (`ripgrep`, `find_replace_all`) | ripgrep nativo en un worker aislado fuera de la hilo del host con watchdog de 3 s en tiempo real; regexes del dialecto Rust degradadas automýticamente a cadenas fijas y anunciado výa `pattern_mode`; reemplazo multi-archivo en modo prueba. | =ý Los rivales traen bucles grep sin lýmite  esta no puede girar para siempre fýsicamente |
| =ý **Ediciýn segura de archivos** (`replace_text_in_file`, `line_operations`) | Backup `.bak` en cada ediciýn, inserciones ancladas a patrýn, verificaciýn por huella digital de lýneas, comprobaciýn MD5 de integridad tras la escritura. Restaurar cualquier archivo en una llamada (`restore_from_bak`). | =ý **3 capas de salvaguardas** contra corrupciýn por nýmeros de lýnea obsoletos  los rivales ofrecen a lo sumo sim de backup por renombrado |
| ý **Comandos en segundo plano no bloqueantes** (`run_background_command` + monitor/cancel) | Lanza builds y trabajos largos, sigue chateando, consulta el estado cuando quieras, cancela si hace falta. Sin Docker necesario. | P Los rivales mýs cercanos **requieren Docker**; esta se ejecuta nativa en el host del plugin |
| < **Automatizaciýn real de navegador** (suite Puppeteer) | Chromium headless con sesiones persistentes e interacciýn de UI  no una llamada ýnica de ýobtener pýginaý. | Los plugins rivales de ývisitar webý son ý *solo raspadores estýticos* |
| =ý **RAG semýntico local, cualquier formato** (`rag_index_pdf/docx/xlsx`, `rag_query_vector`, `rag_web_content`) | Indexa PDFs, documentos Word y hojas de cýlculo para býsqueda vectorial  mýs extracciýn web relevante a la consulta. Un ýnico conjunto reemplaza los 24 plugins separados de los rivales. Nada sale de tu mýquina. | =ý Chunking acotado: **sin OOM con documentos de longitud týxica** (verificado contra un PDF de 1690 pýginas) |
| >ý **Ejecuta tu suite de tests por ti** (`run_tests`) | Detecta Jest / Mocha / Vitest automýticamente desde `package.json` y lo ejecuta, resultados de vuelta en el chat. | P Ninguna otra toolbox del campo hace esto |
| =ý **Visualizaciýn de datos como llamada de herramienta** (`generate_chart`) | Barras / lýneas / circular / dona / dispersiýn / radar ý archivo de imagen, con fallback HTML cuando el renderizador no estý disponible. | >G **No existýa ningýn plugin de data-viz en todo el campo** al momento del sondeo |
| =ý **Planificaciýn estructurada con progreso en vivo** (`create_plan`, `get_plan`, `update_plan_step`) | Planes multi-paso seguidos a travýs de una mýquina de estados real (pending ý in_progress ý done, reintentar bloqueado) con mýtricas de finalizaciýn. | P Raro  la mayorýa de toolboxes no tienen ninguna primitiva de planificaciýn |

---

## Comparaciýn directa vs las herramientas LM Studio de Beledarian

El competidor directo mýs cercano en el Hub: mismo oficio (herramientas para LLMs locales), construcciýn muy distinta. Donde AI Toolbox se adelanta:

| Lo que AI Toolbox tiene y ellos no |
|---|
|  **Refactorizaciýn a nivel AST** (renombrar, mover funciones, limpiar imports muertos)  transformaciones seguras sintýcticamente con rollback automýtico, no ediciones de cadena |
|  **RAG real:** ýndice vectorial local sobre PDF / DOCX / XLSX con procedencia por pýgina  no solo býsqueda por palabras clave |
|  **Imagen y data-viz:** OCR en capturas y tomas, metadatos + comparaciýn de imýgenes, generaciýn de grýficos |
|  **117 herramientas** vs ~49  respaldadas por 1291 tests superados en 86 suites |
|  **Escrituras resistentes a crash + rollback ante fallo:** una ediciýn fallida nunca puede corromper tu archivo |

Nuestra brecha de i18n anterior estý cerrada: **ahora publicamos 5 localizaciones** (en ý de ý es ý zh-CN ý zh-TW), cada una un conjunto de traducciýn completo  y tests anti-stub custodian la suite para que los idiomas alias/fallback nunca regredan en silencio. Preferimos decýrtelo a fingir que no existe.

---

## Mýralo trabajar  Un turno, diez herramientas

> **Tý:** *ýRefactoriza `auth.ts`  extrae la lýgica de refresco del token a su propio mýdulo, mueve el helper junto a ella, ejecuta nuestra suite de tests y abre un PR si estý en verde.ý*
>
> ý `refactor_code` (extracciýn AST + mover funciýn, rollback automýtico armado) ý `run_tests` (detectado **Jest** automýticamente: todo ) ý `gh_create_pr`  **un turno. Cero copy-paste. Sin tutoreo.**

---

## Resumen de funciones

### Ediciýn y býsqueda de archivos seguras
Reemplazo in-place ý inserciones ancladas por lýnea ý lecturas por chunks en archivos enormes ý diffs ý ýrboles de directorio  y **cada escritura se respalda primero** (`.bak`, restauraciýn en una llamada). Býsqueda en todo el proyecto que fýsicamente no puede colgarse (`ripgrep`: escaneo nativo aislado en worker con watchdog de 3 s, directorios podados por defecto como `node_modules`) mýs reemplazo multi-archivo en modo prueba.

### Refactorizaciýn de cýdigo respetuosa con la sintaxis
Renombrados, mudanzas y extracciones de funciones dirigidas por AST con rollback automýtico  el agente refatora como un desarrollador, no como `sed`.

### Tareas largas sin perder el hilo
Lanza builds y watchers en **segundo plano**, sigue chateando, hace polling o cancela bajo demanda. JS/Python en sandbox para lýgica rýpida; shell completo (pipes, redirecciones, variables de entorno) cuando haga falta  pero *desactivado por defecto*. Tu suite de tests se ejecuta sola: runner detectado automýticamente, resultados de vuelta en el chat.

### Investigaciýn web y automatizaciýn del navegador
Býsqueda multi-motor con fallback automýtico ý extracciýn limpia de texto de pýgina ý un **navegador headless real** con sesiones persistentes (no un raspador de una vez) ý cliente HTTP para cualquier llamada JSON GET/POST  con salvaguarda SSRF.

### Flujos de Git & GitHub, sin manos
Local: status, diff, add, commit, log, checkout, **stash**, **blame**. Remoto: issues, PRs, comentarios, diffs, push  a travýs del CLI `gh` en el que ya confýas.

### Datos que de verdad puede leer
PDFs, documentos Word y hojas de cýlculo ý **býsqueda vectorial semýntica local** (nada sale de tu mýquina). OCR en capturas de pantalla y tomas de escritorio; metadatos y comparaciýn de imýgenes. SQLite solo lectura con consultas parametrizadas a prueba de inyecciýn. Tu agente *ve* pantallas literalmente.

### Memoria que sobrevive a la ventana del chat
Decisiones, patrones y configuraciones persisten por proyecto  **y entre proyectos**: alcance tipado, poda TTL, recuerdo puntuado por recenciaýfrecuencia, conmutaciýn previa confirmaciýn (`switch_context`). ContextGuard mantiene vivas las sesiones maraton: resumen automýtico al 75 %, compresiýn al 90 %  a mitad de la cadena.

### Salida que puedes ver
Grýficos renderizados a archivos de imagen desde datos crudos (barras/lýneas/circular/dona/dispersiýn/radar). Componentes HTML/CSS/JS en vivo generados y previsualizados en el navegador, con los datos extraýdos de vuelta al chat.

---

## Inicio rýpido (2 minutos)

**Prerequisitos:** LM Studio (ýltima versiýn) ý Node.js 20+ ý *opcional:* CLI `gh` para operaciones remotas de GitHub ý https://cli.github.com/

1. **Instala**  suelta la carpeta y habilita el plugin en la configuraciýn de LM Studio
2. **Conmuta**  activa las categorýas de herramientas que quieras (Execution & Browser empiezan desactivadas por diseýo)
3. *(Opcional)* `gh auth login` una vez en un terminal para desbloquear las herramientas remotas de GitHub
4. **Chatea**  tu agente ahora tiene a mano **117 herramientas**, gateadas exactamente como configuraste

```bash
# Developing instead of using?
npm install && npm run build   # ESM + CJS via tsup
npm test                        # full suite: 86 suites / 1291 tests green (v1.9.24)
```

---

## Configuraciýn y conmutadores de herramientas  Control total, cero cýdigo

| Control | Quý hace |
|---|---|
| <ý **Gateado granular** | Cada familia de herramientas se conmuta independientemente en la UI de configuraciýn de LM Studio |
| =Q **Modo Dios** | Un interruptor lo habilita todo (solo para usuarios expertos  Execution estý desactivado por defecto con motivo) |
| = **ContextGuard** | Fija umbrales de tokens + modelo de resumido; observa cýmo la auto-compresiýn mantiene vivas las sesiones largas |
| >ý **Auto-seguimiento** | Seguimiento en segundo plano de decisiones y finalizaciýn de tareas con resultados etiquetados por confianza |

---

## Postura de seguridad  construido como si importara

- =ý Cada herramienta que modifica archivos escribe primero un `.bak`  la restauraciýn es una llamada (`restore_from_bak`)
- =ý `ripgrep` / `find_replace_all`: escaneo aislado en worker (la hilo del host no puede atascarse), watchdog de 3 s, degradaciýn automýtica del dialecto Rust divulgada výa `pattern_mode` + pista
- =ý Rutas RAG y web: lecturas acotadas (presupuestos de 250K500K caracteres), abortos de 30 s por intento de fetch, bucles de chunking que *terminan*  sin OOM del host del plugin por documentos týxicos
- =ý Ejecuciýn JS/Python en sandbox; shell completo disponible pero **desactivado por defecto**
- Modelo de amenazas y proceso de divulgaciýn completos ý [SECURITY.md](SECURITY.md)

---

## Arquitectura bajo el capý (para los curiosos)

Registro declarativo de herramientas con inyecciýn de dependencias basada en closures ý asýncrono completo + escrituras atýmicas resistentes a crash (utilidad `atomicWrite`, rollback ante fallo) ý detecciýn dinýmica del contexto výa APIs nativas del SDK ý resultados etiquetados por confianza (`EXTRACTED | INFERRED | AMBIGUOUS`) ý prioridad de herramientas consciente de clusters para poda por lýmite gramatical.

Profundizaciýn ý [ARCHITECTURE.md](ARCHITECTURE.md) ý Guýa de desarrollo en este archivo mýs abajo

---

## El arsenal: 117 herramientas en todas las familias, todas para conmutar

Un plugin reemplaza a una estanterýa entera. Aquý va cada familia, quý cubre y su estado por defecto:

| Familia | Cuenta | Quý da a tu agente | Defecto |
|---|---|---|---|
| =ý **Sistema de archivos** | 24 | Leer/escribir/editar/buscar  rutas validadas, respaldos, lecturas por chunks en archivos enormes, diffs, ýrboles del proyecto, býsqueda `ripgrep` aislada en worker (watchdog de 3 s) + escaneo estructurado de contenido (`pattern_scan`) + cirugýa de lýneas con guards de huella digital (`line_operations`, incorporado 23.09 Q6) + parches unified/binary byte-exactos (`apply_patch`, 07.11) |  |
| >ý **Refactorizaciýn y motor Recode** | `refactor_code` + reglas | Rename AST ý mover-funciýn ý extraer ý limpieza de imports muertos  mýs un motor de reglas enchufable (pistas de cýdigo muerto, inferencia de tipos, modernizador asýncrono) con diffs en modo prueba |  |
| = **Procesamiento de texto** | 3 | Transformaciones regex (clase `sed`), extracciýn estructurada (clase `awk`), tablas Markdown instantýneas (cirugýa de lýneas movida a Sistema de archivos, 23.09 Q6) |  |
| =ý **Planificaciýn de tareas** | 4 | Planes objetivo + pasos a travýs de una mýquina de estados real con mýtricas de finalizaciýn en vivo  los pasos bloqueados reintentan limpiamente ý `remove_plan` gateado por confirmaciýn + auto-eliminaciýn al finalizar naturalmente (05.10) |  |
| ý **Ejecuciýn** | 5 | JS y Python en sandbox (eval/require bloqueados) ý shell completo y terminal nativo (opt-in) ý **auto-ejecuta la suite de tests de tu proyecto** (detecta Jest/Mocha/Vitest) | mixto |
| >ý **Contexto y memoria** | 22 | Auto-resumen, memoria tipada con poda TTL y recuerdo heurýstico, seguimiento de eventos  **mýs entre proyectos**: registrar/buscar/conmutar entre proyectos, explorador del ýndice de sesiones + arranque de reanudaciýn solo lectura en una llamada (`restore_session_context`, 25.09) |  |
| =ý **RAG vectorial** | 7 | Býsqueda semýntica sobre tu codebase *y* PDFs ý documentos Word ý hojas de cýlculo + extracciýn web relevante a la consulta  local, acotado, a prueba de OOM |  |
| =ý **Respaldo y restauraciýn** | 5 | Snapshots ZIP de directorio completo (`create_backup`/`restore_backup`), listado, limpieza  mýs el sistema `.bak` por ediciýn bajo todo |  |
| =ý **Visualizaciýn de datos** | 1 | `generate_chart`: barras / lýneas / circular / dona / dispersiýn / radar ý archivo de imagen con fallback HTML ý hermanas en el mismo conmutador: `markdown_preview`, `get_repeat_tool_advice` (DOC-PIN) |  |
| =ý **Procesamiento de imagen** | 4 | OCR (`image_to_text`) ý inspecciýn de metadatos (`describe_image`) ý captura de escritorio (`screenshot_desktop`) ý comparaciýn a nivel de bytes (`compare_images`) |  |
| =ý **Anýlisis de documentos** | 1 | PDF / DOCX / TXT directo a la conversaciýn, seguro con binarios |  |
| < **Investigaciýn web** | 3 | Býsqueda multi-motor con fallback ý extracciýn limpia de texto de pýgina |  |
| < **Automatizaciýn del navegador** | 5 | Chromium headless real: abrir pýginas, sesiones persistentes, interacciýn de UI, previsualizar HTML |  opt-in |
| = **Git & GitHub** | 15 | Git local completo incl. **stash y blame** ý issues/PRs/comentarios/diffs/push výa tu CLI `gh` |  opt-in |
| ý **Comandos en segundo plano** | 3 | Ejecuta trabajos largos sin bloquear el chat  monitorea stdout/stderr, cancela cuando quieras. Sin Docker necesario. |  opt-in |
| =ý **Cliente HTTP** | 3 | Peticiones de cualquier mýtodo con reintento/timeout, ayudas GET/POST JSON  con salvaguarda SSRF |  opt-in |
| <ý **Generaciýn de UI** | 3 | Construye y previsualiza componentes HTML/CSS/JS en vivo en el navegador ý extrae los datos de vuelta (ON por defecto desde el 10.10, decisiýn del propietario) |  |
| =ý **Base de datos** | 1 | SQLite solo lectura con consultas parametrizadas a prueba de inyecciýn |  opt-in |

> *Las cuentas estýn verificadas por cýdigo (auditorýa source-of-truth, sept. 2026); la cantidad de herramientas expuestas depende siempre del gateado.*

> *Parýmetros, valores por defecto y ejemplos por herramienta ý [TOOLS_REFERENCE.md](TOOLS_REFERENCE.md) (auditado contra el cýdigo fuente). Recorridos: [DOCUMENTATION.md](DOCUMENTATION.md) ý [QUICK_START.md](QUICK_START.md)*

---

## Destacados por release (historial completo ý CHANGELOG_v5.md  activo; v1v4 en docs/history/)

| Versiýn | Titular |
|---|---|
| **v1.9.24** | =ý Protecciýn de lýmite de contexto Budget-Guard ENTREGADA Y PUBLICADA  M1 puerta de aviso pre-lectura (`read_file` / `read_document`: aviso de presupuesto auto-descrito en vez del volcado completo cuando el uso proyectado cruzarýa el 80 %), M2 tope de spill consciente del presupuesto (borde 92 %, margen de seguridad 8 %), M3 auto-persistencia de seguro de la memoria de sesiýn al 85 %  interruptor maestro ON por defecto, desactivarlo explýcitamente restaura el comportamiento legacy idýntico byte a byte; las cinco filas de ajustes localizadas en todos los locales ý >ý NUEVA suite `tests/budgetGuard.test.ts` (+1 suite / +18 tests ý canon **83 suites / 1234 tests**, densidades fijas 1.3071.670 c/tok; superado 07.11 por el ship de apply_patch  canon ahora **84 suites / 1262 tests** ý 116 herramientas) |
| **v1.9.23** | >ý herramienta de solo lectura `memory_recall`  index/fetch ID-first sobre entradas de contexto, hechos de memoria e ýndice de sesiones (fallos auto-descritos; suite hermetic con identidad byte a byte) ý =ý toda la documentaciýn re-estampada al canon en vivo *82 suites / 1216 tests* + barrido de reparaciýn MD de raýz final |
| **v1.9.22** | <ý Lanzamiento de cambio de versiýn que cierra el arco CTX-EST A  procedencia del estimador de densidad compartida asentada por sonda en vivo sobre qwen3.8-27b-ud (banda 1.3071.670 caracteres/token, valores `BIAS`/`FLOOR` sin cambios; solo delta de comentarios en `tokenStatsManager.ts`) ý =ý sincronizaciýn completa de docs al canon **80 suites / 1193 tests** en todas las superficies live ý = suite updateChecker endurecida  los pins literales quedaron independientes del baseline (`offsetLocalVersion()`), futuros cambios no requieren editar tests |
| **v1.9.21** | =ý Familia de arcos update-check  toast de escritorio ý anuncio en chat mutuamente exclusivos por versiýn (SPEC A XOR; los hosts sin system.notify siempre caen a chat) ý >ý DEFECT #2  `update-check.json` ya no se reescribe salvo cambio de contenido ý <ý Cambio de fuente HUB .VERSION  la comprobaciýn de actualizaciýn de producciýn lee el archivo `.VERSION` publicado del hub en lugar de GitHub `releases/latest`; parseo estricto shape-1 / tolerante al ruido shape-2, peor caso warn+skip ý >ý +2 herramientas con paridad de locales en los 5 sets (utilities) ý cambio de versiýn v1.9.20 ý **v1.9.21**  canon **76 suites / 1109 tests**, cero deriva |
| **v1.9.20** | =ý Lanzamiento de versiýn  el montýn rev-3x desde la ýltima publicaciýn en GitHub se une en un solo movimiento: cierre de los arcos A/B/C de memoria de sesiýn (ciclo de vida TTL + reemplazo al cerrar + deduplicaciýn de ýndice / limpieza de artefactos), compresiýn preventiva a mitad de bucle al 95 % fijo con aviso visible del umbral, guardado forzado tier-2 durante el bucle de herramientas, estimador de tokens medido (`AGENTIC_CHARS_PER_TOKEN` 3.2 ý editable por el usuario 3.6) ý = FIX-35c gate ReDoS a prueba de cuelgues + pattern_scan WALK-ABORT (28.09, archivado en CHANGELOG_v3) ý >ý ARC-RESTORE  ciclo de vida one-shot `verification_checkpoint` en el store de contexto + endurecimiento del lado restore (etiquedas de antigýedad por entrada, lýmite top-N sustantivo, `context_stale_fraction` aditivo) ý canon **74 suites / 1064 tests** |
| **v1.9.19** | =ý Etiqueta sin publicar  package.json saltý de v1.9.18 ý v1.9.20 ya el 06.10 (liberaciýn del bloqueo de rev); el campo `version` del manifest siguiý en v1.9.19 hasta el cambio de versiýn del 15.10, que hizo detectable el montýn acumulado para la publicaciýn Hub  no se publicý cýdigo bajo esta etiqueta; ver v1.9.20 arriba |
| **v1.9.18** | = Suite D correcciýn de escritura perdida en archivo compartido  bloqueo in-proceso por ruta sobre la secciýn crýtica snapýrenombrar (nuevo `sharedFileLock.ts`, conectado a ambos escritores) ý >ý EOL-FIX v4  ida y vuelta exacta a nivel de bytes para finales de lýnea en `replace_text_in_file` sobre archivos mixtos/CRLF + visibilidad pre-ediciýn eol/bom výa informe de `get_file_metadata` ý >ý PIPELINE HYGIENE D 25.09  taxonomýa unificada de resultados + invariante finalizeContent, reset por turno del guard de toolsProvider |
| **v1.9.17** | =ý Perfil de gateado de herramientas  conmutadores persistentes ý = TOOL SWAP de ripgrep + registro unificado de proyectos + correcciýn del vaivýn del pool de workers (ýltima publicaciýn en GitHub el 15.09)  todo el trabajo rev-31 (DE-STRAngle, AutoTracker F1+F2, orden de herramientas consciente de clusters, reubicaciýn del estado CWD, SPEC-C) publicado en v1.9.18 |
| **v1.9.16** | = Correcciýn del fallback de resultados nulos en `web_search`  un motor muerto/vacýo ya no detiene la cadena (`ddg-api` bloqueado saltado ý `ddg-fetch` devolviý resultados) |
| **v1.9.15** | ý B' prefiltro fase-1 de ripgrep para `pattern_scan` (garantýa de fallback JS idýntico byte a byte) ý `ripgrep` promovido a dependencia de tiempo de ejecuciýn, corrigiendo la pýrdida silenciosa del camino rýpido en instalaciones del Hub  verificado en vivo en la mýquina del usuario |
| **v1.9.14** | >ý Guard de anýlisis de archivo local en `get_memory`  los registros auto-contexto sin clave ya no abortan lecturas (hotfix) |
| **v1.9.13** | = Motor regex respaldado por ripgrep para `grep_files` (prefiltro WASM in-proceso, el fallback transparente mantiene cada guard contra cuelgues; herramienta eliminada en el TOOL SWAP del 14.09 ý `ripgrep` nativa independiente) ý sello de verdad terreno `executedTool` en todos los resultados de herramientas ý eliminaciýn de cýdigo muerto Tier-1 (~90 KB) |
| **v1.9.12** | <ý Býsqueda recursiva de contenido `pattern_scan` (regex inseguro degradado automýticamente a literal; lýmites duros 256 KB / 10k lýneas) ý correcciýn de lectura de propiedad `connected` de puppeteer ý eliminaciýn de archivos muertos  sincronizaciýn completa de docs MD |
| **v1.9.10** | =' Suite de endurecimiento contra OOM: lecturas web/RAG acotadas, terminaciýn en punto fijo del chunking, desduplicado de `rag_web_content`  el heap del host del plugin ahora es seguro bajo cargas týxicas |
| **v1.9.9** | ý `grep_files` limitado por plazo (resultados parciales + bandera `aborted`) ý los deltas de tokens de AutoTracker disparan umbrales *dentro* de cadenas largas de herramientas ý log DELTA en vivo `chat used H N tok` |
| **v1.9.8** | = Solo registro explýcito de proyectos ý prevenciýn de cuelgues (`max_depth`, lýmites de lýneas) ý detecciýn de palabras clave Step-0.7 + sincronizaciýn perezosa del registro elimina el bucle ýproject not foundý |
| **v1.9.7** | =ý Escrituras atýmicas resistentes a crash en todas partes  nombres temporales aleatorizados, rollback ante fallo, cero E/S bloqueante |
| **v1.9.56** | >ý Inteligencia inspirada en Graphify: resultados etiquetados por confianza, clustering con exclusiýn de hub, prioridad de herramientas consciente de clusters ý deprecaciýn `shell:true` eliminada |
| **v1.8.x** | =ý 3 capas de salvaguardas para ediciýn por lýneas ý exactitud de conteo de tokens SDK v1.x (coincide con la barra lateral dentro de <0,3 %) ý refactor del registro declarativo (~80 lýneas if/else ý registro de 20 entradas) |

---

## Dependencias principales

`@lmstudio/sdk` ^1.5.0 ý `puppeteer` ^24 ý `isomorphic-git` ^1.38 ý `sharp` ^0.35.3 ý `tesseract.js` ^7 ý `pdf-parse` / `mammoth` / `xlsx` (pipeline de documentos) ý `ripgrep` ^0.3.1 (motor regex WASM, carga perezosa) ý `@dqbd/tiktoken` (ContextGuard) ý `zod` (validaciýn en tiempo de ejecuciýn)

---

## Licencia

**MIT**  libre de usar, modificar y distribuir. Ver [LICENSE](LICENSE).

---

*AI Toolbox es un plugin todo-en-uno para LM Studio y kit de herramientas de agentes IA para LLMs locales: herramientas de archivo seguras, býsqueda a prueba de cuelgues, builds en segundo plano, automatizaciýn de navegador headless, flujos de Git & GitHub, OCR, visualizaciýn de datos, RAG semýntico local sobre PDF/DOCX/XLSX, memoria entre proyectos, ventanas de contexto auto-gestionadas  116 llamadas de herramienta listas que tu modelo puede usar con cero cýdigo pegajoso.*
