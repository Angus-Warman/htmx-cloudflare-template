import { ChatMessage } from "@/types";

export function DisplayMessage(message: ChatMessage) {
	const time = new Date(message.timestamp);

	return <div id="chat-messages" hx-swap-oob="beforeend">
		<div class="chat-message"><span>[{time.toLocaleTimeString()}] {message.content}</span></div>
	</div>
}