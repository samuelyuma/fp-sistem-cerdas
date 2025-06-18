import StatisticsChart from "../../components/main/StatisticsChart";
import Metrics from "../../components/main/Metrics";
import LiveHistory from "../../components/main/LiveHistory";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
	return (
		<>
			<PageMeta title="Dashboard" description="Dashboard admin of the smart system final project." />
			<div className="grid grid-cols-12 gap-4 md:gap-6">
				<div className="col-span-12">
					<Metrics />
				</div>

				<div className="col-span-12">
					<StatisticsChart />
				</div>

				<div className="col-span-12">
					<LiveHistory />
				</div>
			</div>
		</>
	);
}
