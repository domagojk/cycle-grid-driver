[![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url]

# Cycle Grid

A driver providing "grid" for communcation between multiple "main cycle" components keeping them loosely coupled accross 
the application. Designed for creating an arhitecture (primarily for large-scale apps) where components 
could be separated to work “in parallel” rather than using them as children of a single main function.

This grid can be used as an API (in form of streams) for all "main cycle" components inside the application. 


## Why would I do that?

The idea of this concept is not to remove all parent-child relationships inside one cycle component, but if a child 
is not essential for parent to function and could be reused or removed it should then separated as a "indepented cycle" 

For more info on the concept, check: [Creating a Scalable JavaScript Application with Cycle.js](https://medium.com/@domagojk/creating-a-scalable-javascript-application-with-cycle-js-589f4d4020a5#.ucoin75ee)

and bear in mind that this is primarily designed for creating large-scale applications.

## Installation

```
npm install cycle-grid-driver
```

## Usage

Basics:

```js
import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import {makeGridDriver} from 'cycle-grid-driver';

function main({ grid }) {
  // using stream "state" from grid
  const state$ = grid.get('state');

  // ... (magic occurs)
  const actions$ = somehow(); 

  return {
    grid: grid.send(actions$).with({ type: 'actions' })
      // .send(somethingElse$).with({type: 'something'})
      // .send(anotherOne$).with({label: 'another'})
  }
}

const drivers = {
  grid: makeGridDriver()
}

run(main, drivers);
```

As you can see, you can use grid to send or recieve streams.
Suppose then, there are multiple components sending ```actions$``` (labeling it using "with" object) 
from which we need to create ```state$```

```js
import xs from 'xstream';
import flattenConcurrently from 'xstream/extra/flattenConcurrently';
import {run} from '@cycle/xstream-run';
import {makeGridDriver} from 'cycle-grid-driver';

function main({ grid }) {
  // using grids "stream of streams"
  const allActions$ = grid.mainStream()
    .filter(stream => stream.with.group == 'actions')
    .compose(flattenConcurrently);

  const initialData$ = grid.mainStream()
    .filter(stream => stream.with.localStorage == true)
    .compose(flattenConcurrently);

  // ... (magic occurs)
  const state$ = somehowFrom(allActions$, initialData$); 

  return {
    grid: grid.register(state$).as('state')
      // .register(magicStream$).as('magic')
      // .send(sendAsWell$).with({ label: 'me'})
  }
}

const drivers = {
  grid: makeGridDriver()
}

run(main, drivers);
```

## Multiple grid drivers

If for some reason you need to separate your streams in different grids you can do that by creating multiple grid instances. 
makeGridDriver() is equivalent to makeGridDriver('default') and it returns a 'default' grid instance so for creating another one just use a different id.

# API

- `makeGridDriver` *(String)*: This is a function which, when called, returns a Grid Driver for Cycle.js
apps. The driver is also a function, and it takes `id` as input, and outputs an Grid instance
- `grid.get` *(String)*: returns a stream registered as `id` (if stream is not created when called proxy which will imitate future stream will be returned)
- `grid.mainStream`: returns a main grid stream (of streams) which are sent using `grid.send`. Returned stream also contains all streams that may be sent before calling this function (so it is not required to subscribe on main stream before sending anything from other components)
- `grid.send` *(Stream)*: used to send stream in grids main stream, returns object that contains `with` function for labeling your streams 
- `grid.register` *(Stream)*: used to register stream in grid (but it is not in main stream), returns object that contains `as` function for assigning stream id

[downloads-image]: http://img.shields.io/npm/dm/cycle-grid-driver.svg
[npm-url]: https://npmjs.org/package/cycle-grid-driver
[npm-image]: http://img.shields.io/npm/v/cycle-grid-driver.svg
