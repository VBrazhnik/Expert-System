const { Operator } = require('./operator');

class Rule {
  constructor(condition, conclusion) {
    this.condition = condition;
    this.conclusion = conclusion;
  }

  toString() {
    return [...this.condition, '=>', ...this.conclusion]
      .reduce((str, token) => `${str}${token.toString()}${token instanceof Operator && token.isUnary() ? '' : ' '}`, '')
      .trim();
  }
}

module.exports = { Rule };
