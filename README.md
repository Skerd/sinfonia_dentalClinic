# dentalClinic Module (Sinfonia)

Client-side UI for the Arpeggio dental clinic domain: admin panel pages (day view, appointments, team, time off, treatments, locations, settings) and the public clinic site.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/dentalClinic/`.

Enable via `VITE_ENABLED_MODULES=dentalClinic` (or leave unset to load all present modules). Its public pages run in the portal (`npm run dev -- up dentalClinic`): under `/dentists` on a clinic's own site, `/dentists/<slug>` on the apex.

## Directory layout

```
dentalClinic/
├── assets/languages/<locale>/     # dictionaries in 5 locales
├── clients/client/public/         # public site pages (treatments, team, booking wizard, manage)
├── clients/portal/                # portal contribution and account section
└── clients/panel/                 # panel pages, day view, sidebar and route contributions
```
