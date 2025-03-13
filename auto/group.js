#!/bin/env node

import Sharp from "sharp";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
process.chdir(__dirname);

const skins = JSON.parse(await fs.readFile("skins.json")).skins;

const out = {};

async function processSkin(skin) {
	// const img = new Sharp(`skins/${skin.name}.${skin.imgtype}`);
	const name = skin.name.toLowerCase();
	delete skin.name;
	skin.uhd = skin.hd.uhd;
	delete skin.hd;
	skin.pack = skin.skinpack;
	delete skin.skinpack;
	skin.version = skin.gameversion;
	delete skin.gameversion;
	skin.format = skin.imgtype;
	delete skin.imgtype;
	if (skin.license.toLowerCase() === "unknown")
		delete skin.license;
	for (const key in skin) {
		const type = typeof(skin[key]);
		if (type === "string") {
			if (skin[key].length === 0)
				delete skin[key];
			else
				skin[key] = skin[key].toLowerCase();
		} else if (type === "boolean") {
			if (!skin[key])
				delete skin[key];
		} else {
			delete skin[key];
		}
	}
	out[name] = skin;
}

await Promise.all(skins.map(skin => processSkin(skin)));

await fs.writeFile("../data/auto.json", JSON.stringify({ skins: out, filters: {} }, null, "\t"));
