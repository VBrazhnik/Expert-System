const { OR, XOR, AND, NOT, LEFT_PARENTHESIS, RIGHT_PARENTHESIS } = require('../constants/operator-action');

class Operator {
  static getPriority(action) {
    return [OR, XOR, AND, NOT].indexOf(action);
  }

  constructor(action) {
    this.action = action;
  }

  toString() {
    return this.action;
  }

  isUnary() {
    return this.action === NOT;
  }

  isBinary() {
    return [AND, XOR, OR].includes(this.action);
  }

  isLeftParenthesis() {
    return this.action === LEFT_PARENTHESIS;
  }

  isRightParenthesis() {
    return this.action === RIGHT_PARENTHESIS;
  }
}

module.exports = { Operator };
