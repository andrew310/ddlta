# DDL + ∆ = Ddlta

<b>[del-tuh]</b> A utility to prevent you from building models. SQL has a data
definition language already. And it's pretty good.

### TODO

-[] implement manySep, or add separator as optional param for `many` func
-[]

### philosophy

Ddlta uses its own parser build using functional programming principles.

- Pipelines over chaining
- Immutable data

To achieve this, the Effect library is being used. It is a wondeful library, and
I encourage you to check it out if you are interested in the benefits of
functional programming in Typescript.

### Install

```bash
npm install ddlta
```

### Getting started

Write some SQL data definitions and save them to a file:

```sql
// ddl/tasks.sql
CREATE TABLE tasks (id SERIAL PRIMARY KEY, title TEXT NOT NULL UNIQUE);
```

Create ddl.config.js, and structure it like this:

```js
export default {
  input: "./ddl",
  output: "./migrations",
  database: "postgres",
  connection: "postgresql://admin:default@host:5432/staging",
};
```

Your migration will be written to the output folder, prefixed with an ISO
timestamp:

```
/migrations/2024-02-29T04:36:42.957Z-CREATE-TABLE-TASKS.ts
```
