import { CstParser } from "chevrotain";
import * as tokens from "./tokens";

export class CreateTableParser extends CstParser {
  constructor() {
    super(tokens, {
      maxLookahead: 3,
    });

    this.performSelfAnalysis();
  }

  public createTable = this.RULE("createTable", () => {
    this.CONSUME(tokens.CreateTable);
    this.SUBRULE(this.table);
    this.CONSUME(tokens.Lparen);
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.Comma,
      DEF: () => {
        this.SUBRULE(this.columnDefinition);
      },
    });
    this.CONSUME(tokens.Rparen);
    this.OPTION(() => this.CONSUME(tokens.SemiColon));
  });

  public columnDefinition = this.RULE("columnDefinition", () => {
    this.CONSUME(tokens.Identifier, { LABEL: "columnName" });
    this.CONSUME(tokens.ColumnType);
    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.constraint) },
        { ALT: () => this.SUBRULE(this.default) },
        { ALT: () => this.SUBRULE(this.references) },
      ]);
    });
  });

  public constraint = this.RULE("constraint", () => {
    this.CONSUME(tokens.Constraint);
  });

  public default = this.RULE("default", () => {
    this.CONSUME(tokens.Default);
    this.SUBRULE(this.func);
  });

  public func = this.RULE("func", () => {
    this.CONSUME(tokens.Function);
    this.CONSUME(tokens.Lparen);
    this.CONSUME(tokens.Rparen);
  });

  public references = this.RULE("references", () => {
    this.CONSUME(tokens.References);
    this.SUBRULE(this.table);
  });

  public table = this.RULE("table", () => {
    this.CONSUME(tokens.Identifier);
    this.OPTION(() => {
      this.CONSUME(tokens.Dot);
      this.CONSUME1(tokens.Identifier);
    });
  });
}
