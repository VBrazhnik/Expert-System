const { expect } = require('chai');
const { Fact } = require('../../src/models/fact');

describe('Fact', () => {
  describe('#constructor()', () => {
    it('Should return an object', () => {
      const fact = new Fact('A');

      expect(fact).to.be.deep.equal({ name: 'A' });
    });
  });

  describe('#toString()', () => {
    it('Should return a string', () => {
      const fact = new Fact('A');

      expect(fact.toString()).to.be.equal('A');
    });
  });
});
