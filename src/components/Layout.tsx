import { JSX } from "hono/jsx/jsx-runtime";
import NavBar from "./NavBar";

export default function Layout(title: string, main: JSX.Element) {
	// The DOCTYPE element is not valid JSX, handled here explicitly
	return "<!DOCTYPE html>" + Root(title, main).toString()
}

export function Root(title: string, main: JSX.Element) {
	return <html lang="en">

		<head>
			<title>{title}</title>

			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="color-scheme" content="dark" />

			<link rel="stylesheet" href="/styles.css" />

			<script src="/lib/htmx-2.0.8.js"></script>
			<script src="/lib/htmx-ws.js"></script>
		</head>

		<body hx-indicator="#loading-indicator">
			<NavBar currentTitle={title} />

			<img id="loading-indicator" class="loading-indicator" src="/img/spinner.svg" alt="Loading" />

			<main>
				{main}
			</main>
		</body>

	</html>
}
