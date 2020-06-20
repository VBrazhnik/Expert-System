const { expect } = require('chai');
const { Engine } = require('../../src/main/engine');
const { Fact } = require('../../src/models/fact');
const { Operator } = require('../../src/models/operator');
const { EngineError } = require('../../src/errors/engine-error');

describe('Engine', () => {
  describe('#convertToRpn()', () => {
    it('Should convert a base case', () => {
      const infixForm = [new Fact('A'), new Operator('+'), new Fact('B')];

      expect(Engine.convertToRpn(infixForm)).to.be.deep.equal([new Fact('A'), new Fact('B'), new Operator('+')]);
    });

    it('Should convert a case with operators with different priorities', () => {
      const infixForm = [new Fact('A'), new Operator('|'), new Fact('B'), new Operator('+'), new Fact('C')];

      expect(Engine.convertToRpn(infixForm)).to.be.deep.equal([
        new Fact('A'),
        new Fact('B'),
        new Fact('C'),
        new Operator('+'),
        new Operator('|'),
      ]);
    });

    it('Should convert a case with parenthesises', () => {
      const infixForm = [
        new Operator('('),
        new Fact('A'),
        new Operator('|'),
        new Fact('B'),
        new Operator(')'),
        new Operator('+'),
        new Fact('C'),
      ];

      expect(Engine.convertToRpn(infixForm)).to.be.deep.equal([
        new Fact('A'),
        new Fact('B'),
        new Operator('|'),
        new Fact('C'),
        new Operator('+'),
      ]);
    });

    it('Should convert a case with unary operator', () => {
      const infixForm = [
        new Operator('!'),
        new Fact('A'),
        new Operator('|'),
        new Fact('B'),
        new Operator('+'),
        new Fact('C'),
      ];

      expect(Engine.convertToRpn(infixForm)).to.be.deep.equal([
        new Fact('A'),
        new Operator('!'),
        new Fact('B'),
        new Fact('C'),
        new Operator('+'),
        new Operator('|'),
      ]);
    });

    it('Should convert a case with unary operator and parenthesises', () => {
      const infixForm = [
        new Operator('!'),
        new Operator('('),
        new Fact('A'),
        new Operator('|'),
        new Fact('B'),
        new Operator(')'),
        new Operator('+'),
        new Fact('C'),
      ];

      expect(Engine.convertToRpn(infixForm)).to.be.deep.equal([
        new Fact('A'),
        new Fact('B'),
        new Operator('|'),
        new Operator('!'),
        new Fact('C'),
        new Operator('+'),
      ]);
    });

    it('Should convert a case with multiple unary operators', () => {
      const infixForm = [
        new Operator('!'),
        new Operator('!'),
        new Operator('('),
        new Fact('A'),
        new Operator('^'),
        new Fact('B'),
        new Operator(')'),
        new Operator('+'),
        new Operator('!'),
        new Operator('!'),
        new Fact('C'),
      ];

      expect(Engine.convertToRpn(infixForm)).to.be.deep.equal([
        new Fact('A'),
        new Fact('B'),
        new Operator('^'),
        new Operator('!'),
        new Operator('!'),
        new Fact('C'),
        new Operator('!'),
        new Operator('!'),
        new Operator('+'),
      ]);
    });
  });

  describe('#calculateUnaryOperation()', () => {
    it('Should calculate unary operation "!"', () => {
      expect(Engine.calculateUnaryOperation('!', false)).to.be.true;
      expect(Engine.calculateUnaryOperation('!', true)).to.be.false;
    });

    it('Should throw an error in case of unsupported unary operation', () => {
      expect(() => {
        Engine.calculateUnaryOperation('/', true);
      }).to.throw(EngineError, 'Unary operator is not supported: /');
    });
  });

  describe('#calculateBinaryOperation()', () => {
    it('Should calculate binary operation "+"', () => {
      expect(Engine.calculateBinaryOperation('+', false, false)).to.be.false;
      expect(Engine.calculateBinaryOperation('+', false, true)).to.be.false;
      expect(Engine.calculateBinaryOperation('+', true, false)).to.be.false;
      expect(Engine.calculateBinaryOperation('+', true, true)).to.be.true;
    });

    it('Should calculate binary operation "^"', () => {
      expect(Engine.calculateBinaryOperation('^', false, false)).to.be.false;
      expect(Engine.calculateBinaryOperation('^', false, true)).to.be.true;
      expect(Engine.calculateBinaryOperation('^', true, false)).to.be.true;
      expect(Engine.calculateBinaryOperation('^', true, true)).to.be.false;
    });

    it('Should calculate binary operation "|"', () => {
      expect(Engine.calculateBinaryOperation('|', false, false)).to.be.false;
      expect(Engine.calculateBinaryOperation('|', false, true)).to.be.true;
      expect(Engine.calculateBinaryOperation('|', true, false)).to.be.true;
      expect(Engine.calculateBinaryOperation('|', true, true)).to.be.true;
    });

    it('Should throw an error in case of unsupported binary operation', () => {
      expect(() => {
        Engine.calculateBinaryOperation('&', true);
      }).to.throw(EngineError, 'Binary operator is not supported: &');
    });
  });

  describe('#evaluateRpnExpression()', () => {
    it('Should evaluate a basic expression', () => {
      expect(Engine.evaluateRpnExpression([true, true, new Operator('+')])).to.be.true;
    });

    it('Should evaluate a sophisticated expression', () => {
      expect(
        Engine.evaluateRpnExpression([
          false,
          true,
          new Operator('^'),
          new Operator('!'),
          new Operator('!'),
          false,
          new Operator('!'),
          new Operator('!'),
          new Operator('+'),
        ]),
      ).to.be.false;
    });

    it('Should throw an error in case of unexpected token', () => {
      expect(() => {
        Engine.evaluateRpnExpression([true, 'symbol', new Operator('+')]);
      }).to.throw(EngineError, 'Unexpected token: symbol');
    });
  });
});
