import { useState, useEffect, useCallback } from "react";
import ReactApexChart, { Props as ApexChartProps } from "react-apexcharts";
import ApexCharts, { ApexOptions } from "apexcharts";
import { useSharedWebSocket } from "../../context/WebSocketContext";

interface ApiDataItem {
	_id: string;
	suhu?: number;
	jarak?: number;
	created_at: string;
}

const CHART_ID = "realtime-statistics-chart";

export default function StatisticsChart() {
	const { lastMessage } = useSharedWebSocket();
	const [loading, setLoading] = useState(true);

	const [series, setSeries] = useState<ApexChartProps["series"]>([
		{ name: "Temperature", data: [] },
		{ name: "Distance", data: [] },
	]);

	const options: ApexOptions = {
		chart: {
			id: CHART_ID,
			height: 310,
			type: "area",
			fontFamily: "Outfit, sans-serif",
			toolbar: { show: false },
		},
		colors: ["#465FFF", "#FF8C00"],
		stroke: { curve: "smooth", width: 2 },
		fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
		markers: { size: 0 },
		dataLabels: { enabled: false },
		tooltip: { x: { format: "HH:mm:ss" } },
		xaxis: {
			type: "datetime",
			labels: { datetimeUTC: false, format: "HH:mm" },
		},
		yaxis: [{ title: { text: "Temperature (°C)" } }, { opposite: true, title: { text: "Distance (cm)" } }],
	};

	const fetchInitialData = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch("http://localhost:8080/data/latest");
			const result = await response.json();
			if (result.success && result.data) {
				const reversedData: ApiDataItem[] = result.data.reverse();
				const temperatureData: [number, number][] = [];
				const distanceData: [number, number][] = [];

				reversedData.forEach((item) => {
					const timestamp = new Date(item.created_at).getTime();
					if (item.suhu !== undefined) temperatureData.push([timestamp, item.suhu]);
					if (item.jarak !== undefined) distanceData.push([timestamp, item.jarak]);
				});

				setSeries([
					{ name: "Temperature", data: temperatureData },
					{ name: "Distance", data: distanceData },
				]);
			}
		} catch (error) {
			console.error("Failed to fetch initial chart data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchInitialData();
	}, [fetchInitialData]);

	useEffect(() => {
		if (lastMessage) {
			const timestamp = new Date().getTime();
			const newTempData = lastMessage.suhu !== undefined ? [[timestamp, lastMessage.suhu]] : [];
			const newDistData = lastMessage.jarak !== undefined ? [[timestamp, lastMessage.jarak]] : [];

			ApexCharts.exec(CHART_ID, "appendData", [{ data: newTempData }, { data: newDistData }]);
		}
	}, [lastMessage]);

	return (
		<div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 overflow-hidden">
			<div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
				<div>
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
					<p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Real-time distance and temperature data</p>
				</div>
			</div>
			<div className="max-w-full overflow-hidden">
				{loading ? (
					<div style={{ height: 310, display: "flex", alignItems: "center", justifyContent: "center" }}>Loading Chart...</div>
				) : (
					// 4. Kita tidak lagi membutuhkan `ref` di sini
					<ReactApexChart options={options} series={series} type="area" height={310} />
				)}
			</div>
		</div>
	);
}
