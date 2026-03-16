# musk-counter

Веб-приложение на React/Vite: живой счётчик роста состояния Илона Маска с визуальными milestone-карточками и блоком методологии расчёта.

## Stack

- React 19
- Vite 7
- Framer Motion
- ESLint

## Quick Start

```bash
npm install
npm run dev
```

Локально: `http://localhost:5173`

## Scripts

- `npm run dev` - запуск dev-сервера
- `npm run build` - production-сборка
- `npm run preview` - локальный просмотр production-сборки
- `npm run lint` - проверка линтером

## Project Structure

- `src/App.jsx` - основная логика счётчика и UI
- `src/content/milestones.js` - milestone-данные
- `src/content/how-we-counted.md` - методология расчёта
- `public/` - статические файлы
