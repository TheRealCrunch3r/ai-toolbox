/**
 * Spanish (es) translations for AI Toolbox plugin
 */

import type { FullTranslationSet } from './types';

export const esTranslations: FullTranslationSet = {
  fileSystem: {
    categoryTitle: '📁 Herramientas del sistema de archivos',
    tools: [
      { toolName: 'list_directory', description: 'Lista los archivos y carpetas en el área de trabajo', parameters: ['path (opcional)'] },
      { toolName: 'read_file', description: 'Lee el contenido de un archivo de texto', parameters: ['file_name'] },
      { toolName: 'save_file', description: 'Crea o sobrescribe un archivo', parameters: ['file_name, content'] },
      { toolName: 'replace_text_in_file', description: 'Reemplaza una cadena exacta en el archivo (USAR PARA INSERCIÓN/SUSTITUCIÓN COMPLEJA — nunca usar line_operations para esto)', parameters: ['file_name, old_string, new_string'] },
      { toolName: 'insert_at_line', description: '⚠️ Solo inserción única — evítalo para cambios estructurales de varios pasos (usa save_file/replace_text_in_file). Inserta texto en un número de línea específico.', parameters: ['file_name, line_number, content'] },
      { toolName: 'append_file', description: 'Añade contenido al final del archivo', parameters: ['file_name, content'] },
      { toolName: 'delete_lines_in_file', description: 'Elimina líneas específicas del archivo', parameters: ['file_name, start_line, end_line (opcional)'] },
      { toolName: 'make_directory', description: 'Crea un nuevo directorio', parameters: ['directory_name'] },
      { toolName: 'move_file', description: 'Mueve o renombra archivo/directorio', parameters: ['source, destination'] },
      { toolName: 'copy_file', description: 'Copia un archivo a una nueva ubicación', parameters: ['source, destination'] },
      { toolName: 'delete_path', description: 'Elimina un archivo o directorio (destructivo)', parameters: ['path'] },
      { toolName: 'delete_files_by_pattern', description: 'Elimina archivos que coincidan con una expresión regular', parameters: ['pattern (regex)'] },
      { toolName: 'find_files', description: 'Busca archivos por patrón de nombre recursivamente', parameters: ['pattern, max_depth (opcional)'] },
      { toolName: 'fuzzy_find_local_files', description: 'Búsqueda difusa de archivos por similitud de nombre/ruta', parameters: ['query, path (opcional), max_results (opcional)'] },
      { toolName: 'get_file_metadata', description: 'Obtiene tamaño, fechas e información de tipo del archivo', parameters: ['path'] },
      { toolName: 'change_directory', description: 'Cambia el directorio de trabajo', parameters: ['directory'] },
      { toolName: 'read_document', description: 'Lee documentos PDF o DOCX', parameters: ['file_path'] },
      { toolName: 'analyze_project', description: 'Ejecuta análisis de linting en todo el proyecto', parameters: [] },
      { toolName: 'read_file_chunked', description: 'Lee archivos en chunks estructurados para superar límites de caracteres, devolviendo índices de inicio/fin para control de streaming en archivos enormes', parameters: ['file_name, chunk_size/max_chunks (opcional)'] },
      { toolName: 'grep_files', description: 'Búsqueda por patrón regex o AST en todo el proyecto — segura contra ReDoS con límite de 15 s; resultados parciales + flag aborted explícito al agotarse el tiempo; node_modules excluido por defecto', parameters: ['pattern (+ include/exclude/limit options)'] },
      { toolName: 'find_replace_all', description: 'Búsqueda y reemplazo regex en varios archivos con vista previa dry-run, copias .bak y filtros de extensión — prevención de cuelgues por límite de profundidad integrada', parameters: ['pattern, replacement (opcional), directory/dry_run/confirm (+ filters)'] },
      { toolName: 'pattern_scan', description: 'Búsqueda recursiva de contenido que devuelve las líneas coincidentes como {file, line, content}; regex inseguras se degradan automáticamente a literal; límites de 256 KB / 10k líneas por archivo con registros de omisión; prefiltro ripgrep fase-1 (B\')', parameters: ['pattern (+ root/mode/caps options)'] },
      { toolName: 'directory_tree', description: 'Visualiza la estructura del directorio en formato árbol con profundidad máxima, tamaños opcionales y exclusión automática de directorios grandes', parameters: ['path/max_depth/show_size (opcional)'] },
      { toolName: 'file_diff', description: 'Compara dos archivos y devuelve un diff unificado con marcadores +/− y números de línea', parameters: ['file_a, file_b'] },
    ],
  },
  webSearch: {
    categoryTitle: '🌐 Herramientas web e investigación',
    tools: [
      { toolName: 'web_search', description: 'Busca en DuckDuckGo/Google/Bing con cadena de reintentos', parameters: ['query, providers (opcional)'] },
      { toolName: 'wikipedia_search', description: 'Busca resúmenes de páginas en Wikipedia', parameters: ['query, lang (opcional)'] },
      { toolName: 'fetch_web_content', description: 'Obtiene el contenido limpio del texto de una página web', parameters: ['url'] },
      { toolName: 'rag_web_content', description: 'Extracción semántica de páginas web basada en RAG', parameters: ['url, query'] },
      { toolName: 'browser_session_open', description: 'Abre una sesión persistente de navegador', parameters: ['url, wait_for_selector (opcional)'] },
      { toolName: 'browser_session_control', description: 'Controla acciones del navegador (clic, escritura, etc.)', parameters: ['array actions, bandera read_page'] },
    ],
  },
  browserAutomation: {
    categoryTitle: '🌐 Herramientas de automatización web',
    tools: [
      { toolName: 'browser_open_page', description: 'Renderizado de página única con Puppeteer', parameters: ['url, screenshot_path (opcional), actions (opcional)'] },
      { toolName: 'browser_session_close', description: 'Cierra una sesión persistente del navegador de forma ordenada, evitando procesos Chromium huérfanos', parameters: [] },
      { toolName: 'preview_html', description: 'Renderiza HTML crudo o un archivo .html existente en el navegador predeterminado del sistema', parameters: ['source (HTML string or path)'] },
      { toolName: 'open_file', description: 'Abre archivos/URLs en la aplicación predeterminada del sistema (Windows start / macOS open / Linux xdg-open)', parameters: ['target'] },
    ],
  },
  gitOperations: {
    categoryTitle: '🐙 Herramientas Git y GitHub',
    tools: [
      { toolName: 'git_status', description: 'Muestra los archivos modificados del repositorio', parameters: [] },
      { toolName: 'git_diff', description: 'Ve los cambios en detalle', parameters: ['file_path (opcional), cached (opcional)'] },
      { toolName: 'git_commit', description: 'Commitea los cambios en el staging area', parameters: ['message'] },
      { toolName: 'git_log', description: 'Muestra el historial de commits', parameters: ['max_count (opcional)'] },
      { toolName: 'git_add', description: 'Pone en staging archivos específicos o todos los cambios', parameters: ['paths (opcional)'] },
      { toolName: 'git_checkout', description: 'Cambia a una rama existente o crea una nueva', parameters: ['branch_name, create_new (opcional)'] },
      { toolName: 'gh_auth', description: 'Comprueba el estado de autenticación de GitHub', parameters: [] },
      { toolName: 'gh_create_issue', description: 'Crea un nuevo issue en GitHub', parameters: ['title, body (opcional), labels (opcional)'] },
      { toolName: 'gh_list_issues', description: 'Lista issues del repositorio', parameters: ['state (opcional), labels (opcional), limit (opcional)'] },
      { toolName: 'gh_view_comments', description: 'Muestra comentarios de un issue o PR', parameters: ['number, type (opcional)'] },
      { toolName: 'gh_create_pr', description: 'Crea una pull request', parameters: ['title, body, head_branch, base_branch (opcional)'] },
      { toolName: 'gh_list_prs', description: 'Lista pull requests', parameters: ['state (opcional), limit (opcional)'] },
      { toolName: 'gh_view_pr_diff', description: 'Obtiene el diff/patch de una PR', parameters: ['number'] },
      { toolName: 'gh_push', description: 'Empuja commits al repositorio remoto', parameters: ['branch (opcional)'] },
      { toolName: 'git_stash', description: 'Gestiona cambios sin commitear: guardar, aplicar, descartar y listar stashes (Git CLI nativo — isomorphic-git no soporta stash)', parameters: ['operation (+ options)'] },
      { toolName: 'git_blame', description: 'Historial de commits por línea mostrando autor, marca de tiempo y hash; la validación de ruta previene ataques de traversal', parameters: ['file_path (+ options)'] },
    ],
  },
  databaseQueries: {
    categoryTitle: '💾 Herramientas de consulta de base de datos',
    tools: [
      { toolName: 'query_database', description: 'Ejecuta consultas SQLite de solo lectura', parameters: ['query (cadena SQL)'] },
    ],
  },
  documentParsing: {
    categoryTitle: '📄 Herramientas de análisis de documentos',
    tools: [
      { toolName: 'read_document', description: 'Lee documentos PDF o DOCX', parameters: ['file_path'] },
    ],
  },
  backgroundCommands: {
    categoryTitle: '⏱️ Herramientas de comandos en segundo plano',
    tools: [
      { toolName: 'run_background_command', description: 'Inicia un proceso de larga duración en segundo plano', parameters: ['command, timeout_hours (obligatorio), name (obligatorio)'] },
      { toolName: 'check_background_command', description: 'Comprueba el estado y la salida del comando en ejecución', parameters: ['id'] },
      { toolName: 'cancel_background_command', description: 'Termina un comando en segundo plano en ejecución', parameters: ['id'] },
    ],
  },
  codeRefactoring: {
    categoryTitle: '🧬 Herramientas de refactorización de código',
    tools: [
      { toolName: 'refactor_code', description: 'Refactorización basada en AST (Babel): renombrar identificadores, mover funciones entre archivos, extraer funciones, limpieza de imports muertos — segura sintácticamente con copia .bak y rollback automático ante fallos; soporta diffs dry-run', parameters: ['file_path, operation, per-operation fields, dry_run (opcional)'] },
    ],
  },
  execution: {
    categoryTitle: '⚡ Herramientas de ejecución',
    tools: [
      { toolName: 'run_javascript', description: 'Ejecuta JavaScript en un contexto VM de Node aislado; eval/require/child_process bloqueados, timeout predeterminado 5 s', parameters: ['javascript, timeout_seconds (opcional)'] },
      { toolName: 'run_python', description: 'Ejecuta Python en una sandbox controlada; imports os/subprocess/sys bloqueados, timeout predeterminado 10 s', parameters: ['python, timeout_seconds (opcional)'] },
      { toolName: 'execute_command', description: '⚠️ Ejecuta comandos de shell con sanitización multinivel y límites de pipe — deshabilitado por defecto', parameters: ['command (+ options)'] },
      { toolName: 'run_in_terminal', description: 'Lanza una ventana de terminal nativa del SO (cmd/PowerShell/zsh/bash) con variables de entorno y opciones de visibilidad', parameters: [] },
      { toolName: 'run_tests', description: 'Detecta automáticamente el framework de pruebas desde package.json (Jest/Mocha/Vitest) y ejecuta la suite del proyecto, devolviendo resultados', parameters: [] },
    ],
  },
  textProcessing: {
    categoryTitle: '📝 Herramientas de procesamiento de texto',
    tools: [
      { toolName: 'text_transform', description: 'Sustitución de texto basada en regex con grupos de captura ($1/$2), rangos de líneas y modos global/insensible a mayúsculas — más seguro que sed de shell', parameters: ['file_name, pattern, replacement (opcional), flags (opcional)'] },
      { toolName: 'line_operations', description: 'Inserta/elimina/reordena líneas estilo awk sin dependencias de shell; tres capas de salvaguardas (anclaje por patrón, huella digital de línea, validación de límites) + verificación de integridad MD5 tras la escritura', parameters: ['file_name, operation, target_line or pattern anchors (+ options)'] },
      { toolName: 'text_extract', description: 'Extracción estructurada de campos de texto delimitado (CSV/TSV/personalizado) usando índices de campo basados en cero', parameters: ['file_name, fields, delimiter (opcional), output_format (opcional)'] },
      { toolName: 'markdown_table_gen', description: 'Genera una tabla Markdown válida a partir de un array de objetos con encabezados, alineación y truncamiento', parameters: ['data, headers (opcional)'] },
    ],
  },
  taskPlanning: {
    categoryTitle: '📋 Herramientas de planificación de tareas',
    tools: [
      { toolName: 'create_plan', description: 'Crea un plan de ejecución multietapa (1–30 pasos); reemplaza cualquier plan activo y devuelve planId + stepCount', parameters: ['goal, steps'] },
      { toolName: 'get_plan', description: 'Devuelve el plan activo con estados de pasos, porcentaje de completado y tiempo transcurrido; null si no existe plan', parameters: [] },
      { toolName: 'update_plan_step', description: 'Actualiza un paso del plan mediante la máquina de estados (pending→in_progress→done; any→blocked; blocked→pending) — note obligatorio al bloquear', parameters: ['planId, index, status, note (required if blocked)'] },
    ],
  },
  contextManagement: {
    categoryTitle: '🧠 Herramientas de contexto y memoria',
    tools: [
      { toolName: 'auto_summarize_context', description: 'Analiza la actividad reciente de la sesión en busca de patrones, uso frecuente de herramientas y decisiones dignas de recordar; se guarda en memoria persistente con alcance global', parameters: ['session_events (+ config_changes)'] },
      { toolName: 'get_context_memory', description: 'Recupera entradas de contexto anteriores filtradas por tipo (decision/pattern/configuration/file_change/error/summary); el scoring recencia×frecuencia muestra primero las entradas recientes y frecuentemente accedidas', parameters: ['type (opcional), limit (opcional)'] },
      { toolName: 'search_context', description: 'Búsqueda difusa de texto en títulos, cuerpos y etiquetas de entradas de contexto; las entradas de sesión expiradas se eliminan antes de buscar (TTL 24 h)', parameters: ['query, max_results (opcional)'] },
      { toolName: 'context_summary', description: 'Resumen estadístico de la memoria persistente: total de entradas, desglose por tipo y recuentos de actividad reciente', parameters: [] },
      { toolName: 'delete_context_entry', description: 'Elimina una entrada de contexto específica por su ID único sin borrar el resto del historial', parameters: ['entry_id'] },
      { toolName: 'clear_context_memory', description: 'Borra todas las entradas de contexto guardadas automáticamente (⚠️ irreversible; requiere confirm=true)', parameters: ['confirm'] },
      { toolName: 'track_important_event', description: 'Registra manualmente un evento, decisión o hito con etiquetas personalizadas para recuperación categorizada', parameters: ['title, content, tags (opcional)'] },
      { toolName: 'save_session_summary', description: 'Guarda un resumen de sesión estructurado (logros, tareas pendientes, decisiones) comprimido para superar el límite SDK de 10k', parameters: ['task_description (+ optional sections)'] },
      { toolName: 'get_session_summary', description: 'Recupera el último resumen de sesión guardado con fallback compatible hacia atrás para datos legacy', parameters: [] },
      { toolName: 'save_memory', description: 'Persiste un hecho en .ai_toolbox_memory.msgpack para continuidad entre sesiones (RAM + copia atómica en disco)', parameters: ['fact'] },
      { toolName: 'get_memory', description: 'Recupera todas las entradas de memoria guardadas; primero se consulta el archivo local del proyecto, luego el almacén persistente', parameters: [] },
      { toolName: 'delete_memory', description: 'Elimina una entrada de memoria específica por su clave única (devuelta durante el guardado)', parameters: ['entry_id'] },
      { toolName: 'list_sessions', description: 'Navega resúmenes de sesión guardados con controles de paginación y límite', parameters: ['limit (opcional), offset (opcional)'] },
      { toolName: 'search_sessions', description: 'Búsqueda por palabras clave en resúmenes de sesión almacenados, del más reciente al más antiguo', parameters: ['query, max_results (opcional)'] },
      { toolName: 'clear_session_index', description: 'Elimina solo todas las entradas ligeras del índice de sesiones — los resúmenes no se tocan (requiere confirm=true)', parameters: ['confirm'] },
      { toolName: 'register_project', description: 'Registra o actualiza un proyecto en el registro interproyectos por nombre + ruta de directorio de trabajo (+ dirs fuente opcionales)', parameters: ['project_name, working_dir_path, source_dirs (opcional)'] },
      { toolName: 'get_project_info', description: 'Recupera los detalles de un proyecto registrado por su ruta de directorio de trabajo', parameters: ['working_dir_path'] },
      { toolName: 'list_projects', description: 'Lista todos los proyectos registrados con rutas, último acceso y recuentos de sesiones', parameters: [] },
      { toolName: 'search_projects', description: 'Busca proyectos registrados por nombre o subcadena de ruta; la sincronización perezosa del registro auto-registra proyectos encontrados en memoria de sesión', parameters: ['query, max_results (opcional)'] },
      { toolName: 'switch_context', description: 'Cambia el almacenamiento de contexto al directorio de trabajo de otro proyecto para recordar memoria/sesiones (confirm-first según banner Step 0.7)', parameters: ['target_working_dir_path'] },
    ],
  },
  vectorRag: {
    categoryTitle: '🔍 Herramientas Vector RAG',
    tools: [
      { toolName: 'rag_index_files', description: 'Indexa un directorio de archivos TS/JS/MD/JSON/YAML/texto para búsqueda semántica con procesamiento por lotes', parameters: ['directoryPath, filePattern (opcional), batchSize (opcional)'] },
      { toolName: 'rag_index_pdf', description: 'Indexa un PDF en chunks limitados por página (~300 palabras cada uno) con procedencia page_number — lecturas acotadas seguras contra OOM', parameters: ['filePath, chunkSize/overlap (opcional)'] },
      { toolName: 'rag_index_docx', description: 'Extrae texto DOCX vía mammoth en chunks limitados por palabra a través del mismo pipeline de embeddings que PDF', parameters: ['filePath, chunkSize/overlap (opcional)'] },
      { toolName: 'rag_index_xlsx', description: 'Indexa todas las hojas de una hoja de cálculo como arrays de filas con prefijo opcional de nombre de hoja para trazabilidad', parameters: ['filePath, chunkSize (opcional), includeSheetNames (opcional)'] },
      { toolName: 'rag_query_vector', description: 'Consulta por similitud coseno sobre el índice vectorial que devuelve top-k chunks con contenido y puntuaciones', parameters: ['query, topK (opcional)'] },
      { toolName: 'rag_clear_index', description: 'Borra todo el índice vectorial (requiere confirm=true); útil antes de un reindexado completo', parameters: ['confirm'] },
      { toolName: 'rag_web_content', description: 'Obtiene una URL y devuelve solo los chunks de texto relevantes para la consulta — extracción acotada y deduplicada', parameters: ['url, query'] },
    ],
  },
  uiGeneration: {
    categoryTitle: '🎨 Herramientas de generación de UI',
    tools: [
      { toolName: 'generate_ui_component', description: 'Crea componentes interactivos HTML/CSS/JS (botones, formularios, tablas) a partir de una descripción del usuario', parameters: [] },
      { toolName: 'render_and_preview_ui', description: 'Renderiza componentes en el navegador con vista previa en vivo para prototipado rápido', parameters: [] },
      { toolName: 'extract_ui_data', description: 'Extrae datos estructurados de páginas mediante selectores CSS/XPath devolviendo salida tabular al chat', parameters: [] },
    ],
  },
  httpClient: {
    categoryTitle: '📡 Herramientas de cliente HTTP',
    tools: [
      { toolName: 'http_request', description: 'Cliente genérico GET/POST/PUT/DELETE/PATCH con lógica de reintento, configuración de timeout y subida multipart — protegido contra SSRF (⚠️ deshabilitado por defecto)', parameters: ['url, method (+ options)'] },
      { toolName: 'http_get_json', description: 'Peticiones GET que esperan respuestas JSON con parseo automático y validación opcional de esquema', parameters: ['url (+ headers/options)'] },
      { toolName: 'http_post_json', description: 'Peticiones POST con payload JSON, manejo automático de content-type y soporte de token de autenticación; devuelve código de estado', parameters: ['url, body (+ options)'] },
    ],
  },
  utilities: {
    categoryTitle: '🔧 Herramientas utilitarias',
    tools: [
      { toolName: 'search_memory', description: 'Búsqueda por palabras clave en memorias almacenadas que devuelve puntuaciones de confianza de relevancia por coincidencia', parameters: ['query (+ options)'] },
      { toolName: 'get_system_info', description: 'Tipo/versión del SO, modelo/cantidad de CPU, memoria total/disponible y estadísticas de uso de disco', parameters: [] },
      { toolName: 'system_monitor', description: 'Métricas detalladas de CPU, memoria, disco e interfaces de red para seguimiento de rendimiento', parameters: [] },
      { toolName: 'process_list', description: 'Procesos en ejecución con %CPU, huella de memoria y jerarquía PID; filtrado por nombre insensible a mayúsculas', parameters: ['name_filter (opcional)'] },
      { toolName: 'env_inspect', description: 'Lista variables de entorno con filtrado opcional por prefijo para inspección dirigida', parameters: ['prefix (opcional)'] },
      { toolName: 'detect_os_environment', description: 'Informa sobre las capacidades del SO asegurando la sintaxis correcta de comandos antes de operaciones shell/ruta', parameters: [] },
      { toolName: 'read_clipboard', description: 'Lee el portapapeles del sistema multiplataforma (GetClipboardData/pbpaste/xclip)', parameters: [] },
      { toolName: 'write_clipboard', description: 'Escribe texto en el portapapeles del sistema con detección automática de plataforma', parameters: ['text'] },
      { toolName: 'send_notification', description: 'Envía una notificación toast nativa del SO con título, cuerpo de mensaje e icono personalizado opcional', parameters: ['title, message (+ options)'] },
      { toolName: 'findLMStudioHome', description: 'Localiza el directorio de instalación de LM Studio entre plataformas, devolviendo la ruta de almacenamiento de modelos', parameters: [] },
      { toolName: 'get_enabled_tools', description: 'Lista las herramientas actualmente habilitadas verificando categorías activas y estado de bypass God Mode', parameters: [] },
      { toolName: 'hash_file', description: 'Genera sumas de verificación MD5/SHA1/SHA256 para verificación de integridad de archivos', parameters: ['file_path, algorithm (opcional)'] },
      { toolName: 'token_count', description: 'Conteo de tokens LLM mediante codificaciones tiktoken (cl100k_base etc.) para estimación de contexto', parameters: ['text or content (+ options)'] },
      { toolName: 'convert_format', description: 'Conversión JSON↔CSV, codificación/decodificación base64 y compresión/decompresión con niveles configurables', parameters: [] },
      { toolName: 'secret_scan', description: 'Escanea archivos en busca de claves API, contraseñas y tokens filtrados; soporta patrones de exclusión personalizados — encuentra secretos antes de publicar', parameters: ['paths (+ options)'] },
      { toolName: 'port_check', description: 'Comprueba la disponibilidad de un puerto TCP en localhost o un host personalizado para verificación de servicios', parameters: ['port, host (opcional)'] },
      { toolName: 'package_manage', description: 'Instala/desinstala/actualiza/audita paquetes npm/pip/cargo (⚠️ requiere el conmutador de configuración packageManage)', parameters: [] },
    ],
  },
  imageProcessing: {
    categoryTitle: '🖼️ Herramientas de procesamiento y análisis de imágenes',
    tools: [
      { toolName: 'image_to_text', description: 'Extracción OCR de texto vía Tesseract.js con puntuaciones de confianza y detección de idioma (máx. 50 MB)', parameters: ['imagePath, language (opcional)'] },
      { toolName: 'describe_image', description: 'Obtiene metadatos de imagen: dimensiones, formato, tamaño y marcas de tiempo para PNG/JPG/BMP/GIF/WebP/TIFF', parameters: ['imagePath'] },
      { toolName: 'screenshot_desktop', description: 'Captura una captura de pantalla del escritorio multiplataforma (GDI+/screencapture/ImageMagick)', parameters: ['outputPath/format/quality (opcional)'] },
      { toolName: 'compare_images', description: 'Comparación a nivel de bytes y dimensiones de dos imágenes; estado de coincidencia exacta para codificaciones idénticas', parameters: ['image1Path, image2Path'] },
      { toolName: 'analyze_image', description: 'Envía una imagen a un modelo con capacidad visual cargado en LM Studio con prompt opcional; devuelve análisis textual + metadatos (⚠️ requiere un modelo visual)', parameters: ['imagePath, prompt (opcional)'] },
    ],
  },
  backupRestore: {
    categoryTitle: '💾 Herramientas de copia de seguridad y restauración',
    tools: [
      { toolName: 'create_backup', description: 'Crea una instantánea ZIP comprimida de todo el directorio de trabajo en .ai_toolbox_backups/ (requiere confirm=true)', parameters: ['confirm, destination/targetDirectory (opcional)'] },
      { toolName: 'list_backups', description: 'Lista copias de seguridad ordenadas por fecha o tamaño con nombre, ruta, tamaño y marca de creación', parameters: ['sortBy/limit (opcional)'] },
      { toolName: 'restore_backup', description: 'Restaura el directorio de trabajo desde un archivo de copia (⚠️ sobrescribe todos los archivos; requiere confirm=true)', parameters: ['backupFile, confirm'] },
      { toolName: 'delete_backup', description: 'Elimina un archivo de copia específico (⚠️ irreversible; valida existencia primero)', parameters: ['backupFile, confirm'] },
      { toolName: 'cleanup_backups', description: 'Lista y opcionalmente elimina copias .bak de edición — dry-run por defecto, se requiere confirmación para eliminar', parameters: ['confirm (opcional)'] },
    ],
  },
  dataVisualization: {
    categoryTitle: '📈 Herramientas de visualización de datos',
    tools: [
      { toolName: 'generate_chart', description: 'Renderiza gráficos bar/line/pie/doughnut/scatter/radar a imagen PNG desde datos crudos; fallback HTML cuando el renderizador no está disponible', parameters: ['type, data (+ title/colors/output_path optional)'] },
    ],
  },
  general: {
    pluginName: 'Complemento AI Toolbox',
    enabledTools: 'Herramientas habilitadas:',
    disabledTools: 'Herramientas deshabilitadas:',
    errorPrefix: 'Error:',
    successPrefix: 'Éxito:',
  },
};
