import { BrowserRouter as Router, Routes, Route } from "react-router";
import AppLayout from "./layout/AppLayout";
import Home from "./pages/Dashboard/Home";
import { WebSocketProvider } from "./context/WebSocketContext";

export default function App() {
	return (
		<WebSocketProvider>
			<Router>
				<Routes>
					<Route element={<AppLayout />}>
						<Route index path="/" element={<Home />} />
					</Route>
				</Routes>
			</Router>
		</WebSocketProvider>
	);
}
