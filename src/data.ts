import { Data } from "effect";
import { Schema } from "@effect/schema";

export type Column = {
  readonly tableName: string;
  readonly columnName: string;
  readonly dataType: string;
  readonly isNullable: boolean;
  readonly columnDefault: string | null;
  readonly characterMaximumLength: number | null;
};

type TableConstraint = {
  type: "PRIMARY KEY" | "FOREIGN KEY" | "UNIQUE" | "CHECK";
};

// type Table = {
//   readonly name: string;
//   readonly schema: string;
//   readonly columns: readonly Column[];
// };

export const Column = Data.case<Column>();

// const Table = Data.case<Table>();
