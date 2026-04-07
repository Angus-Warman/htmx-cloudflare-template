import { Context } from "@/types";

export function AddMetricForm() {
	return <dialog id="form-host" hx-swap-oob="true" hx-on--after-settle="this.showModal();">
		<h3>Add metric row</h3>

		<form hx-post="/api/metric" hx-target="#data-entry-rows" class="column">
			<div class="grid">
				<label>
					Expected
					<input name="expected" type="number" step="0.1" required value={0} />
				</label>

				<label>
					Actual
					<input name="actual" type="number" step="0.1" required value={0} />
				</label>
			</div>

			<div class="right row">
				<button type="submit" onclick="this.closest('dialog').close()">Submit</button>
				<button type="button" onclick="this.closest('dialog').close()">Cancel</button>
			</div>
		</form>
	</dialog>;
}

export async function renderAddMetricForm(c: Context) {
	return c.html(AddMetricForm())
}