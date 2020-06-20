const { expect } = require('chai');
const { Parser } = require('../../src/main/parser');
const { Fact } = require('../../src/models/fact');
const { Operator } = require('../../src/models/operator');

describe('Parser', () => {
  describe('#countFacts()', () => {
    it('Should return a count of facts', () => {
      expect(Parser.countFacts([])).to.be.equal(0);
      expect(Parser.countFacts([new Fact('A'), new Operator('+')])).to.be.equal(1);
      expect(Parser.countFacts([new Fact('A'), new Operator('+'), new Fact('B')])).to.be.equal(2);
    });
  });

  describe('#getFactNames()', () => {
    it('Should return fact names', () => {
      expect(
        Parser.getFactNames([
          new Fact('C'),
          new Operator('+'),
          new Fact('A'),
          new Fact('B'),
          new Operator('|'),
          new Fact('D'),
        ]),
      ).to.be.deep.equal(['A', 'B', 'C', 'D']);
    });
  });

  describe('#areParenthesesMatched()', () => {
    it('Should return "true" in case of parentheses match', () => {
      expect(
        Parser.areParenthesesMatched([
          new Operator('('),
          new Fact('A'),
          new Operator('+'),
          new Fact('B'),
          new Operator(')'),
        ]),
      ).to.be.true;

      expect(
        Parser.areParenthesesMatched([
          new Operator('('),
          new Operator('!'),
          new Operator('('),
          new Fact('A'),
          new Operator(')'),
          new Operator('+'),
          new Fact('B'),
          new Operator(')'),
        ]),
      ).to.be.true;

      expect(Parser.areParenthesesMatched([new Fact('A'), new Operator('+'), new Fact('B')])).to.be.true;
    });

    it('Should return "false" in case of parentheses mismatch', () => {
      expect(
        Parser.areParenthesesMatched([
          new Operator('('),
          new Fact('A'),
          new Operator('+'),
          new Fact('B'),
          new Operator('+'),
          new Fact('C'),
        ]),
      ).to.be.false;

      expect(
        Parser.areParenthesesMatched([
          new Operator('('),
          new Fact('A'),
          new Operator('+'),
          new Fact('B'),
          new Operator(')'),
          new Operator(')'),
        ]),
      ).to.be.false;
    });
  });

  describe('#isValidRuleSide()', () => {
    it('Should return "true" in case of a valid rule side', () => {
      expect(Parser.isValidRuleSide([new Fact('A'), new Operator('+'), new Fact('B')])).to.be.true;

      expect(
        Parser.isValidRuleSide([new Operator('('), new Fact('A'), new Operator('+'), new Fact('B'), new Operator(')')]),
      ).to.be.true;

      expect(
        Parser.isValidRuleSide([new Operator('!'), new Fact('A'), new Operator('+'), new Operator('!'), new Fact('B')]),
      ).to.be.true;

      expect(
        Parser.isValidRuleSide([
          new Operator('!'),
          new Fact('A'),
          new Operator('+'),
          new Operator('!'),
          new Operator('!'),
          new Fact('B'),
        ]),
      ).to.be.true;

      expect(
        Parser.isValidRuleSide([
          new Operator('!'),
          new Operator('('),
          new Fact('A'),
          new Operator('+'),
          new Fact('B'),
          new Operator(')'),
        ]),
      ).to.be.true;
    });

    it('Should return "false" in case of an invalid rule side', () => {
      expect(Parser.isValidRuleSide([new Fact('A'), new Operator('+')])).to.be.false;

      expect(Parser.isValidRuleSide([new Fact('A'), new Fact('B'), new Operator('+')])).to.be.false;

      expect(Parser.isValidRuleSide([new Fact('A'), new Operator('!'), new Operator('+'), new Fact('B')])).to.be.false;

      expect(
        Parser.isValidRuleSide([new Operator(')'), new Fact('A'), new Operator('+'), new Fact('B'), new Operator('(')]),
      ).to.be.false;

      expect(Parser.isValidRuleSide([new Operator('('), new Operator(')')])).to.be.false;

      expect(Parser.isValidRuleSide([])).to.be.false;
    });
  });
});
