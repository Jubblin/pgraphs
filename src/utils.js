import { Writer } from "@pinemach/csv"
export const CSVWriter = Writer

// Maps arbitrary identifier strings to enumerated identifiers
export class IDMap extends Map {
  constructor(base = "") {
    super()
    this.base = base
  }

  map(id) {
    if (this.has(id)) {
      return this.get(id)
    } else {
      const mapped = `${this.base}${this.size + 1}`
      this.set(id, mapped)
      return mapped
    }
  }
}

// Construct graph object, given nodes as object
export const graph = (nodes, edges) => ({
  nodes: Object.keys(nodes).sort().map(id => nodes[id]),
  edges,
})

export const addProperties = (propList, properties={}) => {
  for (let [key, values] of propList) {
    if (values.length) {
      if (key in properties) {
        properties[key].push(...values)
      } else {
        properties[key] = values
      }
    }
  }
  return properties
}

export function wrapPeggyParser(parse, input) {
  try {
    return parse(input) 
  } catch (e) {
    var msg = e.message
    if (e.location) {
      const { line, column } = e.location.start
      msg = msg.replace(/\.$/,"") + ` at line ${line}:${column}.`
    }
    throw new Error(msg)
  }
}

export const randomId = () => "_"+(Math.random() + 1).toString(36).substring(2)

export const isNumber = x => /^\d+(\.\d+)?$/.test(x)

export const isValue = x => typeof x === "number" || typeof x === "string" || typeof x === "boolean" || x === null

export const definedFields = obj => Object.fromEntries(Object.entries(obj).filter(e => e[1] !== undefined))

