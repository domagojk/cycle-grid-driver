import xs from 'xstream';
import concat from 'xstream/extra/concat';

export function Grid() {

  let pushToGrid = () => { };
  let registeredStreams = {};
  let mainStreamHistory = [];

  const main$$ = xs.create({
    start: listener => {
      pushToGrid = stream$ => {
        listener.next(stream$)
      }
    },
    stop: () => { }
  });

  const get = (id) => {
    if (registeredStreams[id])
      return registeredStreams[id];

    registeredStreams[id] = xs.create();
    registeredStreams[id].proxy = true;

    return registeredStreams[id];
  }

  const mainStream = () => {
    return concat(xs.fromArray(mainStreamHistory), main$$);
  }

  const registerStream = (stream$) => {
    if (registeredStreams[stream$.as]) {
      if (!registeredStreams[stream$.as].proxy) {
        throw new Error('stream with id ' + stream$.as + ' is already registered in grid')
      }
      registeredStreams[stream$.as].imitate(stream$);
      delete registeredStreams[stream$.as].proxy;
    } else {
      registeredStreams[stream$.as] = stream$;
    }

    delete stream$.as;
  }

  const sendInMain$ = (stream$) => {
    pushToGrid(stream$);
    mainStreamHistory.push(stream$);
  }

  return {
    get,
    mainStream,
    registerStream,
    sendInMain$
  }
}