import { Context, Next } from "hono";

export async function requireAuth(c: Context, next: Next): Promise<Response | undefined> {
	if (!c.env.ADMIN_PASSWORD) {
		return new Response("ADMIN_PASSWORD not set, access denied", { status: 403 })
	}

	const authHeader = c.req.header("Authorization")

	// No header, request credentials
	if (!authHeader) {
		return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": `Basic realm="restricted"` } })
	}

	// Standard password login
	if (authHeader.startsWith("Basic ")) {
		const encoded = authHeader.split(' ')[1]
		const decoded = atob(encoded) // Base64 decode
		const [_, password] = decoded.split(':')

		if (!safeEqual(password, c.env.ADMIN_PASSWORD)) {
			// Wrong password, request credentials again
			return new Response("Unauthorized", { status: 401, headers: { "WWW-Authenticate": `Basic realm="restricted"` } })
		}

		await next()
		return
	}

	// Programmatic access
	if (authHeader.startsWith("Bearer ")) {
		if (!c.env.ADMIN_PASSWORD) {
			return new Response("Cannot access secure route without server config", { status: 500 })
		}

		const token = authHeader.split(' ')[1]

		if (!safeEqual(token, c.env.ADMIN_PASSWORD)) {
			return new Response("Unauthorized", { status: 401 })
		}

		await next()
		return
	}
}

function safeEqual(a: string, b: string) {
	const encoder = new TextEncoder();

	const aEnc = encoder.encode(a);
	const bEnc = encoder.encode(b);

	if (aEnc.length !== bEnc.length) {
		// To avoid timing attacks, compare A to A, then return false
		crypto.subtle.timingSafeEqual(aEnc, aEnc)
		return false
	}

	return crypto.subtle.timingSafeEqual(aEnc, bEnc)
}