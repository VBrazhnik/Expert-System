const { isUndefined, last, uniq } = require('lodash');
const { TRUE } = require('../constants/fact-value');
const { Fact } = require('../models/fact');
const { Operator } = require('../models/operator');
const { FactsMap } = require('../models/facts-map');
const { Rule } = require('../models/rule');
const { ParserError } = require('../errors/parser-error');

class Parser {
  static countFacts(rule) {
    return rule.filter(token => token instanceof Fact).length;
  }

  static getFactNames(tokens) {
    return uniq(tokens.filter(token => token instanceof Fact).map(({ name }) => name)).sort();
  }

  static getFactNamesFromRules(rules) {
    const tokensFromRules = rules.map(({ tokens }) => [...tokens.condition, ...tokens.conclusion]).flat();
    return Parser.getFactNames(tokensFromRules);
  }

  static areParenthesesMatched(ruleSide) {
    const operators = ruleSide.filter(token => token instanceof Operator);

    const leftParenthesisCount = operators.filter(token => token.isLeftParenthesis()).length;
    const rightParenthesisCount = operators.filter(token => token.isRightParenthesis()).length;

    return leftParenthesisCount === rightParenthesisCount;
  }

  static isValidRuleSide(ruleSide) {
    const lastToken = last(ruleSide);

    return (
      Parser.areParenthesesMatched(ruleSide) &&
      ruleSide.every((current, index, array) => {
        const previous = array[index - 1];

        if (current instanceof Fact) {
          return (
            isUndefined(previous) ||
            (previous instanceof Operator &&
              (previous.isUnary() || previous.isBinary() || previous.isLeftParenthesis()))
          );
        }
        if (current instanceof Operator && current.isUnary()) {
          return (
            isUndefined(previous) ||
            (previous instanceof Operator &&
              (previous.isUnary() || previous.isBinary() || previous.isLeftParenthesis()))
          );
        }
        if (current instanceof Operator && current.isBinary()) {
          return previous instanceof Fact || (previous instanceof Operator && previous.isRightParenthesis());
        }
        if (current instanceof Operator && current.isLeftParenthesis()) {
          return (
            isUndefined(previous) ||
            (previous instanceof Operator &&
              (previous.isUnary() || previous.isBinary() || previous.isLeftParenthesis()))
          );
        }
        if (current instanceof Operator && current.isRightParenthesis()) {
          return previous instanceof Fact || (previous instanceof Operator && previous.isRightParenthesis());
        }

        return false;
      }) &&
      (lastToken instanceof Fact || (lastToken instanceof Operator && lastToken.isRightParenthesis()))
    );
  }

  constructor(rules, initialFacts, queries) {
    this.rules = rules;
    this.initialFacts = initialFacts;
    this.queries = queries;

    this.factsMap = new FactsMap();
  }

  parseRules() {
    return this.rules.map(({ lineIndex, tokens }) => {
      const { condition, conclusion } = tokens;

      if (!Parser.isValidRuleSide(condition) || !Parser.isValidRuleSide(conclusion)) {
        throw new ParserError(`Invalid rule at line #${lineIndex + 1}`);
      }

      return new Rule(condition, conclusion);
    });
  }

  parseInitialFacts() {
    this.initialFacts.tokens.forEach(({ name }) => {
      this.factsMap.set(name, TRUE);
    });
  }

  parseQueries() {
    this.queries.tokens.forEach(({ name }) => {
      this.factsMap.markAsQuery(name);
    });
  }

  parse() {
    const factNames = Parser.getFactNamesFromRules(this.rules);
    factNames.forEach(name => this.factsMap.add(name));

    const rules = this.parseRules();
    this.parseInitialFacts();
    this.parseQueries();

    return { factsMap: this.factsMap, rules };
  }
}

module.exports = { Parser };
