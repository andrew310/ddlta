import {
  type CstChildrenDictionary,
  type CstElement,
  type CstNode,
  type IToken,
} from "chevrotain";
import { CreateTableParser } from "./parse";

export interface IVisitor {
  visit(cst: CstNode, state?: any): any;
}

interface TableCstNode extends CstNode {
  children: {
    Dot: IToken[];
    Identifier: IToken[];
  };
}

interface ColumnDefinitionCstNode extends CstNode {
  columnName: IToken[];
}

interface CreateTable {
  table: TableCstNode[];
  columnDefinition: CstNode[];
}

export function createEvalVisitor(
  parser: CreateTableParser,
  data: Record<string, any>,
): IVisitor {
  const FormulaVisitorBase = parser.getBaseCstVisitorConstructorWithDefaults();

  class InterpreterVisitor extends FormulaVisitorBase {
    constructor() {
      super();
      this.validateVisitor();
    }

    createTable({ table, columnDefinition }: CreateTable, state: any) {
      const { Identifier, Dot } = table[0].children;
      const identifiers = Identifier.map((id) => id.image);

      this.visit(columnDefinition, state);

      if (Dot) {
        const [schema, tableName] = identifiers;
        return { schema, tableName };
      }

      return { schema: "public", tableName: identifiers[0] };
    }

    columnDefinition(ctx: ColumnDefinitionCstNode) {
      const columnName = ctx.columnName[0].image;
      console.log(columnName);
      return { "bruh": "bruh" };
    }
  }

  return new InterpreterVisitor();
}
