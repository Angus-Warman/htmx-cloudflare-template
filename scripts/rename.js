#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import path from "path";
import process from "process";

const templateName = "htmx-cloudflare-template";

const filesToProcess = [
	"wrangler.toml",
	"package.json",
	"package-lock.json"
];

async function replaceInFile(filePath, replaceString, withString) {
	try {
		const originalContent = await readFile(filePath, "utf8");

		if (!originalContent.includes(replaceString)) {
			return;
		}

		const updatedContent = originalContent.split(replaceString).join(withString);

		await writeFile(filePath, updatedContent, "utf8");
		console.log(`Updated: ${filePath}`);
	} catch (err) {
		if (err.code === "ENOENT") {
			console.log(`Skipped missing file: ${filePath}`);
		} else {
			console.error(`Error in ${filePath}:`, err.message);
		}
	}
}

async function main() {
	const folderName = path.basename(process.cwd());

	if (folderName === templateName) {
		console.error(`Folder name is still "${templateName}". Rename the folder first.`);
		return;
	}

	console.log(`Renaming "${templateName}" to "${folderName}"`);

	for (const file of filesToProcess) {
		await replaceInFile(file, templateName, folderName);
	}

	console.log("Done\n");
}

main();