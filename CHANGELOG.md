# Changelog

## next

- Support Graphology import/export serialization

## 0.4.1

- Fix null values in Cypher export

## 0.4.0

- Disallow reverse direction <-

## 0.3.1

- Support to omit space around direction

## 0.3.1

- Allow comma in unquoted strings except for values

## 0.3.0

- Make property values lists instead of sets
- Add type field in PG-JSONL

## 0.2.4

- Disallow unquoted identifiers to start with --
- Add experimental support of JSON Canvas

## 0.2.3

- support parsing Cypher create statements
- disallow empty string node identifiers, labels, and property keys

## 0.2.2

- support writing Cypher create statements

## 0.2.1

- add CLI option -i, --id to copy node id to a property
- rename CLI option -v, --verbose to -e, --errors
- fix merging of properties in repeated nodes
- update grammar and format description

## 0.2.0

- change line separator from semicolon to vertical bar
- extend documentation and grammar
- rename NDJSON to JSONL

## 0.1.1

- move repository to <https://github.com/pg-format>
- extend documentation

## 0.1.0

- first release at npm

