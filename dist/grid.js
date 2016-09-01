'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Grid = Grid;

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

var _concat = require('xstream/extra/concat');

var _concat2 = _interopRequireDefault(_concat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Grid() {

  var pushToGrid = function pushToGrid() {};
  var registeredStreams = {};
  var mainStreamHistory = [];

  var main$$ = _xstream2.default.create({
    start: function start(listener) {
      pushToGrid = function pushToGrid(stream$) {
        listener.next(stream$);
      };
    },
    stop: function stop() {}
  });

  var get = function get(id) {
    if (registeredStreams[id]) return registeredStreams[id];

    registeredStreams[id] = _xstream2.default.create();
    registeredStreams[id].proxy = true;

    return registeredStreams[id];
  };

  var mainStream = function mainStream() {
    return (0, _concat2.default)(_xstream2.default.fromArray(mainStreamHistory), main$$);
  };

  var registerStream = function registerStream(stream$) {
    if (registeredStreams[stream$.as]) {
      if (!registeredStreams[stream$.as].proxy) {
        throw new Error('stream with id ' + stream$.as + ' is already registered in grid');
      }
      registeredStreams[stream$.as].imitate(stream$);
      delete registeredStreams[stream$.as].proxy;
    } else {
      registeredStreams[stream$.as] = stream$;
    }

    delete stream$.as;
  };

  var sendInMain$ = function sendInMain$(stream$) {
    pushToGrid(stream$);
    mainStreamHistory.push(stream$);
  };

  return {
    get: get,
    mainStream: mainStream,
    registerStream: registerStream,
    sendInMain$: sendInMain$
  };
}