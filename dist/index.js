'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (componentOutput$, streamAdapter) {
  componentOutput$.addListener({
    next: function next(allWrappedStreams) {
      if (!Array.isArray(allWrappedStreams)) throw new Error('Unsupported stream sent to grid');

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = allWrappedStreams[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2);

          stream$ = _step$value[0];
          meta = _step$value[1];

          if (stream$ && streamAdapter.isValidStream(stream$)) {

            grid.streams.push({ stream$: stream$, meta: meta });
            grid.pushToGrid([stream$, meta]);
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

  var register = function register(wrapped, stream$) {
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
      var wrapped$ = _xstream2.default.of(wrapped);
      wrapped$.register = register.bind(this, wrapped);
      return wrapped$;
    };
    wrapped.as = function (id) {
      return wrapped.with({ id: id });
    };

    return wrapped;
  };

  var getWhere = function getWhere(filter) {
    var shouldStreamMerge = function shouldStreamMerge(data, filter) {
      for (var key in filter) {
        if (filter[key] !== data[key]) return false;
      }
      return true;
    };

    return grid.main$.filter(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var stream$ = _ref2[0];
      var meta = _ref2[1];
      return shouldStreamMerge(meta, filter);
    }).map(function () {
      var streams = [];

      for (var i in grid.streams) {
        if (shouldStreamMerge(grid.streams[i].meta, filter)) {
          streams.push(grid.streams[i].stream$);
        }
      }
      return _xstream2.default.merge.apply(_xstream2.default, streams);
    }).flatten();
  };

  return {
    getWhere: getWhere,
    get: function get(id) {
      return getWhere({ id: id });
    },
    register: register
  };
};

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var grid = {
  // main grid stream
  main$: _xstream2.default.create({
    start: function start(listener) {
      grid.pushToGrid = function (data) {
        listener.next(data);
      };
    },
    stop: function stop() {
      grid.pushToGrid = function () {};
    }
  }),
  // used to push data in main$
  pushToGrid: function pushToGrid() {},
  // all streams added to main$
  streams: []
};

;