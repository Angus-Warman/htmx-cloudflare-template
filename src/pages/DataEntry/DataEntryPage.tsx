import { Context, Metric } from "@/types";
import { DataEntryRows } from "./DataEntryRows";
import Layout from "@/components/Layout";
import { html } from "hono/html";

export function DataEntryPage(entries: Metric[]) {
	const renderedAt = new Date(Date.now()).toISOString()

	return <>
		<section hx-swap="innerHTML transition:true" class="column">
			<h2>Data Entry</h2>

			<section class="card column">
				<span>This page was generated server-side (<time id="render-time" datetime={renderedAt}></time>) and then sent to the browser in one request.</span>

				{
					// Uses an anonymous function to avoid issues when changing tabs.
					html`
						<script>
							(() => {
								const timeElement = document.getElementById('render-time');
								const renderedAt = new Date(timeElement.dateTime).getTime()
								const now = Date.now();
								const elapsedMs = now - renderedAt;
								timeElement.textContent = elapsedMs + 'ms ago';
							})();
						</script>
					`
				}

				<span>The table rows are a separate, reusable component. When a row is added, modified, or deleted, only the necessary data is sent.</span>

				<span>This method avoids both a slow full-page reload, or complicated client-side state.</span>
			</section>

			<table>
				<thead>
					<tr>
						<th>#</th>
						<th>Created</th>
						<th>Expected value</th>
						<th>Actual value</th>
						<th> {/*Actions*/}
							<div class="right">
								<button title="Add" hx-get="/form/add-metric" hx-swap="none">Add</button>
							</div>
						</th>
					</tr>
				</thead>
				<tbody id="data-entry-rows">
					{/* Component is kept separate, rows can be sent without reloading the whole page */}
					<DataEntryRows rows={entries} />
				</tbody>
			</table>
		</section>

		<div id="form-host" />
	</>
}

export async function renderDataEntryPage(c: Context) {
	const data = c.env.DATA.getByName("global");
	const rows = await data.getMetrics();
	const page = Layout("Data Entry", DataEntryPage(rows))
	return c.html(page)
}

async function getDataEntryRows(c: Context) {
	const data = c.env.DATA.getByName("global");
	const entries = await data.getMetrics();
	const rows = DataEntryRows({ rows: entries })
	return c.html(rows)
}

export async function addMetricRow(c: Context) {
	const form = await c.req.formData();
	const expected = Number(form.get("expected"));
	const actual = Number(form.get("actual"));
	const data = c.env.DATA.getByName("global");
	await data.addMetric(expected, actual)
	return getDataEntryRows(c)
}

export async function updateMetricRow(c: Context) {
	const rowID = Number(c.req.param().rowID);
	const form = await c.req.formData();
	const expected = Number(form.get("expected"));
	const actual = Number(form.get("actual"));
	const data = c.env.DATA.getByName("global");
	const possibleRes = await data.updateMetric(rowID, expected, actual)

	if (possibleRes) {
		return possibleRes
	}

	return getDataEntryRows(c)
}

export async function deleteMetricRow(c: Context) {
	const data = c.env.DATA.getByName("global");
	const rowID = c.req.param().rowID
	await data.deleteMetricRow(rowID)
	return getDataEntryRows(c)
}