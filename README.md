# pql-parser

![node.js.yml](https://github.com/joeyshi12/json-data-type-transcompiler/actions/workflows/pytest.yml/badge.svg)

Plot query language parser library.

## To Do

- [ ] Nested and chained WHERE clause conditions
- [ ] GROUP BY
- [ ] HAVING

## Syntax

```
PLOT <plot_type>
USING <x_column> [AS <x_label>], <y_column> [AS <y_label>]
[WHERE <condition>]
[GROUP BY <column>]
[HAVING <condition>]
```

## EBNF

```
<plot_statement> ::= "PLOT" <plot_type> <using_clause> [<where_clause>] [<group_by_clause>] [<having_clause>]

<plot_type> ::= "BAR" | "LINE" | "SCATTER"

<using_clause> ::= "USING" <attributes>

<where_clause> ::= "WHERE" <condition> {<boolean_operator> <condition>}

<group_by_clause> ::= "GROUP BY" <identifier>

<having_clause> ::= "HAVING" <aggregated_condition> {<boolean_operator> <aggreated_condition>}

<boolean_operator> ::= "OR" | "AND"

<attributes> ::= <attribute> | <attribute> "," <attributes>

<attribute> ::= <aggregated_column> ["AS" <identifier>]

<aggregated_column> ::= <aggregation_function> "(" <identifier> ")" | <identifier>

<aggregation_function> ::= "AVG" | "COUNT" | "SUM"

<identifier> ::= <alphabetic> { <alphabetic> | <digit> | "_" }

<aggregated_condition> ::= <aggregation_function> "(" <identifier> ")" | <identifier>

<condition> ::= <identifier> <comparison_operator> <value>

<comparison_operator> ::= ">" | "<" | ">=" | "<=" | "="

<value> ::= <number> | <string> | "NULL"

<number> ::= <digit> {<digit>}

<string> ::= "'" <alphabetic> {<alphabetic>} "'"

<digit> ::= "0" | ... | "9"

<alphabetic> ::= "A" | ... | "Z" | "a" | ... | "z"
```
