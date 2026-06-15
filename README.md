# Sitio web Proyecto Be-META

Sitio estático bilingüe (español por defecto en la raíz, inglés en `/en/`) del proyecto de
investigación Be-META (PID2023-152614OB-I00), construido con **Hugo + Blowfish** y desplegado
en **GitHub Pages** mediante **GitHub Actions**.

## Mantenimiento rápido

Flujo: **editar Markdown → commit → push a `main`**. El sitio se reconstruye y publica
solo en uno o dos minutos.

### Editar la descripción / objetivos (home)
Edita `content/es/_index.md` (español) y `content/en/_index.md` (inglés).

### Editar un miembro
Cada miembro es una carpeta en `content/es/members/<slug>/` (y `content/en/members/<slug>/`)
con un `index.md` (datos + biografía) y su foto `photo.<ext>`. Edita el `index.md`.
- **Añadir** un miembro: crea la carpeta y el `index.md` siguiendo el formato de uno
  existente, y coloca su foto como `photo.jpg`. Resolución recomendada de la foto:
  **mínimo 400×400 px** (ideal 800×800, cuadrada).
- Los enlaces ausentes (web / Scholar / ORCID) simplemente no se muestran.
- IMPORTANTE: hay que añadir una carpeta por idioma para cada miembro, con su foto y el 
  `index.md` correspondiente en cada carpeta.

### Publicar una noticia
Crea `content/es/news/<slug>/index.md` (y el equivalente en `content/en/`) con `title`,
`date` y el cuerpo. Las entradas `lorem-*` son demo: bórralas cuando haya noticias reales.

### Añadir una publicación (Impacto)
Edita **`references.bib`** (BibTeX). El build ejecuta `scripts/bib2json.py` y el shortcode
`{{< publications >}}` (en `content/*/impact/_index.md`) las pinta agrupadas por año. El
resto de la página de Impacto (vídeos, colaboraciones, difusión) es Markdown libre.
El JSON resultante (`data/publications.json`) es **generado** y está en `.gitignore`: lo
regeneran `make`/CI desde el `.bib`, no hace falta editarlo ni versionarlo a mano.

### Cambiar el enlace de la herramienta / el plan de datos
El enlace a Othimi es el campo `tool_url` del front matter de `content/*/tool/_index.md`;
los repositorios del plan de datos van en `content/*/data-plan/_index.md`.

## Idiomas

- **Español** en la raíz (`/`), **inglés** en `/en/` (`defaultContentLanguage = "es"` y
  `defaultContentLanguageInSubdir = false` en `config/_default/hugo.toml`).
- **Detección automática** (`static/js/lang-autodetect.js`): en la primera visita, si el
  código de idioma del navegador es español (`es-*`) o tiene región España (`*-ES`) se queda
  en español; en cualquier otro caso redirige a inglés. La elección se recuerda en
  `localStorage` y el selector manual de la cabecera la respeta.

## Desarrollo local

Requisitos: Hugo **extended** v0.161.1 (versión fijada, compatible con Blowfish v2.103.0),
Go, y Python 3 con `pip install "bibtexparser>=1.4,<2.0"`.

```bash
make serve   # genera publicaciones y arranca hugo server
make build   # build de producción en public/
```
`make` usa `python3` por defecto; si tienes bibtexparser en un venv, pásalo con
`make build PYTHON=/ruta/al/venv/bin/python`.

> **Home cifrado (eCryptfs, `NAME_MAX`=143):** el CSS con fingerprint de Blowfish (148 bytes)
> excede el límite y `hugo` falla con "file name too long". Redirige las salidas fuera del
> home cifrado:
> ```bash
> HUGO_PUBLISHDIR=/tmp/bemeta-build/public \
> HUGO_RESOURCEDIR=/tmp/bemeta-build/resources \
> HUGO_CACHEDIR=/tmp/bemeta-build/cache \
> hugo server
> ```
> En sistemas de ficheros normales (ext4) y en GitHub Actions no hace falta.

## Despliegue

- Configurado en `.github/workflows/publish.yaml` (push a `main` o ejecución manual).
- **Requisito una sola vez:** en GitHub, **Settings → Pages → Source = GitHub Actions**.

## Actualizar versiones (deliberadamente)

- **Hugo:** cambia `HUGO_VERSION` en `.github/workflows/publish.yaml` y actualiza tu Hugo local.
- **Blowfish:** `hugo mod get github.com/nunocoracao/blowfish/v2@vX.Y.Z`, luego revisa
  `go.mod`/`go.sum`. (Comprueba el rango de Hugo soportado por la nueva versión del tema.)
- **GitHub Actions:** sube el tag de versión en `publish.yaml` (están ancladas a versión concreta).

## baseURL

El `baseURL` definitivo está en `config/_default/hugo.toml` (`https://proyecto-be-meta.github.io/`).
En CI, el workflow inyecta el `baseURL` correcto automáticamente vía `actions/configure-pages`,
por lo que el valor del fichero solo se usa en builds locales.

Si en el futuro se quisiera un **dominio propio**: apuntar el DNS al sitio, añadirlo en 
GitHub (Settings → Pages → Custom domain), crear `static/CNAME` con el dominio y actualizar el `baseURL`.

## Pendiente

- **Enlaces** a los repositorios del Plan de datos.
- **Publicaciones** reales (`references.bib`), **noticias** reales (sustituir `lorem-*`).
- **Revisión** de las traducciones al inglés (biografías y home).
- Las biografías en inglés son **borradores de traducción** marcados (`draft_translation`);
  revisarlas y quitar el marcador cuando estén validadas.