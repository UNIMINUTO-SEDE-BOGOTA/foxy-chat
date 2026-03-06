# 🦊 FOXY — Asistente Inteligente

**FOXY** es un asistente de IA conversacional construido con **React + Vite**, diseñado como una interfaz de chat moderna con animaciones fluidas y una experiencia de usuario intuitiva.

> **F**acilitador · **O**bservador · e**X**perto · **Y** estratégico

---

## 🚀 Tecnologías

- [Vite](https://vitejs.dev/) — bundler ultrarrápido
- [React](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) — estilos utilitarios
- [Motion (Framer Motion)](https://motion.dev/) — animaciones
- [Lucide React](https://lucide.dev/) — íconos

---

## 📦 Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/tu-usuario/foxy.git
cd foxy
npm install
```

---

## ▶️ Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Build para producción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`.

Para previsualizar el build localmente:

```bash
npm run preview
```

---

## 📁 Estructura del proyecto

```
foxy/
├── public/
│   ├── 2.png          # Avatar pequeño (header y mensajes)
│   ├── 3.png          # Avatar pantalla de bienvenida
│   └── 7.png          # Imagen principal de bienvenida
├── src/
│   ├── components/
│   │   ├── ChatPanel.tsx        # Panel principal del chat
│   │   ├── WelcomeAnimation.tsx # Animación de entrada
│   │   └── ui/                  # Componentes base (Button, Textarea, etc.)
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## ⚙️ Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build localmente |
| `npm run lint` | Ejecuta el linter |

---

## 📋 Requisitos

- **Node.js** >= 18
- **npm** >= 9


MIT © FOXY
  
