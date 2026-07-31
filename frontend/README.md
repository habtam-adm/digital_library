# Frontend - Wolkite University Digital Library

React (Create React App) + MUI client. See the [project README](../README.md) for the
full setup; in short:

```bash
cp .env.example .env   # REACT_APP_API_BASE=http://localhost:5000
npm install
npm start              # http://localhost:3000
npm run build          # production bundle in build/
CI=true npm test       # unit tests
```

Structure:

```
src/api/         axios client and the API calls
src/components/  layout, cards, language switcher, admin dialogs
src/context/     authentication and internationalisation providers
src/i18n/        English and Amharic strings
src/pages/       routed screens
src/utils/       Gregorian <-> Ethiopian calendar conversion
```
