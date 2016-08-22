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
  var _this = this;

  this.main$$ = _xstream2.default.create({
    start: function start(listener) {
      _this.pushToGrid = function (stream$) {
        listener.next(stream$);
      };
    },
    stop: function stop() {}
  });
  this.pushToGrid = function () {};
  this.registeredStreams = {};
  this.mainStreamHistory = [];

  var get = function get(id) {
    if (_this.registeredStreams[id]) return _this.registeredStreams[id];

    _this.registeredStreams[id] = _xstream2.default.create();
    _this.registeredStreams[id].proxy = true;

    return _this.registeredStreams[id];
  };

  var mainStream = function mainStream() {
    return (0, _concat2.default)(_xstream2.default.fromArray(_this.mainStreamHistory), _this.main$$);
  };

  var registerStream = function registerStream(stream$) {
    if (_this.registeredStreams[stream$.as]) {
      if (!_this.registeredStreams[stream$.as].proxy) {
        throw new Error('stream with id ' + stream$.as + ' is already registered in grid');
      }
      _this.registeredStreams[stream$.as].imitate(stream$);
      delete _this.registeredStreams[stream$.as].proxy;
    } else {
      _this.registeredStreams[stream$.as] = stream$;
    }

    delete stream$.as;
  };

  var sendInMain$ = function sendInMain$(stream$) {
    _this.pushToGrid(stream$);
    _this.mainStreamHistory.push(stream$);
  };

  return {
    get: get,
    mainStream: mainStream,
    registerStream: registerStream,
    sendInMain$: sendInMain$
  };
}