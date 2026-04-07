import { Metric } from "@/types";

export function DataEntryRows({ rows }: { rows: Metric[]; }) {
	if (rows.length === 0) {
		return <tr>
			<td colspan={4}>
				<div class="centre">
					<span>No data</span>
				</div>
			</td>
		</tr>;
	}

	return <>
		{rows.map(row =>
			<tr>
				<td>{row.ID}</td>
				<td>{timeAgo(row.timestamp)}</td>
				<td>{row.expected}</td>
				<td>{row.actual}</td>
				<td class="row right">
					<button hx-get={`/form/edit-metric/${row.ID}`} hx-swap="none">Edit</button>
					<button hx-delete={`/api/metric/${row.ID}`} hx-target="#data-entry-rows" hx-confirm={`Delete row ${row.ID}?`}>Del.</button>
				</td>
			</tr>
		)}
	</>;
}

function timeAgo(timestamp: number) {

	const pluralise = (quantity: number, unit: string) => {
		if (quantity !== 1) {
			return unit + "s";
		}

		return unit;
	};

	const now = Date.now();

	const ms = Math.max(0, now - timestamp); // TODO: handle the future
	const sec = Math.floor(ms / 1000);
	const min = Math.floor(sec / 60);
	const hours = Math.floor(min / 60);
	const days = Math.floor(hours / 24);

	if (ms < 1000) return "Just now"
	if (sec < 60) return `${sec} ${pluralise(sec, "second")} ago`;
	if (min < 60) return `${min} ${pluralise(min, "minute")} ago`;
	if (hours < 24) return `${hours} ${pluralise(hours, "hour")} ago`;
	return `${days} ${pluralise(days, "day")} ago`;
}

