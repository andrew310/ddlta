import {
  type CstChildrenDictionary,
  type CstElement,
  type CstNode,
  type IToken,
} from "chevrotain";
import { CreateTableParser } from "./parse";
import { Column } from "../data";

export interface IVisitor {
  visit(cst: CstNode, state?: any): any;
}

const isCstNode = (node: CstElement): node is CstNode =>
  typeof node === "object" && "children" in node && "name" in node;

const isToken = (node: CstElement): node is IToken =>
  typeof node === "object" && "image" in node;

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

    createTable(ctx: CstChildrenDictionary) {
      const nodes = Object.values(ctx).map((elements) =>
        elements.filter(isCstNode)
      ).flat();

      const results = nodes.map((node) => this.visit(node));
      return results;
    }

    table(ctx: CstChildrenDictionary) {
      const slug = ctx.Identifier.map((id) => (id as IToken).image);
      const [table, schema = "public"] = slug.toReversed();
      return { table, schema, _type: "TableRef" };
    }

    columns(ctx: CstChildrenDictionary) {
      // These should all be column definitions
      const nodes = Object.values(ctx).map((elements) =>
        elements.filter(isCstNode)
      ).flat();

      return nodes.map((node) => this.visit(node));
    }

    columnDefinition(ctx: CstChildrenDictionary) {
      const { columnName, ColumnConstraints, ColumnType } = ctx;
      const name = (columnName[0] as IToken).image;

      if (ColumnConstraints) {
        for (const each of ColumnConstraints) {
          if (isCstNode(each)) {
            this.visit(each);
          }
        }
      }

      // if (columnconstraints) {
      // }

      // console.log(constraints)

      return {
        name,
        // constraints,
        type: (ColumnType[0] as IToken).image,
        _type: "ColumnDefinition",
      };
    }

    constraint(ctx: CstChildrenDictionary) {
      Object.entries(ctx).forEach(([key, value]) => {
        if (isToken(value[0])) {
          console.log(key, value[0].image);
        } else if (isCstNode(value[0])) {
          console.log(key, value[0].name);
        }
      });
    }

    // constraint(
    //   { Constraint, ColumnDefault, ForeignKey }: CstChildrenDictionary,
    // ) {
    //   console.log("Constraint", Constraint);
    //   const constraints = [];
    //   // the column default will just be an IToken
    //   if (Array.isArray(ColumnDefault)) {
    //     for (const each of ColumnDefault) {
    //       if (isToken(each)) constraints.push(each.image);
    //     }
    //   }
    //   // console.log(ColumnDefault);
    //   return constraints;

    //   if (Array.isArray(Constraint)) {
    //     for (const each of Constraint) {
    //       if (isToken(each)) console.log("Token", each.image);
    //       else if (isCstNode(each)) console.log("node", each.name);
    //     }
    //   } else {
    //     console.log("Not Array", Constraint);
    //   }
    // }
  }

  return new InterpreterVisitor();
}
