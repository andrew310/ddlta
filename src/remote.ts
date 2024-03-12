import postgres from "postgres";
import { Column } from "./data";

export async function loadRemoteData() {
  const sql = postgres();
  const rows = await sql<Column[]>`
    SELECT
        "table_schema" as "tableSchema",
        "table_name" as "tableName",
        "column_name" as "columnName",
        "column_default" as "columnDefault",
        CASE "is_nullable" when 'YES' THEN true ELSE false END as "isNullable",
        "data_type" as "dataType",
        "character_maximum_length" as "characterMaximumLength"
    FROM information_schema.columns
    WHERE "table_schema" = 'public'
    AND "table_name" = 'workflow_task'
`;
  await sql.end();

  const tables = new Map<string, Column[]>();

  for (const each of rows) {
    const data = Column(each);
    if (!tables.has(data.tableName)) {
      tables.set(data.tableName, [data]);
    } else {
      tables.set(data.tableName, [...tables.get(data.tableName)!, data]);
    }
  }

  return tables;
}
