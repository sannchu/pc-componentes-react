# React + Vite

## Catálogo conectado a MongoDB

El menú **Todas las categorías** consulta `GET /api/Tienda/Categorias` cada vez que se abre. La interfaz recorre recursivamente la jerarquía que devuelve la API; si esta entrega documentos planos de MongoDB, `pathCat` se usa para construir las relaciones padre-hijo. El panel de escritorio muestra raíces y descendientes a la vez; en móvil permite entrar y volver entre paneles. Los grupos que contienen categorías hijas se expanden como acordeón.

Las categorías se abren en `/categorias/<ruta-jerárquica>`; **Portátiles** usa la ruta solicitada `/categorias/portatiles`. Los enlaces “Todo en…” añaden `?descendientes=true` para que la API incluya los productos de toda la rama. La página convierte la ruta al `pathCat` de Mongo y consulta `GET /api/Tienda/Productos?categoria=<pathCat>`.

La página muestra todos los productos devueltos, incluidas las unidades no disponibles, sin limitar la solicitud a una página. También conserva las rutas antiguas `/productos/*` y `/Productos/Categoria?nombreCat=...`. Los estados de carga, error con reintento y resultado vacío se muestran en la interfaz.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
