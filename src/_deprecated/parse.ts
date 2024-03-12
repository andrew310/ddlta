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
    this.SUBRULE(this.columns);
    this.CONSUME(tokens.Rparen);
    this.OPTION(() => this.CONSUME(tokens.SemiColon));
  });

  public columns = this.RULE("columns", () => {
    this.AT_LEAST_ONE_SEP({
      SEP: tokens.Comma,
      DEF: () => {
        this.SUBRULE(this.columnDefinition);
      },
    });
  });

  public columnDefinition = this.RULE("columnDefinition", () => {
    this.CONSUME(tokens.Identifier, { LABEL: "columnName" });
    this.CONSUME(tokens.ColumnType);
    this.MANY(() => {
      this.SUBRULE(this.constraint, { LABEL: "ColumnConstraints" });
    });
  });

  public constraint = this.RULE("constraint", () => {
    this.OR([
      { ALT: () => this.CONSUME(tokens.Constraint) },
      { ALT: () => this.SUBRULE(this.default, { LABEL: "ColumnDefault" }) },
      { ALT: () => this.SUBRULE(this.references, { LABEL: "ForeignKey" }) },
    ]);
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
