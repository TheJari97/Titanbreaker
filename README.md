
# Titanbreaker Modular Project

Proyecto dividido por páginas, datos, estilos y lógica.

## Páginas
- index.html -> Guide
- items.html -> Items
- crafts.html -> Crafts
- runewords.html -> Runewords
- pathtrees.html -> Path Trees
- heroes.html -> Heroes

## Recomendación
Edita primero los archivos de `assets/data/` si lo que quieres cambiar es contenido.
Edita `assets/js/render/` solo si quieres cambiar comportamiento.
Edita `assets/css/` solo si quieres cambiar diseño.


## JSON layer
This project now includes JSON mirrors in `assets/json/` and language packs in `assets/i18n/` to keep content easier to maintain while preserving the current static runtime.


## Auto sync helper
This package now includes `tools/update_from_catzee.py`, `tools/update_data.bat` and a cached snapshot under `tools/cache/` to refresh items, talents and heroes from the Catzee public repository.
