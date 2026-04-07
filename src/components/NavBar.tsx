
export default function NavBar({ currentTitle }: { currentTitle: string }) {
	const links = [
		{ href: "/", title: "Home" },
		{ href: "/data", title: "Data Entry" },
		{ href: "/chat", title: "Live Chat" },
		{ href: "/admin", title: "Admin" },
	]

	return <nav hx-target="body" hx-push-url="true" hx-swap="transition:true">
		{
			links.map(l => {
				return <a hx-get={l.href} href={l.href} class={currentTitle === l.title ? "active" : ""}>{l.title}</a>
			})
		}
	</nav>
}