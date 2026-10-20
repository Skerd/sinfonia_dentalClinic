# dentalClinic Module (Sinfonia)

Client-side UI for the Arpeggio dental clinic domain: admin panel pages (day view, appointments, team, time off, treatments, locations, settings) and the public clinic site.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/dentalClinic/`.

Enable via `VITE_ENABLED_MODULES=dentalClinic` (or leave unset to load all present modules). Run the public site with `npm run clinic`.

## Directory layout

```
dentalClinic/
├── apps/clinic/                   # public site entry (treatments, team, booking wizard, manage)
├── assets/languages/<locale>/     # dictionaries in 5 locales
├── clients/client/public/         # public site pages
└── clients/panel/                 # panel pages, day view, sidebar and route contributions
```
