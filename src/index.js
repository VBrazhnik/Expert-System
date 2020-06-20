const fs = require('fs');
const yargs = require('yargs');
const chalk = require('chalk');
const { FALSE, TRUE } = require('./constants/fact-value');
const { Lexer } = require('./main/lexer');
const { Parser } = require('./main/parser');
const { Engine } = require('./main/engine');

const options = yargs
  .usage('Usage: node ./$0 <file-path>')
  .check(argv => {
    const filePaths = argv._;

    if (filePaths.length !== 1) {
      throw new Error('One file-path as argument is required');
    }
    return true;
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
    description: 'Run with verbose logging',
  })
  .option('color', {
    alias: 'c',
    type: 'boolean',
    default: false,
    description: 'Enable colorful output',
  })
  .version(false)
  .help()
  .strict().argv;

const log = options.verbose ? console.log : () => {};

const colorizer = new chalk.Instance(options.color ? {} : { level: 0 });

const colorizeFactValue = value => {
  if (value === TRUE) return colorizer`{green.bold ${value}}`;
  if (value === FALSE) return colorizer`{red.bold ${value}}`;
  return colorizer`{gray.bold ${value}}`;
};

try {
  log(colorizer`{green > Reading started}`);
  const [filePath] = options._;
  const file = fs.readFileSync(filePath);
  log(colorizer`{green > Reading completed}`);

  log(colorizer`{green > Lexical analysis started}`);
  const lexemes = Lexer.analyze(file.toString());
  log(colorizer`{green > Lexical analysis completed}`);

  log(colorizer`{green > Parsing started}`);
  const parser = new Parser(lexemes.rules, lexemes.initialFacts, lexemes.queries);
  const { factsMap, rules } = parser.parse();
  log(colorizer`{green > Parsing completed}`);

  log(colorizer`{green > Queries computing started}`);
  const engine = new Engine(factsMap, rules, { verbose: options.verbose, color: options.color });
  const queries = engine.compute();
  log(colorizer`{green > Queries computing completed}`);

  log();

  log(colorizer`{bold Result:}`);
  Object.entries(queries).forEach(([name, value]) => {
    console.log(colorizer`{bold ${name}:}`, colorizeFactValue(value));
  });
} catch (error) {
  console.log(colorizer`{red ${error.message}}`);
}
