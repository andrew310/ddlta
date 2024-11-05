import postgres from "postgres";
import { Column } from "./data";
// POSTGRES_HOST='quanta-dev-cluster.cluster-ci5581xqvs2b.us-west-2.rds.amazonaws.com'
// # POSTGRES_HOST='q-staging-cluster.cluster-ci5581xqvs2b.us-west-2.rds.amazonaws.com'
// POSTGRES_USERNAME='qadmin'
// POSTGRES_PASSWORD='OxiFy&Dc29P1'
// POSTGRES_DATABASE='production'
// POSTGRES_PORT=5432
export async function loadRemoteData() {
  const sql = postgres({
    host: "q-staging-cluster.cluster-ci5581xqvs2b.us-west-2.rds.amazonaws.com",
    port: 5432,
    database: "production",
    username: "qadmin",
    password: "OxiFy&Dc29P1",
  });
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
