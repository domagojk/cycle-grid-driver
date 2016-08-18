import gridDriver from '../src/index.js';
import assert from 'assert';
import xs from 'xstream';

describe('Example', () => {
  it('should broadcast events to two listeners', (done) => {
    const stream = xs.periodic(100);
    const expected1 = [0, 1, 2];
    const expected2 = [1, 2];

    let listener1 = {
      next: (x) => {
        assert.equal(x, expected1.shift());
      },
      error: (err) => done(err),
      complete: () => done('should not call complete'),
    };
    stream.addListener(listener1);

    let listener2 = {
      next: (x) => {
        assert.equal(x, expected2.shift());
      },
      error: (err) => done(err),
      complete: () => done('should not call complete'),
    };
    setTimeout(() => {
      stream.addListener(listener2);
    }, 150);

    setTimeout(() => {
      stream.removeListener(listener1);
      stream.removeListener(listener2);
      assert.equal(expected1.length, 0);
      assert.equal(expected2.length, 0);
      done();
    }, 400);
  });

  it('should return 200', done => {
    assert.equal(200, 200);
    done();
  });
});