'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gridDriver = gridDriver;
exports.sinkFactory = sinkFactory;

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function gridDriver(grid, componentOutput$, streamAdapter) {

  componentOutput$.addListener({
    next: function next(streams) {
      if (!Array.isArray(streams)) throw new Error('Unsupported stream sent to grid');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = streams[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var stream$ = _step.value;

          if (stream$ && streamAdapter.isValidStream(stream$)) {
            if (stream$.as) grid.registerStream(stream$);else grid.sendInMain$(stream$);
          } else {
            throw new Error('Unsupported stream sent to grid');
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    },
    error: function error() {},
    complete: function complete() {}
  });

  return {
    select: grid.select.bind(grid),
    getMain$$: grid.getMain$$.bind(grid),
    send: sinkFactory({
      main: { functionName: 'send', methodName: 'with' },
      link: { functionName: 'register', methodName: 'as' }
    }),
    register: sinkFactory({
      main: { functionName: 'register', methodName: 'as' },
      link: { functionName: 'send', methodName: 'with' }
    })
  };
};

function sinkFactory(params) {

  return function (wrapped, stream$) {
    if (!stream$ && wrapped) {
      stream$ = wrapped;
      wrapped = [];
    }

    if (!wrapped) wrapped = [];

    wrapped[params.main.methodName] = function (data) {
      delete wrapped[params.main.methodName];
      stream$[params.main.methodName] = data;
      wrapped.push(stream$);

      var wrapped$ = _xstream2.default.of(wrapped);
      wrapped$[params.main.functionName] = sinkFactory(params).bind(this, wrapped);
      wrapped$[params.link.methodName] = sinkFactory({
        main: params.link,
        link: params.main
      }).bind(this, wrapped);

      return wrapped$;
    };

    return wrapped;
  };
}