import xs from 'xstream';
import concat from 'xstream/extra/concat';

export function Grid() {

  this.main$$ = xs.create({
    start: listener => {
      this.pushToGrid = stream$ => {
        listener.next(stream$)
      }
    },
    stop: () => { }
  });
  this.pushToGrid = () => { };
  this.registeredStreams = {};
  this.mainStreamHistory = [];

  const get = (id) => {
    if (this.registeredStreams[id])
      return this.registeredStreams[id];

    this.registeredStreams[id] = xs.create();
    this.registeredStreams[id].proxy = true;

    return this.registeredStreams[id];
  }

  const mainStream = () => {
    return concat(xs.fromArray(this.mainStreamHistory), this.main$$);
  }

  const registerStream = (stream$) => {
    if (this.registeredStreams[stream$.as]) {
      if (!this.registeredStreams[stream$.as].proxy) {
        throw new Error('stream with id ' + stream$.as + ' is already registered in grid')
      }
      this.registeredStreams[stream$.as].imitate(stream$);
      delete this.registeredStreams[stream$.as].proxy;
    } else {
      this.registeredStreams[stream$.as] = stream$;
    }

    delete stream$.as;
  }

  const sendInMain$ = (stream$) => {
    this.pushToGrid(stream$);
    this.mainStreamHistory.push(stream$);
  }

  return {
    get,
    mainStream,
    registerStream,
    sendInMain$
  }
}