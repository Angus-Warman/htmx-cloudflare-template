# HTMX Cloudflare Template

This template repository creates a full-stack application in one command. It uses [HTMX](https://htmx.org/), [Hono](https://hono.dev/), [Kysely](https://www.kysely.dev/) and [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/).


## Getting Started

### Setup

1. `pnpm run setup` (This installs, updates, renames and runs the project)


### Production

1. Requires a [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. `pnpm run deploy`


## Vendored libraries

Per the [advice](https://four.htmx.org/essays/vendoring/) of the HTMX developers, HTMX v4 has been vendored into this template.
