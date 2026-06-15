/* Selección/recuerdo de idioma.
 * Idioma por defecto: español (raíz). Inglés en /en/.
 *
 * Comportamiento:
 *   - Primera visita (sin preferencia guardada): se detecta por el código de idioma del
 *     navegador. Se queda en español/raíz solo si el código es español (es-*: es, es-ES,
 *     es-MX, ...) o tiene región España (*-ES: es-ES, ca-ES, gl-ES, eu-ES, ...); en
 *     cualquier otro caso -> inglés (/en/). La decisión se RECUERDA.
 *   - Visitas siguientes: se respeta la preferencia guardada en localStorage y se
 *     fuerza a la versión correcta en cualquier página (preferencia "autoritativa").
 *   - Cambio MANUAL de idioma (selector de la cabecera u otro enlace que cambie de
 *     idioma): se intercepta el clic y se actualiza la preferencia guardada ANTES de
 *     navegar, de modo que la elección manual no se deshace.
 *
 * El base path del sitio lo inyecta Hugo en window.BEMETA_BASE ("" | relURL), por lo
 * que funciona tanto en subcarpeta (/bemeta/) como en la raíz de un dominio propio (/).
 */
(function () {
  try {
    var KEY = "bemeta_lang_choice";
    var base = (window.BEMETA_BASE || "/").replace(/\/+$/, "");  // "/bemeta" o "" (dominio propio)

    // Idioma de una ruta (relativa al base): "/en" o "/en/..." => en; resto => es.
    function relPath(pathname) {
      var r = pathname.indexOf(base) === 0 ? pathname.slice(base.length) : pathname;
      return r === "" ? "/" : r;
    }
    function langOf(rel) {
      return (rel === "/en" || rel.indexOf("/en/") === 0) ? "en" : "es";
    }
    // URL (relativa al base) de una ruta en el idioma dado.
    function toLangPath(rel, lang) {
      var stripped = rel.replace(/^\/en(\/|$)/, "/");           // quita prefijo /en si lo hay
      if (stripped === "") stripped = "/";
      return lang === "en"
        ? base + "/en" + (stripped === "/" ? "/" : stripped)
        : base + stripped;
    }

    var rel = relPath(window.location.pathname);
    var current = langOf(rel);

    // 1) Idioma deseado: preferencia guardada > código de idioma del navegador > inglés.
    //    Solo se queda en español si el código es español (es-*: es, es-ES, es-MX, es-419,
    //    ...) o tiene región España (*-ES: es-ES, ca-ES, gl-ES, eu-ES, ...). Resto, inglés.
    function isSpanish(l) {
      l = (l || "").toLowerCase();
      return l === "es" || l.indexOf("es-") === 0 || /-es$/.test(l);
    }
    var nav = navigator.language || (navigator.languages && navigator.languages[0]) || "";
    var stored = localStorage.getItem(KEY);
    var want = (stored === "en" || stored === "es")
      ? stored
      : (isSpanish(nav) ? "es" : "en");

    // 2) Recordar siempre la decisión (incluida la autodetectada en la primera visita).
    if (stored !== want) {
      try { localStorage.setItem(KEY, want); } catch (e) {}
    }

    // 3) Si la página actual no está en el idioma deseado, ir a la versión correcta.
    if (want !== current) {
      window.location.replace(toLangPath(rel, want));
      return;
    }

    // 4) Enganchar cambios manuales de idioma: al pulsar un enlace interno que lleva a
    //    otro idioma (p. ej. el selector de la cabecera), guardar esa elección antes de navegar.
    document.addEventListener("click", function (ev) {
      try {
        var t = ev.target;
        var a = t && t.closest ? t.closest("a[href]") : null;
        if (!a) return;
        var u = new URL(a.href, window.location.href);
        if (u.host !== window.location.host) return;            // solo enlaces internos
        var toLang = langOf(relPath(u.pathname));
        if (toLang !== current) {                               // el enlace cambia de idioma
          localStorage.setItem(KEY, toLang);
        }
      } catch (e) { /* noop */ }
    }, true);
  } catch (e) { /* noop */ }
})();
