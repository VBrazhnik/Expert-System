const Combinatorics = require('js-combinatorics');
const chalk = require('chalk');
const { first, last, uniq, isBoolean, isUndefined } = require('lodash');
const { NOT, AND, XOR, OR } = require('../constants/operator-action');
const { NONE, FALSE, TRUE, UNDETERMINED } = require('../constants/fact-value');
const { Fact } = require('../models/fact');
const { Operator } = require('../models/operator');
const { EngineError } = require('../errors/engine-error');

const MAX_FACTS_IN_CONCLUSION = 10;

class Engine {
  static convertToRpn(tokens) {
    const outputQueue = [];
    const operatorsStack = [];

    tokens.forEach(token => {
      if (token instanceof Fact) {
        outputQueue.push(token);
      } else if (token instanceof Operator) {
        if (token.isLeftParenthesis()) {
          operatorsStack.push(token);
        } else if (token.isRightParenthesis()) {
          while (!last(operatorsStack).isLeftParenthesis()) {
            outputQueue.push(operatorsStack.pop());
          }
          operatorsStack.pop();
        } else if (operatorsStack.length === 0) {
          operatorsStack.push(token);
        } else {
          while (
            operatorsStack.length &&
            ((token.isBinary() &&
              Operator.getPriority(last(operatorsStack).action) >= Operator.getPriority(token.action)) ||
              (token.isUnary() &&
                Operator.getPriority(last(operatorsStack).action) > Operator.getPriority(token.action)))
          ) {
            outputQueue.push(operatorsStack.pop());
          }
          operatorsStack.push(token);
        }
      }
    });

    outputQueue.push(...operatorsStack.reverse());

    return outputQueue;
  }

  static calculateUnaryOperation(action, value) {
    const operations = {
      [NOT]: a => !a,
    };

    if (isUndefined(operations[action])) {
      throw new EngineError(`Unary operator is not supported: ${action}`);
    }

    return operations[action](value);
  }

  static calculateBinaryOperation(action, leftValue, rightValue) {
    const operations = {
      [AND]: (a, b) => a && b,
      [OR]: (a, b) => a || b,
      [XOR]: (a, b) => a !== b,
    };

    if (isUndefined(operations[action])) {
      throw new EngineError(`Binary operator is not supported: ${action}`);
    }

    return operations[action](leftValue, rightValue);
  }

  static evaluateRpnExpression(tokens) {
    const resultStack = [];

    tokens.forEach(token => {
      if (token instanceof Operator) {
        if (token.isUnary()) {
          const value = resultStack.pop();

          resultStack.push(Engine.calculateUnaryOperation(token.action, value));
        } else if (token.isBinary()) {
          const rightValue = resultStack.pop();
          const leftValue = resultStack.pop();

          resultStack.push(Engine.calculateBinaryOperation(token.action, leftValue, rightValue));
        }
      } else if (isBoolean(token)) {
        resultStack.push(token);
      } else {
        throw new EngineError(`Unexpected token: ${token}`);
      }
    });

    return resultStack.pop();
  }

  static getFactNames(tokens) {
    return uniq(tokens.filter(token => token instanceof Fact).map(({ name }) => name)).sort();
  }

  constructor(facts, rules, options = {}) {
    this.facts = facts;
    this.rules = rules;
    this.colorizer = new chalk.Instance(options.color ? {} : { level: 0 });
    this.log = options.verbose ? console.log : () => {};
  }

  findRulesWithFactInConclusion(name) {
    return this.rules.filter(({ conclusion }) => {
      return conclusion.some(token => token instanceof Fact && token.name === name);
    });
  }

  evaluateCondition(tokens) {
    const expressionInRpn = Engine.convertToRpn(tokens);

    return Engine.evaluateRpnExpression(
      expressionInRpn.map(token => {
        if (token instanceof Fact) {
          return this.facts.get(token.name).value;
        }
        return token;
      }),
    );
  }

  solveConclusion(tokens, result) {
    const factNames = Engine.getFactNames(tokens);

    if (factNames.length > MAX_FACTS_IN_CONCLUSION) {
      throw new EngineError('Too many facts in the right side');
    }

    const expressionInRpn = Engine.convertToRpn(tokens);

    const unknownFacts = factNames.filter(name => this.facts.get(name).value === NONE);

    const combinations = Combinatorics.baseN([FALSE, TRUE], unknownFacts.length).toArray();

    const maps = combinations.map(combination => {
      return factNames.reduce((map, name) => {
        const value = this.facts.get(name).value !== NONE ? this.facts.get(name).value : combination.pop();
        return {
          ...map,
          [name]: value,
        };
      }, {});
    });

    const validatedMaps = maps.filter(
      map => Engine.evaluateRpnExpression(this.substituteFacts(expressionInRpn, map)) === result,
    );

    if (!validatedMaps.length) {
      throw new EngineError('Not solvable right part');
    }

    factNames.forEach(name => {
      const values = uniq(validatedMaps.map(map => map[name]));
      const value = values.length !== 1 ? UNDETERMINED : first(values);
      this.facts.set(name, value);
    });
  }

  substituteFacts(tokens, map) {
    return tokens.map(token => (token instanceof Fact ? map[token.name] : token));
  }

  computeFact(name, stack = []) {
    this.log(this.colorizer`- {bold ${name}:} Computing value`);

    if (this.facts.get(name).value !== NONE) {
      this.log(this.colorizer`- {bold ${name}:} Value is already known — ${this.facts.get(name).value}`);
      return;
    }

    if (stack.includes(name)) {
      this.log(this.colorizer`- {bold ${name}:} {yellow Already in stack}`);
      return;
    }

    stack.push(name);
    this.log(this.colorizer`- {bold ${name}:} Added to stack`);

    const rulesWithFactInConclusion = this.findRulesWithFactInConclusion(name);

    if (!rulesWithFactInConclusion.length) {
      this.facts.set(name, FALSE);
    }

    rulesWithFactInConclusion.forEach(rule => {
      this.log(this.colorizer`- {bold ${rule.toString()}:} Checking rule`);

      rule.condition
        .filter(token => token instanceof Fact)
        .forEach(({ name: factName }) => this.computeFact(factName, stack));

      rule.leftSideValue = this.evaluateCondition(rule.condition);

      if (rule.leftSideValue) {
        this.solveConclusion(rule.conclusion, rule.leftSideValue);
        this.log(this.colorizer`- {bold ${rule.toString()}:} Solved`);
      } else {
        this.log(this.colorizer`- {bold ${rule.toString()}:} {yellow Rule is skipped because condition — false}`);
      }
    });

    stack.pop();

    if (this.facts.get(name).value === NONE) {
      this.facts.set(name, FALSE);
      this.log(this.colorizer`- {bold ${name}:} {yellow Set default value — false}`);
    }

    this.log(this.colorizer`- {bold ${name}:} Computed value — ${this.facts.get(name).value}`);
  }

  compute() {
    this.facts.map.forEach((fact, name) => {
      if (fact.isQuery && fact.value === NONE) {
        this.computeFact(name);
      }
    });

    return this.facts.queries;
  }
}

module.exports = { Engine };
