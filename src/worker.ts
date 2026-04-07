import DataObject from "./DataObject";
import ChatObject from "./ChatObject";

export { DataObject };
export { ChatObject };

import { Hono } from "hono";
import { requireAuth } from "./utils/requireAuth";
import { addMetricRow, deleteMetricRow, renderDataEntryPage, updateMetricRow } from "./pages/DataEntry/DataEntryPage";
import { renderEditMetricForm } from "./pages/DataEntry/EditMetricForm";
import { renderAddMetricForm } from "./pages/DataEntry/AddMetricForm";

const app = new Hono<{ Bindings: Env }>();

// Home page
app.get("/api/clicks", async c => {
	const data = c.env.DATA.getByName("global");
	const value = await data.getStat("clicks");
	return c.html(`<span id="clicks">${value}</span>`);
});

app.post("/api/clicks", async c => {
	const data = c.env.DATA.getByName("global");
	const value = await data.incrementStat("clicks");
	return c.html(`<span id="clicks">${value}</span>`);
});

app.get("/api/stats", async c => {
	const data = c.env.DATA.getByName("global");
	const numVisits = await data.incrementStat("visits");

	const res = `
		<div class="grid2">
			<span>Pages</span>
			<span>4</span>

			<span>Dependencies:</span>
			<span>5</span>

			<span>Visits:</span>
			<span>${numVisits}</span>

			<span>Fast:</span>
			<span>blazingly</span>
		</div>
	`

	return c.html(res);
});

// Data entry
app.get("/data", renderDataEntryPage);
app.post("/api/metric", addMetricRow);
app.put("/api/metric/:rowID", updateMetricRow);
app.delete("/api/metric/:rowID", deleteMetricRow);
app.get("/form/edit-metric/:rowID", renderEditMetricForm);
app.get("/form/add-metric", renderAddMetricForm);

// Live Chat
app.get("/ws/chat", async (c) => {
	const roomID = "shared";
	const room = c.env.CHAT.getByName(roomID);
	return room.fetch(c.req.raw); // Forward the raw request
});

// Admin
app.use("/api/admin/*", requireAuth);

app.get("/api/admin/login", c => c.text("Access granted"));

app.post("/api/admin/sql", async c => {
	const form = await c.req.formData();
	const objectName = form.get("object-name") as string;
	const query = form.get("query") as string;
	const dataObject = c.env.DATA.getByName(objectName);
	const result = await dataObject.executeRawSqlQuery(query);
	return c.text(result);
});

export default app;

