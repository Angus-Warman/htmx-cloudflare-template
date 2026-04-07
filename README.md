# HTMX Cloudflare Template

This template repository creates a full-stack application in one command. It uses [HTMX](https://htmx.org/), [Hono](https://hono.dev/), [Kysely](https://www.kysely.dev/) and [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/).

See it in action [here](https://htmx-cloudflare-template.anguswarman.workers.dev).


## Getting Started

### Setup

1. `npm run setup` (This installs, updates, renames and runs the project)


### Admin

One page [/admin](src/public/admin.html) and the handful of endpoints it uses are [password-protected](src/utils/requireAuth.ts). To access:

1. Rename [.dev.vars.example](.dev.vars.example) to `.dev.vars`, and change the password (locally)
2. `npm run set-admin-password` ([adds a secret to your Cloudflare project](https://developers.cloudflare.com/workers/configuration/secrets/#adding-secrets-to-your-project))

This uses [HTTP Basic Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication).


### Production

1. Requires a [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. `npm run deploy`


## Next Steps

This template contains three different examples of how application pages might be built. 

The [Home page](src/public/index.html) is the simplest, using static HTML for the majority of the content, and making [API requests](src/worker.ts) as needed.

The [Data Entry page](src/pages/DataEntry/DataEntryPage.tsx) is a little more involved. It uses TSX to perform basic [Server Side Rendering](https://www.geeksforgeeks.org/javascript/server-side-rendering-vs-client-side-rendering-vs-server-side-generation/) (a.k.a. the endpoint returns HTML, not JS or JSON). The five functions in DataEntryPage.tsx are all the CRUD operators required.

The [Live Chat page](src/public/chat.html) uses the [ChatObject](src/ChatObject.ts) to handle WebSocket communication and routing between users. Minimal complexity in exchange for low-latency multiplayer features.

Three [database tables](src/db/Database.ts) are created when the project first runs, with migrations run [automatically](src/db/runMigrations.ts).


## DurableObjects vs. D1 vs. PostgreSQL

While a fully productionised web-app should probably use a dedicated database like [D1](https://developers.cloudflare.com/d1/), the Cloudflare Free plan only has [ten D1 slots](https://developers.cloudflare.com/d1/platform/limits/). Using an external [PostgreSQL](https://developers.cloudflare.com/hyperdrive/) database is also a great idea, but requires extensive configuration outside the scope of this template.

On the other hand, DurableObject instances are (effectively) [unlimited](https://developers.cloudflare.com/durable-objects/platform/limits/). Tooling has recently been improved, and any object can be [directly edited](https://developers.cloudflare.com/durable-objects/observability/data-studio/). 


## Vendored libraries

Per the advice of the HTMX developers, two of the libraries have been [vendored](https://htmx.org/essays/vendoring/) directly into this template. You can find them [here](src/public/lib).
