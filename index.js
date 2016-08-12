'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var collection = new Map(); // collection of all streams in grid

const gridDriver = function(componentOutput$, runStreamAdapter) {

  componentOutput$.addListener({
    next: output => {
      if (!output.name)
        throw new Error('gridDriver: Missing name property');
        
      if (!output.stream)
        throw new Error('gridDriver: Missing stream property');

      if (collection.has(output.name)) {
        if(collection.get(output.name).proxy) {
          // stream already exists in collection, imitate output.stream on it
          collection.get(output.name).imitate(output.stream);
          delete collection.get(output.name).proxy;
        } else {
          throw new Error('stream ' + output.name + ' has already been registered')
        }
      } else {  
        // stream added to collecltion
        collection.set(output.name, output.stream);
      }
    },
    error: () => {},
    complete: () => {},
  });

  const getStream = function(name) {
    if (collection.has(name)) {
      // if found, return stream from collection
      return collection.get(name);
    }
    
    // not found, creating empty
    let stream$ = runStreamAdapter.makeSubject().stream;
    stream$.proxy = true;
    collection.set(name, stream$);
    return stream$;
  };

  return {
    getStream: getStream
  }
};

exports.default = gridDriver;
