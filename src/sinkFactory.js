import xs from 'xstream';

export function sinkFactory(params) {

  return (wrapped, stream$) => {
    if (!stream$ && wrapped) {
      stream$ = wrapped;
      wrapped = [];
    }

    if (!wrapped)
      wrapped = [];

    wrapped[params.main.methodName] = function (data) {
      delete wrapped[params.main.methodName];
      stream$[params.main.methodName] = data;
      wrapped.push(stream$);

      var wrapped$ = xs.of(wrapped);
      wrapped$[params.main.functionName] = sinkFactory(params).bind(this, wrapped);
      wrapped$[params.link.methodName] = sinkFactory({
        main: params.link,
        link: params.main
      }).bind(this, wrapped);

      return wrapped$;
    }

    return wrapped;
  }
}