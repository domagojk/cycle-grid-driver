import xs from 'xstream';
import { Grid } from './grid';
import { sinkFactory } from './sinkFactory';

function gridDriver(grid, componentOutput$) {

  componentOutput$.addListener({
    next: streams => {
      if (!Array.isArray(streams))
        throw new Error('Unsupported stream sent to grid')

      for (let stream$ of streams) {
        if (stream$.as)
          grid.registerStream(stream$);
        else
          grid.sendInMain$(stream$);
      }
    },
    error: () => { },
    complete: () => { },
  });

  return {
    get: grid.get,
    mainStream: grid.mainStream,
    send: sinkFactory({
      main: { functionName: 'send', methodName: 'with' },
      link: { functionName: 'register', methodName: 'as' }
    }),
    register: sinkFactory({
      main: { functionName: 'register', methodName: 'as' },
      link: { functionName: 'send', methodName: 'with' }
    })
  }
};

let grids = {};
export function makeGridDriver(id = 'default') {
  
  if (!grids[id])
    grids[id] = Grid();

  return gridDriver.bind(gridDriver, grids[id]);
}