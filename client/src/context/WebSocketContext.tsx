import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

interface WebSocketMessage {
	suhu?: number;
	jarak?: number;
	temp_status?: "Dingin" | "Panas" | "Sangat Panas";
	distance_status?: "Jauh" | "Dekat" | "Sangat Dekat";
	created_at?: string;
}

interface WebSocketContextType {
	lastMessage: WebSocketMessage | null;
	isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({
	lastMessage: null,
	isConnected: false,
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSharedWebSocket = () => {
	return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
	const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const ws = useRef<WebSocket | null>(null);

	const url = "ws://localhost:8080/ws";

	useEffect(() => {
		if (typeof window === "undefined" || ws.current) return;

		console.log("Creating SINGLE WebSocket connection...");
		ws.current = new WebSocket(url);

		ws.current.onopen = () => {
			console.log("✅ SHARED WebSocket connected!");
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
			console.log("🔌 SHARED WebSocket disconnected.");
			setIsConnected(false);
			ws.current = null;
		};

		ws.current.onerror = (event: Event) => {
			console.error("❌ SHARED WebSocket error:", event);
			ws.current?.close();
		};
	}, []);

	const value = { lastMessage, isConnected };

	return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
