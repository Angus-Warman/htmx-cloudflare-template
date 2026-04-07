import { Metric } from "@/types";
import { Context } from "@/types";

export function EditMetricForm(existing: Metric) {
	return <dialog id="form-host" hx-swap-oob="true" hx-on--after-settle="this.showModal();">
		<h3>Update metric row: {existing.ID}</h3>

		<form hx-put={`/api/metric/${existing.ID}`} hx-target="#data-entry-rows" class="column">
			<div class="grid">
				<label>
					Expected
					<input name="expected" type="number" step="0.1" required value={existing.expected} />
				</label>

				<label>
					Actual
					<input name="actual" type="number" step="0.1" required value={existing.actual} />
				</label>
			</div>

			<div class="right row">
				<button type="submit" onclick="this.closest('dialog').close()">Submit</button>
				<button type="button" onclick="this.closest('dialog').close()">Cancel</button>
			</div>
		</form>
	</dialog>;
}

export async function renderEditMetricForm(c: Context) {
	const data = c.env.DATA.getByName("global");
	const rowID = Number(c.req.param().rowID)
	const metric = await data.getMetric(rowID)
	return c.html(EditMetricForm(metric))
}