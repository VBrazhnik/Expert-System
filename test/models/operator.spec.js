const { expect } = require('chai');
const { Operator } = require('../../src/models/operator');
const { OR, XOR, AND, NOT, LEFT_PARENTHESIS, RIGHT_PARENTHESIS } = require('../../src/constants/operator-action');

describe('Operator', () => {
  describe('#getPriority()', () => {
    describe('Should return a priority of operator', () => {
      expect(Operator.getPriority(OR)).to.be.equal(0);
      expect(Operator.getPriority(XOR)).to.be.equal(1);
      expect(Operator.getPriority(AND)).to.be.equal(2);
      expect(Operator.getPriority(NOT)).to.be.equal(3);
      expect(Operator.getPriority(LEFT_PARENTHESIS)).to.be.equal(-1);
      expect(Operator.getPriority(RIGHT_PARENTHESIS)).to.be.equal(-1);
    });
  });

  describe('#constructor()', () => {
    it('Should return an object', () => {
      expect(new Operator(OR)).to.be.deep.equal({ action: OR });
    });
  });

  describe('#toString()', () => {
    it('Should return a string', () => {
      expect(new Operator(OR).toString()).to.be.deep.equal(OR);
    });
  });

  describe('#isUnary()', () => {
    it('Should return "true" in case of unary operator', () => {
      expect(new Operator(NOT).isUnary()).to.be.true;
    });

    it('Should return "false" in case of non-unary operator', () => {
      expect(new Operator(XOR).isUnary()).to.be.false;
      expect(new Operator(LEFT_PARENTHESIS).isUnary()).to.be.false;
    });
  });

  describe('#isBinary()', () => {
    it('Should return "true" in case of binary operator', () => {
      expect(new Operator(OR).isBinary()).to.be.true;
      expect(new Operator(XOR).isBinary()).to.be.true;
      expect(new Operator(AND).isBinary()).to.be.true;
    });

    it('Should return "false" in case of non-binary operator', () => {
      expect(new Operator(NOT).isBinary()).to.be.false;
      expect(new Operator(LEFT_PARENTHESIS).isBinary()).to.be.false;
    });
  });

  describe('#isLeftParenthesis()', () => {
    it('Should return "true" in case of left parenthesis operator', () => {
      expect(new Operator(LEFT_PARENTHESIS).isLeftParenthesis()).to.be.true;
    });

    it('Should return "false" in case of non-left parenthesis operator', () => {
      expect(new Operator(RIGHT_PARENTHESIS).isLeftParenthesis()).to.be.false;
      expect(new Operator(NOT).isLeftParenthesis()).to.be.false;
      expect(new Operator(XOR).isLeftParenthesis()).to.be.false;
    });
  });

  describe('#isRightParenthesis()', () => {
    it('Should return "true" in case of right parenthesis operator', () => {
      expect(new Operator(RIGHT_PARENTHESIS).isRightParenthesis()).to.be.true;
    });

    it('Should return "false" in case of non-right parenthesis operator', () => {
      expect(new Operator(LEFT_PARENTHESIS).isRightParenthesis()).to.be.false;
      expect(new Operator(NOT).isRightParenthesis()).to.be.false;
      expect(new Operator(AND).isRightParenthesis()).to.be.false;
    });
  });
});
