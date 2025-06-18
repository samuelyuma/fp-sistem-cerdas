import { useState, useEffect } from "react";
import { LandPlot, Thermometer } from "lucide-react";
import { useSharedWebSocket } from "../../context/WebSocketContext";

interface MetricState {
	value: number | null;
	status: string | null;
}

export default function Metrics() {
	const { lastMessage } = useSharedWebSocket();

	const [temperature, setTemperature] = useState<MetricState>({ value: null, status: null });
	const [distance, setDistance] = useState<MetricState>({ value: null, status: null });

	useEffect(() => {
		if (lastMessage) {
			if (lastMessage.suhu !== undefined) {
				setTemperature({
					value: lastMessage.suhu,
					status: lastMessage.temp_status || null,
				});
			}
			if (lastMessage.jarak !== undefined) {
				setDistance({
					value: lastMessage.jarak,
					status: lastMessage.distance_status || null,
				});
			}
		}
	}, [lastMessage]);

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
			<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
				<div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
					<Thermometer className="text-gray-800 size-6 dark:text-white/90" />
				</div>
				<div className="flex items-end justify-between mt-5">
					<div>
						<span className="text-sm text-gray-500 dark:text-gray-400">Temperature</span>
						<h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{temperature.value !== null ? `${temperature.value}°C (${temperature.status || ""})` : "-"}</h4>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
				<div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
					<LandPlot className="text-gray-800 size-6 dark:text-white/90" />
				</div>
				<div className="flex items-end justify-between mt-5">
					<div>
						<span className="text-sm text-gray-500 dark:text-gray-400">Distance</span>
						<h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">{distance.value !== null ? `${distance.value} cm (${distance.status || ""})` : "-"}</h4>
					</div>
				</div>
			</div>
			{/* */}
		</div>
	);
}
