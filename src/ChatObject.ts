import { DurableObject } from "cloudflare:workers";
import { DisplayMessage } from "./components/DisplayMessage";
import { ChatMessage } from "./types";
import runMigrations from "./db/runMigrations";
import { Kysely } from "kysely";
import { Database } from "./db/Database";
import { DurableDialect } from "./utils/DurableDialect";

export default class ChatObject extends DurableObject {
	private clients: Map<string, WebSocket>;
	private db;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env)

		// Each time the constructor is called, get clients out of hibernation
		this.clients = new Map<string, WebSocket>

		for (const ws of this.ctx.getWebSockets()) {
			const id = this.getID(ws);
			this.clients.set(id, ws);
		}

		this.db = new Kysely<Database>({
			dialect: new DurableDialect({ ctx })
		})

		runMigrations(ctx.storage.sql);
	}

	async fetch(req: Request): Promise<Response> {
		return this.handleWebsocket(req);
	}

	getID(ws: WebSocket) {
		const tags = this.ctx.getTags(ws);
		const idTag = tags.find(t => t.startsWith("id:"));

		if (!idTag) throw new Error("WebSocket without an ID"); // This should never happen

		const id = idTag.slice(3)

		return id;
	}

	handleWebsocket(req: Request) {
		if (req.headers.get("Upgrade") !== "websocket") {
			return new Response("Expected websocket", { status: 400 });
		}

		const pair = new WebSocketPair();
		const client = pair[0];
		const server = pair[1];

		const id = crypto.randomUUID();
		this.ctx.acceptWebSocket(server, [`id:${id}`]); // Store with ID to keep after hibernation
		this.handleNewClient(server);

		return new Response(null, {
			status: 101,
			webSocket: client
		});
	}

	/** After connecting, send the ten most recent messages */
	async handleNewClient(ws: WebSocket) {
		const recentMessages = await this.db
			.selectFrom("chatMessage")
			.selectAll()
			.orderBy("chatMessage.timestamp", "desc")
			.limit(10)
			.execute();

		recentMessages.reverse();

		for (const message of recentMessages) {
			const display = DisplayMessage(message).toString();
			ws.send(display);
		}
	}

	async saveMessage(message: ChatMessage) {
		return await this.db
			.insertInto("chatMessage")
			.values(message)
			.execute()
	}

	async webSocketMessage(source: WebSocket, message: string) {
		const payload = JSON.parse(message) as { message: string }
		const fromID = this.getID(source);
		const timestamp = Date.now();
		const content = payload.message;

		const chatMessage = { fromID, timestamp, content }
		await this.saveMessage(chatMessage);

		const displayMessage = DisplayMessage(chatMessage).toString()

		// Broadcast to all clients, including the source
		for (const client of this.ctx.getWebSockets()) {
			client.send(displayMessage);
		}
	}

	forwardMessage(payload: any) { // TODO: Give this a type
		const recipient = this.clients.get(payload.to);

		if (!recipient) {
			console.warn(`No peer with ID ${payload.to}`);
			return;
		}

		recipient.send(JSON.stringify(payload));
	}

	webSocketClose(ws: WebSocket) {
		this.remove(ws);
	}

	webSocketError(ws: WebSocket) {
		this.remove(ws);
	}

	remove(ws: WebSocket) {
		ws.close()

		for (let [id, client] of this.clients.entries()) {
			if (client === ws) {
				this.clients.delete(id);
				return;
			}
		}
	}
}