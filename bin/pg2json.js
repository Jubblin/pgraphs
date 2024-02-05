#!/usr/bin/env node

import fs from "fs"
import { parse } from "../index.js"

const from = process.argv.length > 2 ?
  fs.createReadStream(process.argv[2]) : process.stdin

const chunks = []
for await (let chunk of from) {
  chunks.push(chunk)
}
const input = chunks.map(s => s.toString()).join("")

const graph = parse(input)

process.stdout.write(JSON.stringify(graph, null, 2))
