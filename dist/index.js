'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeGridDriver = makeGridDriver;

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

var _grid = require('./grid');

var _sinkFactory = require('./sinkFactory');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function gridDriver(grid, componentOutput$) {

  componentOutput$.addListener({
    next: function next(streams) {
      if (!Array.isArray(streams)) throw new Error('Unsupported stream sent to grid');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = streams[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var stream$ = _step.value;

          if (stream$.as) grid.registerStream(stream$);else grid.sendInMain$(stream$);
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
    get: grid.get,
    mainStream: grid.mainStream,
    send: (0, _sinkFactory.sinkFactory)({
      main: { functionName: 'send', methodName: 'with' },
      link: { functionName: 'register', methodName: 'as' }
    }),
    register: (0, _sinkFactory.sinkFactory)({
      main: { functionName: 'register', methodName: 'as' },
      link: { functionName: 'send', methodName: 'with' }
    })
  };
};

var grids = {};
function makeGridDriver() {
  var id = arguments.length <= 0 || arguments[0] === undefined ? 'default' : arguments[0];


  if (!grids[id]) grids[id] = (0, _grid.Grid)();

  return gridDriver.bind(gridDriver, grids[id]);
}