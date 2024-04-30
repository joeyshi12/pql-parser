# pql-parser

![node.js.yml](https://github.com/joeyshi12/pql-parser/actions/workflows/node.js.yml/badge.svg)
![npm-publish.yml](https://github.com/joeyshi12/pql-parser/actions/workflows/npm-publish.yml/badge.svg)
![npm](https://img.shields.io/npm/v/pql-parser.svg)

Plot query language parser library.

A simple CSV visualizer tool made with this parser is hosted at <a href="https://devtools.joeyshi.xyz/csv_vis">https://devtools.joeyshi.xyz/csv_vis</a>.

## To Do

- [x] Docstrings and `types.d.ts`
- [ ] Nested and chained WHERE clause conditions
- [x] GROUP BY
- [ ] HAVING
- [x] Semantic validation for AST
- [x] LIMIT and OFFSET clause

## Syntax

```
PLOT (BAR | LINE | SCATTER)
USING <x_column> [AS <x_label>], <y_column> [AS <y_label>]
[WHERE <condition>]
[GROUP BY <column>]
[HAVING <condition>]
[LIMIT <limit> [OFFSET <offset>]]
```

- BAR plots expect `x: string` and `y: number`
- LINE plots expect `x: number` and `y: number`
- SCATTER plots expect `x: number` and `y: number`

## EBNF

```
<plot_statement> ::= "PLOT" <plot_type> <using_clause> [<where_clause>] [<group_by_clause>] [<having_clause>] [<limit_and_offset_clause>]

<plot_type> ::= "BAR" | "LINE" | "SCATTER"

<using_clause> ::= "USING" <attributes>

<where_clause> ::= "WHERE" <where_condition>

<group_by_clause> ::= "GROUP BY" <identifier>

<having_clause> ::= "HAVING" <having_condition>

<limit_and_offset_clause> ::= "LIMIT" <number> ["OFFSET" <number>]

<boolean_operator> ::= "OR" | "AND"

<attributes> ::= <attribute> | <attribute> "," <attributes>

<attribute> ::= <aggregated_column> ["AS" <identifier>]

<aggregated_column> ::= <aggregation_function> "(" <identifier> ")" | <identifier>

<aggregation_function> ::= "AVG" | "COUNT" | "SUM"

<identifier> ::= <alphabetic> { <alphabetic> | <digit> | "_" }

<where_condition> ::= <where_condition_group> { "OR" <where_condition_group> } | <where_condition_group> { "AND" <where_condition_group> }

<where_condition_group> ::= <identifier> <comparison_operator> <value> | "(" <where_condition> ")"

<having_condition> ::= <having_condition_group> { "OR" <having_condition_group> } | <having_condition_group> { "AND" <having_condition_group> }

<having_condition_group> ::= <aggregated_column> <comparison_operator> <value> | "(" <having_condition> ")"

<comparison_operator> ::= ">" | "<" | ">=" | "<=" | "="

<value> ::= <number> | <string> | "NULL"

<number> ::= <digit> {<digit>}

<string> ::= "'" <alphabetic> {<alphabetic>} "'"

<digit> ::= "0" | ... | "9"

<alphabetic> ::= "A" | ... | "Z" | "a" | ... | "z"
```
