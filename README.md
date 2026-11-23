# dentalClinic Module (Sinfonia)

Client-side UI for the Arpeggio dental clinic domain: admin panel pages (day view, appointments, team, time off, treatments, locations, patients' reviews, settings) and the public clinic site, whose home and treatment pages show the published reviews.

Types and validators come from **armonia**; API calls target **maestro** routes under `/api/dentalClinic/`.

Enable via `VITE_ENABLED_MODULES=dentalClinic` (or leave unset to load all present modules). Its public pages run in the portal (`npm run dev -- up dentalClinic`): under `/dentists` on a clinic's own site, `/dentists/<slug>` on the apex.

The portal contribution's `prefetch` (D173) loads a pointed-at link's page code and the clinic config for that company, so its pages open at once.

## Directory layout

```
dentalClinic/
├── assets/languages/<locale>/     # dictionaries in 5 locales
├── clients/client/public/         # public site pages (treatments, team, reviews, booking wizard, manage and review)
├── clients/portal/                # portal contribution and account section
└── clients/panel/                 # panel pages, day view, sidebar and route contributions
```
