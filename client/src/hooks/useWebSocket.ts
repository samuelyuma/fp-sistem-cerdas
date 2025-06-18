import { useState, useEffect, useRef } from "react";

interface WebSocketMessage {
	suhu?: number;
	jarak?: number;
	temp_status?: "Dingin" | "Panas" | "Sangat Panas";
	distance_status?: "Jauh" | "Dekat" | "Sangat Dekat";
	machine_state?: boolean;
}

export const useWebSocket = (url: string) => {
	const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);

	const ws = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (!url || ws.current) return;

		console.log(`Setting up WebSocket connection to ${url}`);
		ws.current = new WebSocket(url);

		ws.current.onopen = () => {
			console.log("✅ WebSocket connected!");
			setIsConnected(true);
		};

		ws.current.onmessage = (event: MessageEvent) => {
			try {
				const data: WebSocketMessage = JSON.parse(event.data);
				setLastMessage(data);
			} catch (error) {
				console.error("Failed to parse WebSocket message:", error);
			}
		};

		ws.current.onclose = () => {
			console.log("🔌 WebSocket disconnected.");
			setIsConnected(false);
			ws.current = null;
		};

		ws.current.onerror = (event: Event) => {
			console.error("❌ WebSocket error:", event);
			ws.current?.close();
		};

		const currentWs = ws.current;

		return () => {
			console.log("Closing WebSocket connection...");
			currentWs.close();
		};
	}, [url]);

	return { lastMessage, isConnected };
};
