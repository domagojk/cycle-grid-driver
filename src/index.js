import xs from 'xstream';

const grid = {
  // main grid stream
  main$: xs.create({
    start: listener => {
      grid.pushToGrid = data => {
        listener.next(data)
      }
    },
    stop: () => {
      grid.pushToGrid = function () { };
    }
  }),
  // used to push data in main$
  pushToGrid: function () { },
  // all streams added to main$
  streams: []
}

export default function (componentOutput$, streamAdapter) {
  componentOutput$.addListener({
    next: allWrappedStreams => {
      if (!Array.isArray(allWrappedStreams))
        throw new Error('Unsupported stream sent to grid')

      for ([stream$, meta] of allWrappedStreams) {
        if (stream$ && streamAdapter.isValidStream(stream$)) {

          grid.streams.push({ stream$, meta });
          grid.pushToGrid([stream$, meta]);
        } else {
          throw new Error('Unsupported stream sent to grid')
        }
      }
    },
    error: () => { },
    complete: () => { },
  });

  const register = (wrapped, stream$) => {
    if (!stream$ && wrapped) {
      stream$ = wrapped;
      wrapped = [];
    }

    if (!wrapped) {
      wrapped = [];
    }
    wrapped.with = function (params) {
      delete wrapped.with;
      delete wrapped.as;

      wrapped.push([stream$, params]);
      var wrapped$ = xs.of(wrapped);
      wrapped$.register = register.bind(this, wrapped);
      return wrapped$
    }
    wrapped.as = id => wrapped.with({ id: id });

    return wrapped;
  }

  const getWhere = (filter) => {
    let shouldStreamMerge = (data, filter) => {
      for (var key in filter) {
        if (filter[key] !== data[key])
          return false;
      }
      return true;
    }

    return grid.main$
      .filter(([stream$, meta]) => shouldStreamMerge(meta, filter))
      .map(() => {
        let streams = [];

        for (let i in grid.streams) {
          if (shouldStreamMerge(grid.streams[i].meta, filter)) {
            streams.push(grid.streams[i].stream$);
          }
        }
        return xs.merge(...streams);
      })
      .flatten()
  }

  return {
    getWhere: getWhere,
    get: (id) => getWhere({ id: id }),
    register: register
  }
};