const { expect } = require('chai');
const { Lexer } = require('../src/main/lexer');
const { Parser } = require('../src/main/parser');
const { Engine } = require('../src/main/engine');
const { TRUE, FALSE } = require('../src/constants/fact-value');

describe('Expert system', () => {
  const runExpertSystem = input => {
    const lexemes = Lexer.analyze(input);

    const parser = new Parser(lexemes.rules, lexemes.initialFacts, lexemes.queries);

    const { factsMap, rules } = parser.parse();

    const engine = new Engine(factsMap, rules);

    return engine.compute();
  };

  describe('AND conditions and conclusions', () => {
    const getInput = initialFacts => {
      return `
        # Rules
        B => A
        D + E => B
        G + H => F
        I + J => G
        G => H
        L + M => K
        O + P => L + N
        N => M

        # Initial facts
        =${initialFacts}

        # Queries
        ?AFKP
      `;
    };

    it('Case #1', () => {
      const input = getInput('DEIJOP');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
        F: TRUE,
        K: TRUE,
        P: TRUE,
      });
    });

    it('Case #2', () => {
      const input = getInput('DEIJP');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
        F: TRUE,
        K: FALSE,
        P: TRUE,
      });
    });
  });

  describe('OR conditions', () => {
    const getInput = initialFacts => {
      return `
        # Rules
        B + C => A
        D | E => B
        B => C

        # Initial facts
        =${initialFacts}

        # Queries
        ?A
      `;
    };

    it('Case #1', () => {
      const input = getInput('');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: FALSE,
      });
    });

    it('Case #2', () => {
      const input = getInput('D');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });

    it('Case #3', () => {
      const input = getInput('E');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });

    it('Case #4', () => {
      const input = getInput('DE');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });
  });

  describe('XOR conditions', () => {
    const getInput = initialFacts => {
      return `
        # Rules
        B + C => A
        D ^ E => B
        B => C

        # Initial facts
        =${initialFacts}

        # Queries
        ?A
      `;
    };

    it('Case #1', () => {
      const input = getInput('');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: FALSE,
      });
    });

    it('Case #2', () => {
      const input = getInput('D');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });

    it('Case #3', () => {
      const input = getInput('E');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });

    it('Case #3', () => {
      const input = getInput('DE');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: FALSE,
      });
    });
  });

  describe('Negation', () => {
    const getInput = initialFacts => {
      return `
        # Rules
        B + !C => A

        # Initial facts
        =${initialFacts}

        # Queries
        ?A
      `;
    };

    it('Case #1', () => {
      const input = getInput('');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: FALSE,
      });
    });

    it('Case #2', () => {
      const input = getInput('B');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });

    it('Case #3', () => {
      const input = getInput('C');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: FALSE,
      });
    });

    it('Case #4', () => {
      const input = getInput('BC');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: FALSE,
      });
    });
  });

  describe('Same conclusion in multiple rules', () => {
    const getInput = initialFacts => {
      return `
        # Rules
        B => A
        C => A

        # Initial facts
        =${initialFacts}

        # Queries
        ?A
      `;
    };

    it('Case #1', () => {
      const input = getInput('');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: FALSE,
      });
    });

    it('Case #2', () => {
      const input = getInput('B');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });

    it('Case #3', () => {
      const input = getInput('C');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });

    it('Case #4', () => {
      const input = getInput('BC');

      expect(runExpertSystem(input)).to.be.deep.equal({
        A: TRUE,
      });
    });
  });

  describe('Parentheses', () => {
    const getInput = initialFacts => {
      return `
        # Rules
        A | B + C => E
        (F | G) + H => E

        # Initial facts
        =${initialFacts}

        # Queries
        ?E
      `;
    };

    it('Case #1', () => {
      const input = getInput('');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: FALSE,
      });
    });

    it('Case #2', () => {
      const input = getInput('A');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: TRUE,
      });
    });

    it('Case #3', () => {
      const input = getInput('B');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: FALSE,
      });
    });

    it('Case #4', () => {
      const input = getInput('C');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: FALSE,
      });
    });

    it('Case #5', () => {
      const input = getInput('AC');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: TRUE,
      });
    });

    it('Case #6', () => {
      const input = getInput('BC');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: TRUE,
      });
    });

    it('Case #7', () => {
      const input = getInput('F');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: FALSE,
      });
    });

    it('Case #8', () => {
      const input = getInput('G');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: FALSE,
      });
    });

    it('Case #9', () => {
      const input = getInput('H');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: FALSE,
      });
    });

    it('Case #10', () => {
      const input = getInput('FH');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: TRUE,
      });
    });

    it('Case #11', () => {
      const input = getInput('GH');

      expect(runExpertSystem(input)).to.be.deep.equal({
        E: TRUE,
      });
    });
  });
});
