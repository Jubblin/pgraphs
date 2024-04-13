{{
  import { graph, addProperties } from "../../utils.js"
}}

{
  const nodes = {}
  const edges = []
}

PG = ( Entity / IgnorableSpace LineBreak )* IgnorableSpace End
{
  for (let { from, to } of edges) {
    if (!(from in nodes)) {
      nodes[from] = { id: from, labels: [], properties: {} }
    }
    if (!(to in nodes)) {
      nodes[to] = { id: to, labels: [], properties: {} }
    }
  }
  return graph(nodes, edges)
}

End
  = !.

Entity
  = ( Edge / Node ) ( Space* "|" Space* / IgnorableSpace ( LineBreak / End ) )

IgnorableSpace
  = Space? Comment?

LineBreak "linebreak"
  = [\x0D\x0A]+

Space "space"
  = [\x20\x09]+

Comment "comment"
  = "#" [^\x0D\x0A]*

WS
  = ( IgnorableSpace LineBreak )* Space

Node
  = id:Identifier labels:Label* props:Property* {
      labels = Array.from(new Set(labels))
      if (id in nodes) {
        nodes[id].labels = Array.from(new Set([...nodes[id].labels, ...labels]))
        nodes[id].properties = addProperties(props, nodes[id].properties)
      } else {
        nodes[id] = { id, labels, properties: addProperties(props) }
      }
  }

EdgeIdentifier
 = ( @QuotedIdentifier Space? ":" WS )
  / ( @UnquotedIdentifier Space ":" WS )
  / id:( $PlainStart $( ( !":" PlainChar )* ":" )+ ) WS {
      return id.join("").slice(0,-1)
    }

Edge
  = id:( EdgeIdentifier? )
    from:( Identifier? ) 
    direction:Direction 
    to:Identifier
    labels:Label*
    props:Property* {

    labels = Array.from(new Set(labels))
    const e = { from, to, labels, properties: addProperties(props) }
    if (from) {
      if (id) { e.id = id }
    } else {
      if (id) {
        e.from = id
      } else {
        expected("identifier")
      }
    }
    if (direction === "--") {
      e.undirected = true
    }
    edges.push(e)
 }

Direction
  = WS? @( "->" / "--" ) WS?

Label "label"
  = WS ":" Space? id:Identifier { return id }

Identifier
  = QuotedIdentifier
  / UnquotedIdentifier

QuotedIdentifier
  = id:QuotedString { 
      if (id === "") { error("Identifier must not be empty") }
      return id
    }

PlainChar
  = [^\x20\x09\x0A\x0D<>"{}|^`\\]

PlainStart
  = ![:(#-] PlainChar

UnquotedIdentifier
  = PlainStart PlainChar* { return text() }

Property "property"
  = WS name:Key value:ValueList { return [ name, value ] }

Key
  = ( @QuotedIdentifier Space? ":" )
  / ( @UnquotedIdentifier Space ":" )
  / name:( $PlainStart $( ( !":" PlainChar )* ":" )+ ) WS {
      return name.join("").slice(0,-1)
    }
  / name:( $PlainStart $( !":" PlainChar )* ) ":" {
      return name.join("")
    }

ValueList
  = first:( WS? @Value ) rest:( WS? "," WS? @Value )* {
      return [first, ...rest]
    }

Value "value"
  = Scalar
  / UnquotedString

UnquotedString
  = $( PlainStart ( !"," PlainChar )* )

// Scalar value as defined in JSON (RFC 7159) except null.
// Grammar taken and adjusted from peggy example 'json.pegjs'.

Scalar
  = QuotedString
  / Number { return parseFloat(text()) }
  / "true" { return true }
  / "false" { return false }

QuotedString
  = '"' chars:( Char / "'" )* '"' { return chars.join("") }
  / "'" chars:( Char / '"' )* "'" { return chars.join("") }

Char
  = Unescaped
  / Escaped

// Disallow control characters, including newline and " ' \
Unescaped
  = [^\0-\x1F"'\\]

Escaped
  = "\\"
    sequence:(
        '"'
      / "'"
      / "\\"
      / "/"
      / "b" { return "\b" }
      / "f" { return "\f" }
      / "n" { return "\n" }
      / "r" { return "\r" }
      / "t" { return "\t" }
      / "u" @Codepoint )
    { return sequence }

Codepoint
  = digits:$( Hex |4| ) {
      return String.fromCharCode(parseInt(digits, 16))
    }

Number
  = "-"? Int Frac? Exp?

Int
  = "0"
  / ( [1-9] [0-9]* )

Frac
  = "." [0-9]+

Exp
  = [eE] [+-]? [0-9]+

Hex
  = [0-9a-f]i
