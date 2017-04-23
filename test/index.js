import {
  graphql,
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import GraphQLInputString from '../lib';


const getSchema = (options) => new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      input: {
        type: GraphQLString,
        args: {
          value: {
            type: GraphQLInputString(options),
          },
        },
        resolve: (_, {value}) => value,
      },
    },
  }),
});

const runQuery = (schema, value) =>
  graphql(schema, `{ input(value: ${JSON.stringify(value)}) }`)
    .then(({data, errors}) => {
      if (errors) throw errors;
      return data.input;
    });

const testEqual = (schema, done, value, expected) =>
  runQuery(schema, value)
    .then((input) => { expect(input).to.eql(expected); })
    .then(done, done);

const testError = (schema, done, value, expected) =>
  graphql(schema, `{ input(value: ${JSON.stringify(value)}) }`)
    .then((res) => {
      expect(res.errors[0].message).to.match(expected);
    })
    .then(done, done);


describe('GraphQLInputString', () => {
  it('default', (done) => {
    const schema = getSchema({
      name: 'default',
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value;

    testEqual(schema, done, value, expected);
  });

  it('trim', (done) => {
    const schema = getSchema({
      name: 'trim',
      trim: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trim();

    testEqual(schema, done, value, expected);
  });

  it('trimLeft', (done) => {
    const schema = getSchema({
      name: 'trimLeft',
      trimLeft: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trimLeft();

    testEqual(schema, done, value, expected);
  });

  it('trimRight', (done) => {
    const schema = getSchema({
      name: 'trimRight',
      trimRight: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trimRight();

    testEqual(schema, done, value, expected);
  });

  it('empty bad', (done) => {
    const schema = getSchema({
      name: 'NonString',
    });

    const value = '';

    testError(schema, done, value, /empty/i);
  });

  it('empty ok', (done) => {
    const schema = getSchema({
      name: 'NonString',
      empty: true,
    });

    const value = '';

    testEqual(schema, done, value, value);
  });

  it('truncate', (done) => {
    const schema = getSchema({
      name: 'truncate',
      truncate: 10,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.substring(0, 10);

    testEqual(schema, done, value, expected);
  });

  it('truncate no effect', (done) => {
    const schema = getSchema({
      name: 'truncate',
      truncate: 10,
    });

    const value = ' 921hlu';
    const expected = value;

    testEqual(schema, done, value, expected);
  });

  it('trim and truncate', (done) => {
    const schema = getSchema({
      name: 'truncate',
      trim: true,
      truncate: 10,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trim().substring(0, 10);

    testEqual(schema, done, value, expected);
  });

  it('upperCase', (done) => {
    const schema = getSchema({
      name: 'upperCase',
      upperCase: true,
    });

    const value = ' 921hluAoCb1 au0[g2930,0.Uh, ';
    const expected = value.toUpperCase();

    testEqual(schema, done, value, expected);
  });

  it('lowerCase', (done) => {
    const schema = getSchema({
      name: 'lowerCase',
      lowerCase: true,
    });

    const value = ' 921HluAOCB1 au0[G2930,0.uh, ';
    const expected = value.toLowerCase();

    testEqual(schema, done, value, expected);
  });

  it('capitalize', (done) => {
    const schema = getSchema({
      name: 'capitalize',
      capitalize: true,
    });

    const value = 'hello my friend.';
    const expected = 'Hello my friend.';

    testEqual(schema, done, value, expected);
  });

  it('capitalize characters', (done) => {
    const schema = getSchema({
      name: 'capitalize',
      capitalize: 'characters',
    });

    const value = 'hello my friend.';
    const expected = 'HELLO MY FRIEND.';

    testEqual(schema, done, value, expected);
  });

  it('capitalize words', (done) => {
    const schema = getSchema({
      name: 'capitalize',
      capitalize: 'words',
    });

    const value = 'hello my friend.';
    const expected = 'Hello My Friend.';

    testEqual(schema, done, value, expected);
  });

  it('capitalize sentences', (done) => {
    const schema = getSchema({
      name: 'capitalize',
      capitalize: 'sentences',
    });

    const value = 'hello my friend. hello my friend.';
    const expected = 'Hello my friend. Hello my friend.';

    testEqual(schema, done, value, expected);
  });

  it('capitalize empty string', (done) => {
    const schema = getSchema({
      name: 'capitalize',
      capitalize: true,
      empty: true,
    });

    const value = '';
    const expected = '';

    testEqual(schema, done, value, expected);
  });

  it('trim and capitalize', (done) => {
    const schema = getSchema({
      name: 'capitalize',
      trim: true,
      capitalize: true,
    });

    const value = '  hello my friend. ';
    const expected = 'Hello my friend.';

    testEqual(schema, done, value, expected);
  });

  it('sanitize', (done) => {
    const schema = getSchema({
      name: 'sanitize',
      sanitize: (s) => s.replace(/[^\d]*/g, ''),
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = '9211029300';

    testEqual(schema, done, value, expected);
  });

  it('non-string bad', (done) => {
    const schema = getSchema({
      name: 'NonString',
    });

    const value = 3;

    testError(schema, done, value, /type/i);
  });

  it('non-string ok', (done) => {
    const schema = getSchema({
      name: 'NonString',
    });

    const value = '3';

    testEqual(schema, done, value, value);
  });

  it('min bad', (done) => {
    const schema = getSchema({
      name: 'min',
      min: 3,
    });

    const value = 'ab';

    testError(schema, done, value, /minimum.*3/i);
  });

  it('min ok', (done) => {
    const schema = getSchema({
      name: 'min',
      min: 3,
    });

    const value = 'abc';

    testEqual(schema, done, value, value);
  });

  it('max bad', (done) => {
    const schema = getSchema({
      name: 'max',
      max: 5,
    });

    const value = 'abcdef';

    testError(schema, done, value, /maximum.*5/i);
  });

  it('max ok', (done) => {
    const schema = getSchema({
      name: 'max',
      max: 5,
    });

    const value = 'abcde';

    testEqual(schema, done, value, value);
  });

  it('pattern bad', (done) => {
    const schema = getSchema({
      name: 'pattern',
      pattern: /^\w+$/,
    });

    const value = ' a ';

    testError(schema, done, value, /pattern/i);
  });

  it('pattern ok', (done) => {
    const schema = getSchema({
      name: 'pattern',
      pattern: /^\w+$/,
    });

    const value = 'abc';

    testEqual(schema, done, value, value);
  });

  it('pattern string ok', (done) => {
    const schema = getSchema({
      name: 'pattern',
      pattern: '^\\w+$',
    });

    const value = 'abc';

    testEqual(schema, done, value, value);
  });

  it('test bad', (done) => {
    const schema = getSchema({
      name: 'test',
      test: (x) => x.length < 3,
    });

    const value = 'abc';

    testError(schema, done, value, /invalid/i);
  });

  it('test ok', (done) => {
    const schema = getSchema({
      name: 'test',
      test: (x) => x.length < 3,
    });

    const value = 'ab';

    testEqual(schema, done, value, value);
  });

  it('parse', (done) => {
    const schema = getSchema({
      name: 'parse',
      min: 5, // not forced to parse.
      parse: (s) => s.substring(0, 3),
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.substring(0, 3);

    testEqual(schema, done, value, expected);
  });

  it('error', (done) => {
    const schema = getSchema({
      name: 'error',
      error: (err) => JSON.stringify(err),
    });

    const value = '';

    runQuery(schema, value)
      .then((input) => {
        input = JSON.parse(input);
        expect(input.value).to.equal(value);
        expect(input.type).to.equal('empty');
      })
      .then(done, done);
  });

  it('name', () => {
    expect(() => GraphQLInputString({
      // name is missing
    })).to.throw(/name/i);
  });

  it('description', () => {
    const description = 'this is description';
    const type = GraphQLInputString({
      name: 'desc',
      description,
    });
    expect(type.description).to.equal(description);
  });

  it('serialize', (done) => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          output: {
            type: GraphQLInputString({
              name: 'output',
              trim: true,
            }),
            resolve: () => ' test ',
          },
        },
      }),
    });

    graphql(schema, '{ output }')
      .then((res) => {
        // trim is only applied to input
        expect(res.data.output).to.equal(' test ');
      })
      .then(done, done);
  });

  it('autodescriptors', () => {
    let scalar = GraphQLInputString({
              name: 'output',
              min: 2,
              trim: true,
            });

    expect(scalar.description).to.equal('A string of at least 2 characters that is trimmed.')

    scalar = GraphQLInputString({
              name: 'output',
              min: 2,
              max: 4,
              trim: true,
            });

    expect(scalar.description).to.equal('A string between 2 and 4 characters that is trimmed.')

    scalar = GraphQLInputString({
              name: 'output',
              min: 2,
              max: 4,
              trim: true,
              description: 'A custom string.',
            });

    expect(scalar.description).to.equal('A custom string.')
  });
});
