#!/bin/env node

import fs from "fs/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";

const urlSkinList = "https://ddnet.org/skins/skin/skins.json";
const urlSkin = "https://ddnet.org/skins/skin/community/";

function downloadFile(url, path) { return new Promise(async (resolve, reject) => {
	console.info(`Downloading ${url} to ${path}`);
	const res = await fetch(url);
	const file = createWriteStream(path);
	Readable.fromWeb(res.body).pipe(file);
	file.on("finish", resolve);
}); }

function downloadSkinList() {
	return downloadFile(urlSkinList, "skins.json")
}

async function exists(path) {
	try {
		await fs.access(path);
		return true;
	} catch (e) {
		if (e.code !== "ENOENT")
			throw e;
		return false;
	}
}

async function downloadSkins(skins) {
	await Promise.all(skins.map(async ({ name, imgtype }) => {
		const path = `${name}.${imgtype}`;
		if (await exists(`skins/${path}`))
			return;
		try {
			await downloadFile(`${urlSkin}${path}`, path);
		} catch(e) {
			console.warn(`Downloading ${url} failed`);
			console.error(e);
		}
	}));
}

if (!await exists("skins.json"))
	await downloadSkinList();

const skins = JSON.parse(await fs.readFile("skins.json")).skins;

if ((await fs.readdir("skins")).length !== skins.length)
	await downloadSkins(skins);
