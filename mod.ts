type ValueType = "int" | "bool" | "str";
type TokenType = "keyword" | "fn" | "identifier" | "literal" | "separator";

abstract class Type {
  public readonly type: ValueType;

  constructor(type: ValueType) {
    this.type = type;
  }

  public abstract toString(): string;
}

class IntType extends Type {
  public value: number;

  constructor(value: number) {
    super("int");

    this.value = value;
  }

  public override toString() {
    return this.value.toString();
  }
}

class BoolType extends Type {
  public value: boolean;

  constructor(value: boolean) {
    super("bool");

    this.value = value;
  }

  public override toString() {
    return this.value.toString();
  }
}

class Identifier {
  public name: string;

  constructor(name: string) {
    this.name = name;
  }
}

class Value {
  public type: Type;

  constructor(type: Type) {
    this.type = type;
  }
}

class Token {
  public readonly type: TokenType;

  constructor(type: TokenType) {
    this.type = type;
  }
}

class KeywordToken extends Token {
  public identifier: Identifier;

  constructor(identifier: Identifier) {
    super("keyword");

    this.identifier = identifier;
  }
}

class FnToken extends Token {
  public identifier: Identifier;

  constructor(identifier: Identifier) {
    super("fn");

    this.identifier = identifier;
  }
}

class IdentifierToken extends Token {
  public identifier: Identifier;

  constructor(identifier: Identifier) {
    super("identifier");

    this.identifier = identifier;
  }
}

class LiteralToken extends Token {
  public value: Value;

  constructor(value: Value) {
    super("literal");

    this.value = value;
  }
}

class SeparatorToken extends Token {
  public separator: string;

  constructor(separator: string) {
    super("separator");

    this.separator = separator;
  }
}

let variables: Map<string, Value> = new Map();

function analyze(input: string): Token[] {
  let tokens: Token[] = [];

  let lines = input.split(/\n/).filter((line) => !line.trim().startsWith("//"))
    .reduce((p, c) => `${p} ${c.trim()}`);
  let lexmemes = lines.split(/\s+/);

  const keywordRegex =
    /^((?:let)|(?:print)|(?:println)|(?:eq)|(?:add)|(?:sub)|(?:mul)|(?:div))$/;
  const identifierRegex = /^(_?[A-Za-z]+[\w]*)$/;
  const intLiteralRegex = /^(\d+)$/;
  const boolLiteralRegex = /^((?:true)|(?:false))$/;
  const separatorRegex = /^(;)$/;

  for (let lexeme of lexmemes) {
    if (keywordRegex.test(lexeme)) {
      tokens.push(new KeywordToken(new Identifier(lexeme)));
      continue;
    }

    if (intLiteralRegex.test(lexeme)) {
      tokens.push(new LiteralToken(new Value(new IntType(parseInt(lexeme)))));
      continue;
    }
    if (boolLiteralRegex.test(lexeme)) {
      tokens.push(
        new LiteralToken(
          new Value(
            new BoolType(
              lexeme === "true" ? true : false,
            ),
          ),
        ),
      );
      continue;
    }

    if (identifierRegex.test(lexeme)) {
      tokens.push(new IdentifierToken(new Identifier(lexeme)));
      continue;
    }

    if (separatorRegex.test(lexeme)) {
      tokens.push(new SeparatorToken(lexeme));
      continue;
    }
  }

  return tokens;
}

