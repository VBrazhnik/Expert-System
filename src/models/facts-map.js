const { NONE } = require('../constants/fact-value');

class FactsMap {
  constructor() {
    this.map = new Map();
  }

  add(name) {
    if (this.get(name)) {
      throw new Error(`The fact "${name}" is already added`);
    }

    this.map.set(name, { value: NONE, isQuery: false });
  }

  markAsQuery(name) {
    const fact = this.get(name);

    if (!fact) {
      throw new Error(`The fact "${name}" is unknown`);
    }

    fact.isQuery = true;
  }

  get(name) {
    return this.map.get(name);
  }

  set(name, newValue) {
    const fact = this.get(name);

    if (!fact) {
      throw new Error(`The fact "${name}" is unknown`);
    }

    const { value: currentValue, isQuery } = fact;

    if (currentValue !== NONE && currentValue !== newValue) {
      throw new Error(`Value of fact "${name}" contradiction`);
    }

    this.map.set(name, { value: newValue, isQuery });
  }

  get queries() {
    const queries = {};

    this.map.forEach(({ value, isQuery }, name) => {
      if (isQuery) {
        queries[name] = value;
      }
    });

    return queries;
  }
}

module.exports = { FactsMap };
