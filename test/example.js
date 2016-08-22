/*import {run} from '@cycle/xstream-run';
import {makeGridDriver} from '../src/index.js';
import xs from 'xstream';

run(function ({grid}) {
  const stream = xs.periodic(100).take(3);
  return {
    grid: grid.register(stream).as('periodic-in-file')
  }
}, {
  grid: makeGridDriver()
});*/