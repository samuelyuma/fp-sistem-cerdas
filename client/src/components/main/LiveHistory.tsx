import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge, { BadgeColor } from "../ui/badge/Badge";
import { useEffect, useState, useCallback } from "react";
import { useSharedWebSocket } from "../../context/WebSocketContext";

interface Item {
	_id: string;
	suhu?: number;
	jarak?: number;
	temp_status?: "Dingin" | "Panas" | "Sangat Panas";
	distance_status?: "Jauh" | "Dekat" | "Sangat Dekat";
	created_at: string;
}

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	const timePart = [String(date.getHours()).padStart(2, "0"), String(date.getMinutes()).padStart(2, "0"), String(date.getSeconds()).padStart(2, "0")].join(":");
	const datePart = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
	return `${timePart} pada ${datePart}`;
};

export default function LiveHistory() {
	const [data, setData] = useState<Item[] | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	const { lastMessage } = useSharedWebSocket();

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("http://localhost:8080/data/latest");
			if (!response.ok) {
				throw new Error(`HTTP error: Status ${response.status}`);
			}
			const parsedData = await response.json();
			setData(parsedData.data);
		} catch (error) {
			setError((error as Error).message);
			setData(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (lastMessage) {
			setData((currentData) => {
				const newDataArray = [lastMessage as Item, ...(currentData || [])];

				if (newDataArray.length > 5) {
					newDataArray.pop();
				}

				return newDataArray;
			});
		}
	}, [lastMessage]);

	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 w-full">
			<div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Live History</h3>
				</div>
			</div>
			<div className="max-w-full overflow-x-auto">
				<Table>
					<TableHeader className="border-gray-100 dark:border-gray-800 border-y">
						<TableRow>
							<TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
								Type
							</TableCell>
							<TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
								Value
							</TableCell>
							<TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
								Status
							</TableCell>
							<TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
								Timestamp
							</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
						{loading && (
							<TableRow>
								{" "}
								<TableCell className="text-center py-4 col-span-4">
									<p className="text-gray-500 dark:text-gray-400">Loading data...</p>
								</TableCell>
							</TableRow>
						)}
						{error && !loading && (
							<TableRow>
								<TableCell className="text-center py-4 text-red-500 col-span-4">
									<p>Error: {error}</p>
								</TableCell>
							</TableRow>
						)}
						{!loading && !error && data?.length === 0 && (
							<TableRow>
								<TableCell className="text-center py-4 col-span-4">
									<p className="text-gray-500 dark:text-gray-400">No data available.</p>
								</TableCell>
							</TableRow>
						)}

						{!loading &&
							data?.map((item) => {
								const isSuhu = item.suhu !== undefined;
								const type = isSuhu ? "Suhu" : "Jarak";
								const value = isSuhu ? item.suhu : item.jarak;
								const status = isSuhu ? item.temp_status : item.distance_status;

								let badgeColor: BadgeColor = "info";
								if (isSuhu) {
									badgeColor = status === "Dingin" ? "success" : status === "Panas" ? "warning" : "error";
								} else {
									badgeColor = status === "Jauh" ? "success" : status === "Dekat" ? "warning" : "error";
								}

								return (
									<TableRow key={item._id}>
										<TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{type}</TableCell>
										<TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{value}</TableCell>
										<TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
											{status && (
												<Badge size="sm" color={badgeColor}>
													{status}
												</Badge>
											)}
										</TableCell>
										<TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{formatDate(item.created_at)}</TableCell>
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
