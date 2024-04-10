#!/usr/bin/env node

import cli from "../src/cli.js"
import { pgraph } from "../src/pgraph.js"
import { pgformat } from "../index.js"

const formats = Object.keys(pgformat)
  .filter(id => pgformat[id].parse || pgformat[id].serialize)
  .map(id => {
    const { name, parse, serialize } = pgformat[id]
    return "  " + id.padEnd(11) + (parse
      ? "from" + (serialize ? "/" : "")
      : "") + (serialize ? "to" : "") + " " + name
  }).join("\n")

cli.usage("pgraph [options] [<input> [<output]]")
  .description("Convert between property graph formats and databases.")
  .option("-f, --from [format]   input format")
  .option("-t, --to [format]     output format")
  .option("-e, --errors          verbose error messages")
  .option("-i, --id [key]        copy node id to property")
  .option("-h, --html            generate HTML label (experimental)")
  .option("-s, --scale [factor]  scale spatial properties x,y,width,height,pos")
  .details(`Supported conversion formats:\n${formats}`)
  .action(async(args, opt) => {
    // Check arguments
    if (args.length > 2) {
      throw new Error("Too many arguments!")
    }
    args = [args[0] ?? "-", args[1] ?? "-"]
    const input = args[0] == "-" ? process.stdin : args[0]
    const output = args[1] == "-" ? process.stdout : args[1]

    // Guess formats
    if (!opt.from && args[0].match(/\./)) {
      opt.from = args[0].split(".").pop()
    }
    if (!opt.to && args[1].match(/\./)) {
      opt.to = args[1].split(".").pop()
    }

    return pgraph(input, output, opt)
  })
  .parse(process.argv)
  .catch(e => {
    console.error(cli.options.errors ? e : `${e}`)
    process.exit(1)
  })
