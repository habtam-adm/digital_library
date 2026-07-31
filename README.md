# Wolkite University Digital Library

የወልቂጤ ዩኒቨርሲቲ ዲጂታል ቤተ መጻሕፍት

A digital library for Wolkite University: one catalogue for books, undergraduate
theses, teaching modules, past exam papers and journal articles from every college,
with circulation (borrow / return / fines), a bilingual **English + Amharic**
interface, Ethiopian calendar dates and an **OAI-PMH** endpoint that exposes the
institutional repository in Dublin Core so national aggregators can harvest it.

```
frontend/   React (Create React App) + MUI single page application
backend/    Express REST API + MySQL (XAMPP compatible)
```

## Features

| Area | What it does |
| --- | --- |
| Catalogue | Search by title / author / subject / ISBN, filter by material type, language, college, department, year range, availability and digital copy, sorted and paginated |
| Resource page | Full Dublin Core style metadata, in-browser PDF reader, download, related items |
| Circulation | Borrow and return, per-role loan limits and periods, automatic overdue fines in ETB |
| Accounts | Signup with university ID (`WKU/1234/15`), email verification code, password reset, JWT sessions, roles: student, instructor, librarian, admin |
| Administration | Add / edit / delete resources with file upload, loan register with overdue tracking, user role management, statistics by material type and college |
| Ethiopian context | Amharic UI and Amharic titles, Ethiopian calendar (E.C.) shown next to Gregorian dates, the eight Wolkite University colleges and their departments preloaded |
| Interoperability | `/oai` implements OAI-PMH 2.0 (`Identify`, `ListMetadataFormats`, `ListSets`, `ListIdentifiers`, `ListRecords`, `GetRecord`) with `oai_dc` metadata |

## Requirements

- Node.js 18 or newer
- MySQL 5.7+ / MariaDB (XAMPP works out of the box)

## Running it

### 1. Backend

```bash
cd backend
cp .env.example .env      # defaults match XAMPP: user root, empty password
npm install
npm run db:setup          # creates library_db, applies the schema, seeds data
npm start                 # http://localhost:5000
```

`npm run db:setup` seeds the colleges and departments of the university, a starter
catalogue and four demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Administrator | admin@wku.edu.et | Admin@123 |
| Librarian | librarian@wku.edu.et | Library@123 |
| Instructor | instructor@wku.edu.et | Teach@123 |
| Student | student@wku.edu.et | Student@123 |

Change these before deploying anywhere real.

### 2. Frontend

```bash
cd frontend
cp .env.example .env      # REACT_APP_API_BASE=http://localhost:5000
npm install
npm start                 # http://localhost:3000
```

## API

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST | `/api/auth/signup` | create an account, returns the verification code |
| POST | `/api/auth/verify-email` | confirm the code |
| POST | `/api/auth/login` | returns a JWT |
| GET | `/api/auth/me` | current profile |
| POST | `/api/auth/request-reset`, `/api/auth/reset-password` | password reset |
| GET | `/api/colleges`, `/api/departments` | academic structure with counts |
| GET | `/api/resources` | `q, type, language, college_id, department_id, year_from, year_to, available, digital, sort, page, per_page` |
| GET | `/api/resources/:id` | resource, related items, your active loan |
| GET | `/api/resources/:id/file` | stream the digital copy |
| POST/PUT/DELETE | `/api/resources` | librarian or admin, `multipart/form-data` for uploads |
| GET/POST | `/api/loans`, `/api/loans/mine`, `/api/loans/:id/return` | circulation |
| GET | `/api/stats/overview`, `/api/stats/admin`, `/api/stats/users` | dashboards |
| GET | `/oai?verb=...` | OAI-PMH 2.0 provider |

Circulation policy lives in `backend/src/config/env.js`: students may hold 3 items
for 14 days, staff 5 items for 30 days, and the fine is 5 ETB per day late.

## Harvesting the repository

```bash
curl "http://localhost:5000/oai?verb=Identify"
curl "http://localhost:5000/oai?verb=ListRecords&metadataPrefix=oai_dc&set=type:thesis"
```

Sets are `type:<book|thesis|journal|module|exam|reference>` and
`college:<CCI|CET|CNCS|CBE|CMHS|CANR|CSSH|SOL>`.

## Tests

```bash
cd frontend && CI=true npm test
```
