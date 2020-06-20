const { expect } = require('chai');
const { Rule } = require('../../src/models/rule');
const { Fact } = require('../../src/models/fact');
const { Operator } = require('../../src/models/operator');
const { NOT, AND, OR, XOR } = require('../../src/constants/operator-action');

describe('Rule', () => {
  describe('#constructor()', () => {
    it('Should return an object', () => {
      const condition = [new Fact('A'), new Operator(AND), new Fact('B')];
      const conclusion = [new Fact('C')];

      const rule = new Rule(condition, conclusion);

      expect(rule).to.be.deep.equal({ condition, conclusion });
    });
  });

  describe('#toString()', () => {
    it('Should return a string for a simple rule', () => {
      const condition = [new Fact('A')];
      const conclusion = [new Fact('B')];

      const rule = new Rule(condition, conclusion);

      expect(rule.toString()).to.be.equal('A => B');
    });

    it('Should return a string for a rule with a unary operator', () => {
      const condition = [
        new Operator(NOT),
        new Fact('A'),
        new Operator(AND),
        new Fact('B'),
        new Operator(OR),
        new Fact('C'),
        new Operator(XOR),
        new Fact('D'),
      ];
      const conclusion = [new Fact('E'), new Operator(AND), new Operator(NOT), new Operator(NOT), new Fact('F')];

      const rule = new Rule(condition, conclusion);

      expect(rule.toString()).to.be.equal('!A + B | C ^ D => E + !!F');
    });
  });
});
