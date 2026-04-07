import { Context as HonoContext } from "hono"

export type Metric = {
	ID: number,
	timestamp: number,
	expected: number,
	actual: number,
}

export type ChatMessage = {
	fromID: string,
	timestamp: number,
	content: string
}

export type Context = HonoContext<{ Bindings: Env }>