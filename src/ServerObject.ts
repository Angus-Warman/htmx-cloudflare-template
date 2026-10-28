import { DurableObject } from "cloudflare:workers";
import runMigrations from "@/db/runMigrations";
import { connectDB } from "@/db/Database";
import { Hono } from "hono";
import { registerHome } from "./pages/Home";
import { registerAdmin } from "./pages/Admin";

export default class ServerObject extends DurableObject {
    app: Hono<{ Bindings: Env }>

	constructor(ctx: DurableObjectState, env: Env) {
        super(ctx, env)

        runMigrations(this.ctx.storage.sql)

        const db = connectDB(ctx)

        this.app = new Hono<{ Bindings: Env }>()

        registerHome(this.app, db)
        registerAdmin(this.app, db)
	}

    async fetch(req: Request) {
        return this.app.fetch(req)
	}
}
