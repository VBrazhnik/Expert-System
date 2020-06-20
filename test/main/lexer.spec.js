const { expect } = require('chai');
const { Lexer } = require('../../src/main/lexer');
const { LexicalError } = require('../../src/errors/lexical-error');
const { RULE, INITIAL_FACTS, QUERIES } = require('../../src/constants/statement-type');
const { Fact } = require('../../src/models/fact');
const { Operator } = require('../../src/models/operator');

describe('Lexer', () => {
  describe('#removeComment()', () => {
    it('Should remove comment at the end of line', () => {
      expect(Lexer.removeComment('A + B => C # Rule')).to.be.equal('A + B => C ');
    });

    it('Should remove comment which takes the whole line', () => {
      expect(Lexer.removeComment('# Comment')).to.be.equal('');
    });
  });

  describe('#removeWhitespaces()', () => {
    it('Should remove whitespaces', () => {
      expect(Lexer.removeWhitespaces('\tA + B   => C')).to.be.equal('A+B=>C');
    });
  });

  describe('#isBlankLine()', () => {
    it('Should return "true" in case of a blank line', () => {
      expect(Lexer.isBlankLine(' \t  ')).to.be.true;
    });

    it('Should return "false" in case of a non-blank line', () => {
      expect(Lexer.isBlankLine('  A + B => \t C  ')).to.be.false;
    });
  });

  describe('#isFact()', () => {
    it('Should return "true" in case of a fact lexeme', () => {
      expect(Lexer.isFact('A')).to.be.true;
      expect(Lexer.isFact('C')).to.be.true;
      expect(Lexer.isFact('Z')).to.be.true;
    });

    it('Should return "false" is case of a non-fact lexeme', () => {
      expect(Lexer.isFact('a')).to.be.false;
      expect(Lexer.isFact('!')).to.be.false;
      expect(Lexer.isFact('')).to.be.false;
      expect(Lexer.isFact('AB')).to.be.false;
    });
  });

  describe('#isOperator()', () => {
    it('Should return "true" in case of an operator lexeme', () => {
      expect(Lexer.isOperator('!')).to.be.true;
      expect(Lexer.isOperator('^')).to.be.true;
      expect(Lexer.isOperator('|')).to.be.true;
      expect(Lexer.isOperator('+')).to.be.true;
      expect(Lexer.isOperator('(')).to.be.true;
      expect(Lexer.isOperator(')')).to.be.true;
    });

    it('Should return "false" in case of a non-operator lexeme', () => {
      expect(Lexer.isOperator('A')).to.be.false;
      expect(Lexer.isOperator('')).to.be.false;
      expect(Lexer.isOperator('*')).to.be.false;
      expect(Lexer.isOperator('/')).to.be.false;
      expect(Lexer.isOperator('=>')).to.be.false;
    });
  });

  describe('#isRule()', () => {
    it('Should return "true" in case of a rule statement', () => {
      expect(Lexer.isRule('A + B => C')).to.be.true;
      expect(Lexer.isRule('+ A B => | C')).to.be.true;
    });

    it('Should return "false" in case of a non-rule statement', () => {
      expect(Lexer.isRule('A + B + C')).to.be.false;
      expect(Lexer.isRule('A <= B')).to.be.false;
      expect(Lexer.isRule('A + С = B')).to.be.false;
    });
  });

  describe('#isInitialFacts()', () => {
    it('Should return "true" in case of an initial facts statement', () => {
      expect(Lexer.isInitialFacts('=')).to.be.true;
      expect(Lexer.isInitialFacts('=A')).to.be.true;
      expect(Lexer.isInitialFacts('=ABC')).to.be.true;
    });

    it('Should return "false" in case of an non-initial facts statement', () => {
      expect(Lexer.isInitialFacts('')).to.be.false;
      expect(Lexer.isInitialFacts('A')).to.be.false;
      expect(Lexer.isInitialFacts('A|B')).to.be.false;
    });
  });

  describe('#isQueries()', () => {
    it('Should return "true" in case of a queries statement', () => {
      expect(Lexer.isQueries('?A')).to.be.true;
      expect(Lexer.isQueries('?AB')).to.be.true;
    });

    it('Should return "false" in case of a non-queries statement', () => {
      expect(Lexer.isQueries('?')).to.be.false;
      expect(Lexer.isQueries('?A B')).to.be.false;
    });
  });

  describe('#getStatementType()', () => {
    it('Should return a type of statement which is corresponding to a rule', () => {
      expect(Lexer.getStatementType('A + B => C')).to.be.equal(RULE);
      expect(Lexer.getStatementType('(A + B) => C')).to.be.equal(RULE);
      expect(Lexer.getStatementType('A | B => C + !D')).to.be.equal(RULE);
    });

    it('Should return a type of statement which is corresponding to an initial facts statement', () => {
      expect(Lexer.getStatementType('=')).to.be.equal(INITIAL_FACTS);
      expect(Lexer.getStatementType('=A')).to.be.equal(INITIAL_FACTS);
      expect(Lexer.getStatementType('=ABC')).to.be.equal(INITIAL_FACTS);
    });

    it('Should return a type of statement which is corresponding to a queries statement', () => {
      expect(Lexer.getStatementType('?A')).to.be.equal(QUERIES);
      expect(Lexer.getStatementType('?ABC')).to.be.equal(QUERIES);
    });

    it('Should return "undefined" if a type of statement is unknown', () => {
      expect(Lexer.getStatementType('')).to.be.undefined;
      expect(Lexer.getStatementType('# Comment')).to.be.undefined;
      expect(Lexer.getStatementType('A + C')).to.be.undefined;
      expect(Lexer.getStatementType('=A | B')).to.be.undefined;
      expect(Lexer.getStatementType('?')).to.be.undefined;
    });
  });

  describe('#isValidStructure()', () => {
    it('Should return "true" in case of a valid file structure', () => {
      expect(Lexer.isValidStructure([RULE, INITIAL_FACTS, QUERIES])).to.be.true;
      expect(Lexer.isValidStructure([RULE, RULE, RULE, INITIAL_FACTS, QUERIES])).to.be.true;
    });

    it('Should return "false" in case of a valid file structure', () => {
      expect(Lexer.isValidStructure([RULE, QUERIES, INITIAL_FACTS])).to.be.false;
      expect(Lexer.isValidStructure([INITIAL_FACTS, RULE, QUERIES])).to.be.false;
      expect(Lexer.isValidStructure([RULE, INITIAL_FACTS, RULE, QUERIES, RULE])).to.be.false;
      expect(Lexer.isValidStructure([RULE, INITIAL_FACTS, INITIAL_FACTS, QUERIES])).to.be.false;
      expect(Lexer.isValidStructure([RULE, INITIAL_FACTS, QUERIES, QUERIES])).to.be.false;
      expect(Lexer.isValidStructure([RULE])).to.be.false;
      expect(Lexer.isValidStructure([RULE, QUERIES])).to.be.false;
      expect(Lexer.isValidStructure([RULE, INITIAL_FACTS])).to.be.false;
      expect(Lexer.isValidStructure([INITIAL_FACTS, QUERIES])).to.be.false;
    });
  });

  describe('#createToken()', () => {
    it('Should create a fact token', () => {
      expect(Lexer.createToken('A')).to.be.deep.equal(new Fact('A'));
    });

    it('Should create an operator token', () => {
      expect(Lexer.createToken('|')).to.be.deep.equal(new Operator('|'));
    });
  });

  describe('#tokenizeRule()', () => {
    it('Should return tokens of a rule', () => {
      const { condition, conclusion } = Lexer.tokenizeRule('D + E => F');

      expect(condition).to.be.deep.equal([new Fact('D'), new Operator('+'), new Fact('E')]);
      expect(conclusion).to.be.deep.equal([new Fact('F')]);
    });
  });

  describe('#tokenizeInitialFacts()', () => {
    it('Should return tokens of an initial facts statement', () => {
      expect(Lexer.tokenizeInitialFacts('=')).to.be.deep.equal([]);
      expect(Lexer.tokenizeInitialFacts('=AB')).to.be.deep.equal([new Fact('A'), new Fact('B')]);
    });
  });

  describe('#tokenizeQueries()', () => {
    it('Should return tokens of a queries statement', () => {
      expect(Lexer.tokenizeQueries('?C')).to.be.deep.equal([new Fact('C')]);
    });
  });

  describe('#convert()', () => {
    it('Should convert an input', () => {
      const input = `
        # Rules:
        B + !C => A
        D => A

        =BD # The initial facts statement

        ?A # The queries statement
      `;

      expect(Lexer.convert(input)).to.be.deep.equal([
        { lineIndex: 2, content: '        B + !C => A' },
        { lineIndex: 3, content: '        D => A' },
        { lineIndex: 5, content: '        =BD ' },
        { lineIndex: 7, content: '        ?A ' },
      ]);
    });
  });

  describe('#analyze()', () => {
    it('Should perform lexical analysis', () => {
      const input = `
        B + !C => A

        =B

        ?A
      `;

      const lexemes = Lexer.analyze(input);

      expect(lexemes).to.have.all.keys('rules', 'initialFacts', 'queries');

      const { rules, initialFacts, queries } = lexemes;

      expect(rules).to.have.lengthOf(1);

      const [rule] = rules;
      expect(rule).to.have.all.keys('lineIndex', 'tokens');

      const { lineIndex, tokens } = rule;
      expect(lineIndex).to.be.equal(1);
      expect(tokens).to.have.all.keys('condition', 'conclusion');

      const { condition, conclusion } = tokens;
      expect(condition).to.be.deep.equal([new Fact('B'), new Operator('+'), new Operator('!'), new Fact('C')]);
      expect(conclusion).to.be.deep.equal([new Fact('A')]);

      expect(initialFacts.lineIndex).to.be.equal(3);
      expect(initialFacts.tokens).to.be.deep.equal([new Fact('B')]);

      expect(queries.lineIndex).to.be.equal(5);
      expect(queries.tokens).to.be.deep.equal([new Fact('A')]);
    });

    it('Should ignore comments', () => {
      const input = `
        # The list of rules:
        B + !C => A # The first rule
        D => A # The second rule
        A => E # The third rule
        # The list of initial facts:
        =BD # The initial facts statement
        # The list of queries
        ?AE # The queries statement
      `;

      const lexemes = Lexer.analyze(input);

      expect(lexemes).to.have.all.keys('rules', 'initialFacts', 'queries');

      const { rules, initialFacts, queries } = lexemes;

      expect(rules).to.have.lengthOf(3);

      expect(rules[0]).to.have.all.keys('lineIndex', 'tokens');

      expect(rules[0].lineIndex).to.be.equal(2);
      expect(rules[0].tokens).to.have.all.keys('condition', 'conclusion');

      expect(rules[0].tokens.condition).to.be.deep.equal([
        new Fact('B'),
        new Operator('+'),
        new Operator('!'),
        new Fact('C'),
      ]);
      expect(rules[0].tokens.conclusion).to.be.deep.equal([new Fact('A')]);

      expect(rules[1]).to.have.all.keys('lineIndex', 'tokens');

      expect(rules[1].lineIndex).to.be.equal(3);
      expect(rules[1].tokens).to.have.all.keys('condition', 'conclusion');

      expect(rules[1].tokens.condition).to.be.deep.equal([new Fact('D')]);
      expect(rules[1].tokens.conclusion).to.be.deep.equal([new Fact('A')]);

      expect(rules[2]).to.have.all.keys('lineIndex', 'tokens');

      expect(rules[2].lineIndex).to.be.equal(4);
      expect(rules[2].tokens).to.have.all.keys('condition', 'conclusion');

      expect(rules[2].tokens.condition).to.be.deep.equal([new Fact('A')]);
      expect(rules[2].tokens.conclusion).to.be.deep.equal([new Fact('E')]);

      expect(initialFacts.lineIndex).to.be.equal(6);
      expect(initialFacts.tokens).to.be.deep.equal([new Fact('B'), new Fact('D')]);

      expect(queries.lineIndex).to.be.equal(8);
      expect(queries.tokens).to.be.deep.equal([new Fact('A'), new Fact('E')]);
    });

    it('Should perform lexical analysis in case of parentheses in rules', () => {
      const input = `
        !(B + C) => A

        =B

        ?A
      `;

      const lexemes = Lexer.analyze(input);

      expect(lexemes).to.have.all.keys('rules', 'initialFacts', 'queries');

      const [rule] = lexemes.rules;

      expect(rule).to.have.all.keys('lineIndex', 'tokens');

      const { lineIndex, tokens } = rule;
      expect(lineIndex).to.be.equal(1);
      expect(tokens).to.have.all.keys('condition', 'conclusion');

      const { condition, conclusion } = tokens;
      expect(condition).to.be.deep.equal([
        new Operator('!'),
        new Operator('('),
        new Fact('B'),
        new Operator('+'),
        new Fact('C'),
        new Operator(')'),
      ]);
      expect(conclusion).to.be.deep.equal([new Fact('A')]);
    });

    it('Should throw an error in case of empty input', () => {
      const input = '';

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid file structure');
    });

    it('Should throw an error in case of no rules', () => {
      const input = `
        =B

        ?A
      `;

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid file structure');
    });

    it('Should throw an error in case of no initial facts statement', () => {
      const input = `
        B + !C => A

        ?A
      `;

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid file structure');
    });

    it('Should throw an error in case on multiple initial facts statements', () => {
      const input = `
        B + !C => A

        =B
        =C

        ?A
      `;

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid file structure');
    });

    it('Should throw an error in case of no queries statement', () => {
      const input = `
        B + !C => A

        =B
      `;

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid file structure');
    });

    it('Should throw an error in case of multiple queries statements', () => {
      const input = `
        B + !C => A

        =B

        ?A
        ?C
      `;

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid file structure');
    });

    it('Should throw an error in case of invalid syntax of initial facts statement', () => {
      const input = `
        B + !C => A

        =B+C

        ?A
      `;

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid line #4');
    });

    it('Should throw an error in case of invalid syntax of queries statement', () => {
      const input = `
        B + !C => A

        =B

        ?A|C
      `;

      expect(() => {
        Lexer.analyze(input);
      }).to.throw(LexicalError, 'Invalid line #6');
    });
  });
});
