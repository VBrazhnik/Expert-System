# Expert System

![Expert System](/images/expert-system.png)

**Expert System** is a School 42 project. The purpose of this project is to create a propositional calculus expert system.

[`expert_system.en.pdf`](/expert_system.en.pdf) is the task file.

## Wiki

This project has [wiki-pages](../../wiki/) with explanations and tips.

## Requirements

It is a Node.js project. So installed Node.js and npm are required:

- Node.js — 12 (`node --version`)
- npm — >= 5 (`npm --version`)

> Note: npm is installed with Node.js.

> Note: [nvm](https://github.com/nvm-sh/nvm) can be used to install a required version of Node.js. `.nvmrc` is present.

## How to install?

Clone repository:

```
git clone <repository url>
```

Then go into the created directory and install `node_modules`:

```
npm install
```

## How to use?

```
Usage: node ./index.js <file-path>

Options:
  --verbose, -v  Run with verbose logging             [boolean] [default: false]
  --color, -c    Enable colorful output               [boolean] [default: false]
  --help         Show help                                             [boolean]
```

### How to test?

To run unit tests use:

```
npm test
```

To get the detailed report about the code coverage of each file run:

```
npm run test:coverage
```

To get the summary report use:

```
npm run test:coverage:summary
```
