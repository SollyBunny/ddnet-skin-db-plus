#!/bin/env node

import { matchFilterWeb } from "./db.js";

import http from "http";

function handle(req, res) {
	console.log(req.url);
	switch (req.url) {
		case "/":
			res.writeHead(200, { "Content-Type": "text/plain" });
			res.end("Hello World\n");
			return;
		case "/favicon.ico":
			res.writeHead(301, { Location: "https://ddnet.org/favicon.ico" });
			res.end();
			return;
	}
	if (!req.url.startsWith("/skins/")) {
		res.writeHead(404, { "Content-Type": "text/plain" });
		res.end("Not Found\n");
		return;
	}
	const query = req.url.slice(7); // <filter>/<name>.png
	const i = query.lastIndexOf("/");
	let filter, name;
	if (i === -1) {
		name = query;
		filter = "sane";
	} else {
		filter = query.slice(0, i);
		name = query.slice(i + 1); // skin.png
	}
	if (name.endsWith("/"))
		name = name.slice(0, -1);
	const result = matchFilterWeb(filter, name);
	if (!result) {
		res.writeHead(404, { "Content-Type": "text/plain" });
		res.end("Filter didn't match\n");
		return;
	}
	res.writeHead(302, { "Location": result });
	res.end();
}

http.createServer((req, res) => {
	try {
		handle(req, res);
	} catch (e) {
		console.error(e);
		res.writeHead(500, { "Content-Type": "text/plain" });
		res.end("Internal Server Error\n");
	}
}).listen(8080);