function evaluate(tokens: Token[]): string[] {
  let output: string[] = [];

  let statements: Token[][] = [];
  let builder: Token[] = [];

  for (const token of tokens) {
    if (token.type === "separator") {
      const asSeparator = token as SeparatorToken;

      if (asSeparator.separator === ";") {
        builder.push(token);
        statements.push(builder);
        builder = [];
        continue;
      }
    }

    builder.push(token);
  }

  // console.log("Statements:");
  // console.log(statements);
  // console.log();

  const argsToTokenString = (args: Token[]) => {
    return args.slice(0).map((i) => i.type).reduce((c, p) => `${p} ${c}`, "")
      .trim();
  };

  for (const statement of statements) {
    const stream = statement.slice(0);
    const args: Token[] = [];

    stream.pop();
    // console.log("Stream:");
    // console.log(stream, "\n");

    while (stream.length > 0) {
      const token = stream.pop()!;

      if (token.type !== "keyword") {
        args.push(token);
        continue;
      }

      // console.log("Arguments:");
      // console.log(args);
      // console.log();

      let asKeyword = token as KeywordToken;

      switch (asKeyword.identifier.name) {
        case "let": {
          const expectedArgsRegex = /^(identifier (?:(literal)|(identifier)))$/;
          const asTokenString = argsToTokenString(args.slice(0, 2));

          // console.log(asTokenString, expectedArgsRegex.test(asTokenString), "\n");

          if (expectedArgsRegex.test(asTokenString)) {
            let a = args.pop() as IdentifierToken;

            let b = args.pop()!;

            let value: Value | null = null;

            if (b.type === "literal") {
              const literal = b as LiteralToken;

              value = literal.value;
            }
            if (b.type === "identifier") {
              const identifier = b as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value = variables.get(identifier.identifier.name)!;
            }

            if (value === null) {
              throw new TypeError("Something went wrong...");
            }

            variables.set(a.identifier.name, value);
          }

          break;
        }

        case "eq": {
          const expectedArgsRegex =
            /^((?:(literal)|(identifier)) (?:(literal)|(identifier)))$/;
          const asTokenString = argsToTokenString(args.slice(0, 2));

          // console.log(asTokenString, expectedArgsRegex.test(asTokenString), "\n");

          if (expectedArgsRegex.test(asTokenString)) {
            let a = args.pop()!;
            let b = args.pop()!;

            let value_lh: Value | null = null;
            let value_rh: Value | null = null;

            if (a.type === "literal") {
              const literal = a as LiteralToken;

              value_lh = literal.value;
            }
            if (a.type === "identifier") {
              const identifier = a as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_lh = variables.get(identifier.identifier.name)!;
            }

            if (b.type === "literal") {
              const literal = b as LiteralToken;

              value_rh = literal.value;
            }
            if (b.type === "identifier") {
              const identifier = b as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_rh = variables.get(identifier.identifier.name)!;
            }

            if (value_lh === null) {
              throw new TypeError("Something went wrong...");
            }
            if (value_rh === null) {
              throw new TypeError("Something went wrong...");
            }

            if (value_lh.type.type === "int" && value_rh.type.type === "int") {
              const lhAsInt = value_lh.type as IntType;
              const rhAsInt = value_rh.type as IntType;

              args.push(
                new LiteralToken(
                  new Value(new BoolType(lhAsInt.value === rhAsInt.value)),
                ),
              );
              break;
            }
            if (
              value_lh.type.type === "bool" && value_rh.type.type === "bool"
            ) {
              const lhAsInt = value_lh.type as BoolType;
              const rhAsInt = value_rh.type as BoolType;

              args.push(
                new LiteralToken(
                  new Value(new BoolType(lhAsInt.value === rhAsInt.value)),
                ),
              );
              break;
            }
          }

          break;
        }

        case "add": {
          const expectedArgsRegex =
            /^((?:(literal)|(identifier)) (?:(literal)|(identifier)))$/;
          const asTokenString = argsToTokenString(args.slice(0, 2));

          // console.log(asTokenString, expectedArgsRegex.test(asTokenString), "\n");

          if (expectedArgsRegex.test(asTokenString)) {
            let a = args.pop()!;
            let b = args.pop()!;

            let value_lh: Value | null = null;
            let value_rh: Value | null = null;

            if (a.type === "literal") {
              const literal = a as LiteralToken;

              value_lh = literal.value;
            }
            if (a.type === "identifier") {
              const identifier = a as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_lh = variables.get(identifier.identifier.name)!;
            }

            if (b.type === "literal") {
              const literal = b as LiteralToken;

              value_rh = literal.value;
            }
            if (b.type === "identifier") {
              const identifier = b as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_rh = variables.get(identifier.identifier.name)!;
            }

            if (value_lh === null) {
              throw new TypeError("Something went wrong...");
            }
            if (value_rh === null) {
              throw new TypeError("Something went wrong...");
            }

            if (value_lh.type.type === "int" && value_rh.type.type === "int") {
              const lhAsInt = value_lh.type as IntType;
              const rhAsInt = value_rh.type as IntType;

              args.push(
                new LiteralToken(
                  new Value(new IntType(lhAsInt.value + rhAsInt.value)),
                ),
              );
            }
          }

          break;
        }
        case "sub": {
          const expectedArgsRegex =
            /^((?:(literal)|(identifier)) (?:(literal)|(identifier)))$/;
          const asTokenString = argsToTokenString(args.slice(0, 2));

          // console.log(asTokenString, expectedArgsRegex.test(asTokenString), "\n");

          if (expectedArgsRegex.test(asTokenString)) {
            let a = args.pop()!;
            let b = args.pop()!;

            let value_lh: Value | null = null;
            let value_rh: Value | null = null;

            if (a.type === "literal") {
              const literal = a as LiteralToken;

              value_lh = literal.value;
            }
            if (a.type === "identifier") {
              const identifier = a as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_lh = variables.get(identifier.identifier.name)!;
            }

            if (b.type === "literal") {
              const literal = b as LiteralToken;

              value_rh = literal.value;
            }
            if (b.type === "identifier") {
              const identifier = b as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_rh = variables.get(identifier.identifier.name)!;
            }

            if (value_lh === null) {
              throw new TypeError("Something went wrong...");
            }
            if (value_rh === null) {
              throw new TypeError("Something went wrong...");
            }

            if (value_lh.type.type === "int" && value_rh.type.type === "int") {
              const lhAsInt = value_lh.type as IntType;
              const rhAsInt = value_rh.type as IntType;

              args.push(
                new LiteralToken(
                  new Value(new IntType(lhAsInt.value - rhAsInt.value)),
                ),
              );
            }
          }

          break;
        }
        case "mul": {
          const expectedArgsRegex =
            /^((?:(literal)|(identifier)) (?:(literal)|(identifier)))$/;
          const asTokenString = argsToTokenString(args.slice(0, 2));

          // console.log(asTokenString, expectedArgsRegex.test(asTokenString), "\n");

          if (expectedArgsRegex.test(asTokenString)) {
            let a = args.pop()!;
            let b = args.pop()!;

            let value_lh: Value | null = null;
            let value_rh: Value | null = null;

            if (a.type === "literal") {
              const literal = a as LiteralToken;

              value_lh = literal.value;
            }
            if (a.type === "identifier") {
              const identifier = a as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_lh = variables.get(identifier.identifier.name)!;
            }

            if (b.type === "literal") {
              const literal = b as LiteralToken;

              value_rh = literal.value;
            }
            if (b.type === "identifier") {
              const identifier = b as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_rh = variables.get(identifier.identifier.name)!;
            }

            if (value_lh === null) {
              throw new TypeError("Something went wrong...");
            }
            if (value_rh === null) {
              throw new TypeError("Something went wrong...");
            }

            if (value_lh.type.type === "int" && value_rh.type.type === "int") {
              const lhAsInt = value_lh.type as IntType;
              const rhAsInt = value_rh.type as IntType;

              args.push(
                new LiteralToken(
                  new Value(new IntType(lhAsInt.value * rhAsInt.value)),
                ),
              );
            }
          }

          break;
        }
        case "div": {
          const expectedArgsRegex =
            /^((?:(literal)|(identifier)) (?:(literal)|(identifier)))$/;
          const asTokenString = argsToTokenString(args.slice(0, 2));

          // console.log(asTokenString, expectedArgsRegex.test(asTokenString), "\n");

          if (expectedArgsRegex.test(asTokenString)) {
            let a = args.pop()!;
            let b = args.pop()!;

            let value_lh: Value | null = null;
            let value_rh: Value | null = null;

            if (a.type === "literal") {
              const literal = a as LiteralToken;

              value_lh = literal.value;
            }
            if (a.type === "identifier") {
              const identifier = a as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_lh = variables.get(identifier.identifier.name)!;
            }

            if (b.type === "literal") {
              const literal = b as LiteralToken;

              value_rh = literal.value;
            }
            if (b.type === "identifier") {
              const identifier = b as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value_rh = variables.get(identifier.identifier.name)!;
            }

            if (value_lh === null) {
              throw new TypeError("Something went wrong...");
            }
            if (value_rh === null) {
              throw new TypeError("Something went wrong...");
            }

            if (value_lh.type.type === "int" && value_rh.type.type === "int") {
              const lhAsInt = value_lh.type as IntType;
              const rhAsInt = value_rh.type as IntType;

              args.push(
                new LiteralToken(
                  new Value(new IntType(lhAsInt.value / rhAsInt.value)),
                ),
              );
            }
          }

          break;
        }
        case "println": {
          const expectedArgsRegex = /^(?:(literal)|(identifier))$/;
          const asTokenString = argsToTokenString(args);

          // console.log(asTokenString, expectedArgsRegex.test(asTokenString), "\n");

          if (expectedArgsRegex.test(asTokenString)) {
            let a = args.pop()!;

            let value: Value | null = null;

            if (a.type === "literal") {
              const literal = a as LiteralToken;

              value = literal.value;
            }
            if (a.type === "identifier") {
              const identifier = a as IdentifierToken;

              if (!variables.has(identifier.identifier.name)) {
                throw new TypeError("Expected identifier to exist");
              }

              value = variables.get(identifier.identifier.name)!;
            }

            if (value === null) {
              throw new TypeError("Something went wrong...");
            }

            console.log(value.type.toString());
          }
          break;
        }
      }
    }
  }

  // console.log();
  // console.log(variables);

  return output;
}

if (Deno.args.length > 0) {
  const path = Deno.args[0];

  Deno.readTextFile(path).then((contents) => {
    const tokens = analyze(contents);
    evaluate(tokens);
  }).catch((_) => console.error(`Could not find file "${path}"`));
}
