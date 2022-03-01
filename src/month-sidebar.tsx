import { Period, period_to_string } from "./types";

interface MonthSidebarProperties {
	periods: Period[];
	active?: Period | null;
	onPeriodChange?: (period: Period) => void;
}

function same_period(a: Period | null | undefined, b: Period | null | undefined): boolean {
	return a?.year == b?.year && a?.month == b?.month;
}

const MonthSidebar = (props: MonthSidebarProperties) => {
	return(
		<div className="sidebar">
			{props.periods
				.sort_by(p => p.month, true)
				.sort_by(p => p.year, true)
				.map(period => 
			<button
			key={period.year*100 + period.month}
			className={ ["p-2 rounded-lg cursor-pointer min-w-max font-medium w-full",
				same_period(period, props.active)? 
					"bg-indigo-400 text-white" : 
					"bg-indigo-100 hover:bg-indigo-200 text-gray-600"].join(' ') }
			onClick={() => props.onPeriodChange?.(period)}>
				{period_to_string(period)}
			</button> )}
		</div>
	)
};

export default MonthSidebar;