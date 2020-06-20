const RULE_REGEX = /^(?<condition>[A-Z!+|^()]+)=>(?<conclusion>[A-Z!+|^()]+)$/;

const INITIAL_FACTS_REGEX = /^=(?<initialFacts>[A-Z]*)$/;

const QUERIES_REGEX = /^\?(?<queries>[A-Z]+)$/;

module.exports = {
  RULE_REGEX,
  INITIAL_FACTS_REGEX,
  QUERIES_REGEX,
};
