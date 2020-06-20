const { first, last, isEqual, isUndefined } = require('lodash');
const { RULE, INITIAL_FACTS, QUERIES } = require('../constants/statement-type');
const { RULE_REGEX, INITIAL_FACTS_REGEX, QUERIES_REGEX } = require('../constants/statement-type-regex');
const { FACT_REGEX, OPERATOR_REGEX } = require('../constants/token-type-regex');
const { Fact } = require('../models/fact');
const { Operator } = require('../models/operator');
const { LexicalError } = require('../errors/lexical-error');

class Lexer {
  static removeComment(content) {
    return first(content.split('#'));
  }

  static removeWhitespaces(content) {
    return content.replace(/\s*/g, '');
  }

  static isBlankLine(content) {
    return /^\s*$/.test(content);
  }

  static isFact(content) {
    return FACT_REGEX.test(content);
  }

  static isOperator(content) {
    return OPERATOR_REGEX.test(content);
  }

  static isRule(content) {
    return RULE_REGEX.test(Lexer.removeWhitespaces(content));
  }

  static isInitialFacts(content) {
    return INITIAL_FACTS_REGEX.test(content.trim());
  }

  static isQueries(content) {
    return QUERIES_REGEX.test(content.trim());
  }

  static getStatementType(content) {
    if (Lexer.isRule(content)) return RULE;
    if (Lexer.isInitialFacts(content)) return INITIAL_FACTS;
    if (Lexer.isQueries(content)) return QUERIES;
  }

  static isValidStructure(types) {
    const initialFactsCount = types.filter(type => type === INITIAL_FACTS).length;
    const queriesCount = types.filter(type => type === QUERIES).length;

    const flattenedTypes = types.reduce((result, type) => (last(result) !== type ? result.concat(type) : result), []);

    return initialFactsCount === 1 && queriesCount === 1 && isEqual(flattenedTypes, [RULE, INITIAL_FACTS, QUERIES]);
  }

  static createToken(content) {
    if (Lexer.isFact(content)) return new Fact(content);
    if (Lexer.isOperator(content)) return new Operator(content);
  }

  static tokenizeRule(content) {
    const { condition, conclusion } = Lexer.removeWhitespaces(content).match(RULE_REGEX).groups;

    return {
      condition: condition.split('').map(Lexer.createToken),
      conclusion: conclusion.split('').map(Lexer.createToken),
    };
  }

  static tokenizeInitialFacts(content) {
    const { initialFacts } = content.trim().match(INITIAL_FACTS_REGEX).groups;
    return initialFacts.split('').map(Lexer.createToken);
  }

  static tokenizeQueries(content) {
    const { queries } = content.trim().match(QUERIES_REGEX).groups;
    return queries.split('').map(Lexer.createToken);
  }

  static tokenize(lines) {
    return lines.reduce(
      (result, { lineIndex, content }) => {
        if (Lexer.isRule(content)) {
          result.rules.push({ lineIndex, tokens: Lexer.tokenizeRule(content) });
        } else if (Lexer.isInitialFacts(content)) {
          result.initialFacts = {
            lineIndex,
            tokens: Lexer.tokenizeInitialFacts(content),
          };
        } else if (Lexer.isQueries(content)) {
          result.queries = {
            lineIndex,
            tokens: Lexer.tokenizeQueries(content),
          };
        }

        return result;
      },
      { rules: [] },
    );
  }

  static convert(input) {
    return input
      .split(/\r?\n/)
      .map((content, lineIndex) => ({ lineIndex, content }))
      .map(({ lineIndex, content }) => ({
        lineIndex,
        content: Lexer.removeComment(content),
      }))
      .filter(({ content }) => !Lexer.isBlankLine(content));
  }

  static analyze(input) {
    const lines = Lexer.convert(input);

    const types = lines.map(({ lineIndex, content }) => {
      const type = Lexer.getStatementType(content);

      if (isUndefined(type)) {
        throw new LexicalError(`Invalid line #${lineIndex + 1}`);
      }

      return type;
    });

    if (!Lexer.isValidStructure(types)) {
      throw new LexicalError('Invalid file structure');
    }

    return Lexer.tokenize(lines);
  }
}

module.exports = { Lexer };
