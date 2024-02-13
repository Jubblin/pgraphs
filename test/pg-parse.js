import { assert } from "chai"
import fs from "fs"
import { localPath, readFile } from "./utils.js"
import { pgformat, ParsingError } from "../index.js"

const { parse } = pgformat.pg

describe("parse", () => {
  fs.readdirSync(localPath("../examples")).forEach(file => {
    if (file.match(/\.pg$/)) {
      it(file, () => {
        const pgstring = readFile(`../examples/${file}`)
        const graph = parse(pgstring)
        const jsonFile = localPath(`../examples/${file.replace(/\.pg$/,".json")}`)
        if (fs.existsSync(jsonFile)) {
          const json = JSON.parse(readFile(jsonFile))
          assert.deepEqual(graph,json)
        } else {
          // console.log(JSON.stringify(graph))
        }
      })
    }
  })
})
 
const valid = [
  "\"\"",       // empty node id
  "a\rb",       // plain /r is newline
  "a:b",
  "a(b",
]

describe("parsing more edge cases", () => {
  for(let pg of valid) {
    it("is valid", () => {
      assert.ok(parse(pg))
    })
  }
})

const invalid = {
  "\"": "line 1 must start with node or edge",
  "\"\\": "line 1 must start with node or edge", // malformed escaped string
  "\"\\\\\"\"": "invalid node identifier at line 1 character 5 is \"",
  ":a": "node identifier must not start with colon at line 1",
  "a\"b": "invalid node identifier at line 1 character 2 is \"",
  " a": "line 1 must not start with whitespace",
  "x :": "invalid label or property key at line 1, character 3 is :",
  "x -": "invalid label or property key at line 1, character 3 is -",
  "x k:": "missing property value at line 1, character 5",
  "x k:\"xy": "invalid property value at line 1, character 5: \"\\\"xy\"",
  "a b:c:d": "invalid content at line 1, character 6: \":d\"",
  "a:": "invalid node identifier at line 1 character 2 is :",
  "(a": "line 1 must start with node or edge",
  "()": "line 1 must start with node or edge",
  "\n\na)": "invalid node identifier at line 3 character 2 is )",
}

describe("parsing errors", () => {
  for(let [input, error] of Object.entries(invalid)) {
    it(input, () => {
      assert.throws(() => parse(input), ParsingError, error)
    })
  }
})

describe("special whitespace characters", () => {
  const whitespace = {
    "vertical tab": "\v",
    "form feed": "\f",
    "non-break space": "\xA0",
    "zero-width space": "\uFEFF",
  }
  for(let [name,space] of Object.entries(whitespace)) {
    it(name, () => {
      const id = `x${space}:y`
      const graph = { nodes: [{ id, labels: [], properties: {} }], edges: [] }
      assert.deepEqual(parse(id),graph)
    })
  }
})
