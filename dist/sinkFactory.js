'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sinkFactory = sinkFactory;

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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