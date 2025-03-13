import { Parser } from "expr-eval";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
process.chdir(__dirname);

const urlSkin = "https://ddnet.org/skins/skin/community/";

const skins = {};

const parser = new Parser({
	allowMemberAccess: true,
});
parser.functions = {
	"match": (str, pattern, reverse) => {
		if (!str)
			return false;

		let sIndex = 0, pIndex = 0;
		let starIndex = -1, matchIndex = 0;
		let escaped = false;
	
		while (sIndex < str.length) {
			if (pIndex < pattern.length) {
				if (!escaped && pattern[pIndex] === "\\") {
					escaped = true;
					pIndex++;
					continue;
				}

				if (!escaped && pattern[pIndex] === "*") {
					starIndex = pIndex;
					matchIndex = sIndex;
					pIndex++; // Move past "*"
					continue;
				}

				if (pattern[pIndex] === str[sIndex]) {
					// Character match
					sIndex++;
					pIndex++;
					escaped = false;
					continue;
				}
			}
	
			if (starIndex !== -1) {
				// If mismatch but "*" was encountered before, backtrack
				pIndex = starIndex + 1;
				matchIndex++;
				sIndex = matchIndex;
			} else {
				return false; // No match and no "*" to adjust
			}
		}
	
		// Ensure remaining characters in pattern are only "*" or escaped characters
		while (pIndex < pattern.length) {
			if (!escaped && pattern[pIndex] === "\\")
				escaped = true;
			else if (escaped || pattern[pIndex] === "*")
				escaped = false;
			else
				return false;
			pIndex++;
		}
	
		return (pIndex === pattern.length) != reverse;
	}
};
parser.consts = {};
parser.ternaryOps = {};
parser.unaryOps = Object.fromEntries(Object.entries(parser.unaryOps).filter(([name, _]) => 
	name === "not"
));
parser.binaryOps = Object.fromEntries(Object.entries(parser.binaryOps).filter(([name, _]) => 
	["and", "or", "[", "!="].indexOf(name) !== -1
));

const sane = parseFilterStep("(!missing_feet&!missing_eyes&!missing_body&!missing_hands&!too_big&!too_small&!not_round&!bad_outlines&!bad_contrast&!bad_style&!big_accessories)");

function parseFilterStep(filter) {
	function parseWord(word) {
		if (!word)
			return "";
		word = word.toLowerCase();
		const equals = word.match(/(?<!\\)=/);
		if (equals == null) {
			if (word === "sane")
				return sane;
			return `d(${JSON.stringify(word)})`;
		}
		const a = word.slice(0, equals.index);
		const b = word.slice(equals.index + 1);
		return `match(d(${JSON.stringify(a)}),${JSON.stringify(b)})`;
	}
	let newFilter = "";
	let escaped = false;
	let word = "";
	for (const c of filter) {
		if (escaped) {
			word += c;
			escaped = false;
			continue;
		}
		if (c === "\\") {
			escaped = true;
			continue;
		}
		const replace = {
			"&": " and ",
			"|": " or ",
			"!": " not ",
			"^": "!=",
			";": "\\;",
			"(": "(",
			")": ")",
		}[c];
		if (replace) {
			newFilter += parseWord(word);
			newFilter += replace;
			word = "";
			continue;
		}
		word += c;
	}
	newFilter += parseWord(word);
	return newFilter;
}

function parseFilter(filter) {
	if (filter.trim() === "")
		return { evaluate: () => true };
	console.log(parseFilterStep(filter))
	return parser.parse(parseFilterStep(filter)).simplify();
}

function parseFilterCached(filter) {
	if (parseFilterCached[filter])
		return parseFilterCached[filter];
	const keys = Object.keys(parseFilterCached);
	if (keys.length > 50)
		delete parseFilterCached[keys[0]];
	const result = parseFilter(filter);
	parseFilterCached[filter] = result;
	return result;
}

export function matchFilter(filter, skin) {
	const data = skins[skin] ?? { name: skin };
	console.log(filter, skin, data);
	filter = parseFilterCached(filter);
	return filter.evaluate({ d: name => data[name] ?? false });
}

export function matchFilterWeb(filter, skin) {
	let name;
	let format;
	const i = skin.indexOf(".");
	if (i === -1) {
		name = skin.toLowerCase();
		format = "png";
	} else {
		name = skin.slice(0, i).toLowerCase();
		format = skin.slice(i + 1).toLowerCase();
	}
	const data = skins[skin] ?? { name, format };
	console.log(filter, skin, data);
	filter = parseFilterCached(filter);
	if (!filter.evaluate({ d: name => data[name] ?? false }))
		return false;
	return `${urlSkin}${data.name}.${data.format}`;
}

export function matchFilterAll(filter) {
	return Object.keys(skins).filter(skin => matchFilter(filter, skin))
}

async function loadData(paths) {
	function loadSkins({ skins: newSkins }) {
		if (!newSkins) return;
		for (const [name, data] of Object.entries(newSkins)) {
			data.name = name;
			if (skins[name])
				skins[name] = Object.assign(skins[name], data);
			else
				skins[name] = data;
		}
	}
	function loadFilters({ filters }) {
		if (!filters) return;
		for (const [filter, data] of Object.entries(filters)) {
			for (const skin of matchFilterAll(filter)) {
				if (skins[skin])
					skins[skin] = Object.assign(skins[skin], data);
				else
					skins[skin] = data;
			}
		}
	}

	const rawDatas = [];
	for (const path of paths)
		rawDatas.push(JSON.parse(await fs.readFile(path)));

	for (const rawData of rawDatas)
		loadSkins(rawData);
	for (const rawData of rawDatas)
		loadFilters(rawData);
}

await loadData(["data/auto.json", "data/manual.json"]);

console.log(skins);