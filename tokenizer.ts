import {
  Chunk,
  Context,
  Effect,
  Layer,
  Option,
  ReadonlyArray,
  Ref,
} from "effect";
import { type ILexingResult, type IToken } from "chevrotain";
import { CreateTableLexer } from "./src/_deprecated/lex";

const ddl =
  `create table public.task (id serial, name text not null,done boolean, completedAt timestamp);`;

/* -------------------------------------------------------------------------------------------------
 * Tokenizer
 * -----------------------------------------------------------------------------------------------*/

interface Tokenizer {
  getTokens: (input: string) => Effect.Effect<IToken[], Error>;
}
class TokenizerService
  extends Context.Tag("Tokenizer")<TokenizerService, Tokenizer>() {}

const TokenizerLayer = Layer.succeed(
  TokenizerService,
  TokenizerService.of({
    getTokens: (input: string) =>
      Effect.sync(() => CreateTableLexer.tokenize(input)).pipe(
        Effect.flatMap((x) =>
          x.errors && x.errors.length > 0
            ? Effect.fail(new Error(x.errors[0].message))
            : Effect.succeed(x.tokens)
        ),
      ),
  }),
);

/* -------------------------------------------------------------------------------------------------
 * TokenList
 * -----------------------------------------------------------------------------------------------*/

type TokenList = IToken[];
type TokenListOption = Option.Option<TokenList>;
class TokenListState extends Context.Tag("TokenListState")<
  TokenListState,
  Ref.Ref<TokenListOption>
>() {}

const TokenListStateLayer = Layer.effect(
  TokenListState,
  Ref.make(Option.none<TokenList>()),
);

/* -------------------------------------------------------------------------------------------------
 * ModifyTokenList
 * -----------------------------------------------------------------------------------------------*/

type ModifyTokenListData = {
  set: (tokens: TokenList) => Effect.Effect<void, never>;
};

class ModifyTokenlist extends Context.Tag("ModifyTokenList")<
  ModifyTokenlist,
  ModifyTokenListData
>() {}

const modifyTokenListImpl = Effect.gen(function* (_) {
  const ref = yield* _(TokenListState);

  const fn = (tokens: TokenList) => Ref.set(Option.some(tokens))(ref);
  return { set: fn };
});

const ModifyTokenListLayer = Layer.effect(
  ModifyTokenlist,
  modifyTokenListImpl,
);

/* -------------------------------------------------------------------------------------------------
 * TokensProvider
 * -----------------------------------------------------------------------------------------------*/

type TokensProviderData = {
  get: () => Effect.Effect<TokenListOption, never, never>;
  set: (tokens: TokenList) => Effect.Effect<void, never>;
  initialize: (input: string) => Effect.Effect<void, Error, never>;
};

export class TokensProvider extends Context.Tag("TokensProvider")<
  TokensProvider,
  TokensProviderData
>() {}

const tokensProviderImpl = Effect.gen(function* (_) {
  const ref = yield* _(TokenListState);
  const { set } = yield* _(ModifyTokenlist);

  const { getTokens } = yield* _(TokenizerService);

  const initialize = (input: string) =>
    getTokens(input).pipe(Effect.flatMap(set));

  const get = () => Ref.get(ref);

  return { set, get, initialize };
});

const Dependencies = Layer.provideMerge(
  ModifyTokenListLayer,
  TokenListStateLayer,
).pipe(Layer.merge(TokenizerLayer));

export const TokensProviderLayer = Layer.effect(
  TokensProvider,
  tokensProviderImpl,
)
  .pipe(Layer.provide(Dependencies));

const program = Effect.gen(function* (_) {
  const { initialize } = yield* _(TokensProvider);
  yield* _(initialize(ddl));

  const { get } = yield* _(TokensProvider);
  const tokens = yield* _(get());

  return tokens;
});

const runnable = Effect.provide(program, TokensProviderLayer);

const result = Effect.runSync(runnable);
// console.log(result);
