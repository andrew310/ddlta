# DDL + ∆ = Ddlta

<b>[del-tuh]</b> A utility to prevent you from building models. SQL has a data
definition language already. Let's use it.

### Install

```bash
npm install ddlta
```

### Getting started

Put your DDL into a file:

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
