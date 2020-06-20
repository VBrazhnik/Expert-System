const { expect } = require('chai');
const { FactsMap } = require('../../src/models/facts-map');
const { NONE, FALSE, TRUE } = require('../../src/constants/fact-value');

describe('Facts Map', () => {
  describe('#constructor()', () => {
    it('Should return an object', () => {
      const factsMap = new FactsMap();

      expect(factsMap).to.have.property('map');
      expect(factsMap.map).to.be.empty;
    });
  });

  describe('#add()', () => {
    it('Should add a fact', () => {
      const factsMap = new FactsMap();

      factsMap.add('A');
      expect(factsMap.map).to.have.all.keys('A');
      expect(factsMap.map).to.deep.include({ value: NONE, isQuery: false });
    });

    it('Should throw an error if a fact is already added', () => {
      const factsMap = new FactsMap();

      factsMap.add('B');
      expect(() => {
        factsMap.add('B');
      }).to.throw(Error, 'The fact "B" is already added');
    });
  });

  describe('#markAsQuery()', () => {
    it('Should mark a fact as a query', () => {
      const factsMap = new FactsMap();

      factsMap.add('C');
      expect(factsMap.get('C')).to.be.deep.equal({ value: NONE, isQuery: false });
      factsMap.markAsQuery('C');
      expect(factsMap.get('C')).to.be.deep.equal({ value: NONE, isQuery: true });
    });

    it('Should throw an error if a fact is not present', () => {
      const factsMap = new FactsMap();

      expect(() => {
        factsMap.markAsQuery('D');
      }).to.throw(Error, 'The fact "D" is unknown');
    });
  });

  describe('#get()', () => {
    it('Should return an object if a fact is present', () => {
      const factsMap = new FactsMap();

      factsMap.add('E');
      expect(factsMap.get('E')).to.be.deep.equal({ value: NONE, isQuery: false });
    });

    it('Should return "undefined" if a fact is not present', () => {
      const factsMap = new FactsMap();

      expect(factsMap.get('F')).to.be.undefined;
    });
  });

  describe('#set()', () => {
    it('Should set a value of a fact', () => {
      const factsMap = new FactsMap();

      factsMap.add('G');
      expect(factsMap.get('G')).to.be.deep.equal({ value: NONE, isQuery: false });
      factsMap.set('G', TRUE);
      expect(factsMap.get('G')).to.be.deep.equal({ value: TRUE, isQuery: false });
    });

    it('Should throw an error if a fact is not present', () => {
      const factsMap = new FactsMap();

      expect(() => {
        factsMap.set('H', TRUE);
      }).to.throw(Error, 'The fact "H" is unknown');
    });

    it('Should throw an error if a fact value has contradiction', () => {
      const factsMap = new FactsMap();

      factsMap.add('I');
      factsMap.set('I', FALSE);
      expect(() => {
        factsMap.set('I', TRUE);
      }).to.throw(Error, 'Value of fact "I" contradiction');
    });
  });

  describe('#get queries()', () => {
    it('Should return an object-map of queries', () => {
      const factsMap = new FactsMap();

      factsMap.add('A');
      factsMap.add('B');
      factsMap.add('C');
      factsMap.markAsQuery('C');

      expect(factsMap.queries).to.be.deep.equal({ C: NONE });
    });

    it('Should return an empty object-map', () => {
      const factsMap = new FactsMap();

      factsMap.add('A');

      expect(factsMap.queries).to.be.an('object').and.to.be.empty;
    });
  });
});
