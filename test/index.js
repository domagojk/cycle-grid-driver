import {makeGridDriver} from '../src/index.js';
import {expect} from 'chai';
import xs from 'xstream';
import {run} from '@cycle/xstream-run';
import flattenConcurrently from 'xstream/extra/flattenConcurrently'


describe('Grid', () => {

  it('should call complete', done => {

    let drivers = { grid: makeGridDriver("call-complete") };

    let listener = {
      next: (x) => {
      },
      error: (err) => done(err),
      complete: () => done(),
    };

    run(function ({grid}) {
      const stream = xs.periodic(10).take(1);
      return {
        grid: grid.register(stream).as('completeable')
      }
    }, drivers);

    run(function ({grid}) {
      grid.get('completeable').addListener(listener);
      return {}
    }, drivers);

  });
  
  it('should register and listen to stream', done => {

    let drivers = { grid: makeGridDriver("reg-and-listen") };
    var expected = [0, 1, 2];
    let listener = {
      next: (x) => {
        expect(x).to.equal(expected.shift());
      },
      error: (err) => done(err),
      complete: () => {
        expect(expected.length).to.equal(0)
        done()
      },
    };

    const stream = xs.periodic(100).take(3);
    
    run(function ({grid}) {
      const stream = xs.periodic(100).take(3);
      return {
        grid: grid.register(stream).as('periodic')
      }
    }, drivers);

    setTimeout(() => {
      run(function ({grid}) {
        grid.get('periodic').addListener(listener);
        return {}
      }, drivers);
    }, 200)
    
  });

  it('should register and listen to stream (listener first)', done => {

    let drivers = { grid: makeGridDriver("first-listener") };
    var expected = [0, 1, 2];

    let listener = {
      next: (x) => {
        expect(x).to.equal(expected.shift());
      },
      error: (err) => done(err),
      complete: () => {
        expect(expected.length).to.equal(0);
        done()
      },
    };

    run(function ({grid}) {
      grid.get('periodic').addListener(listener);
      return {}
    }, drivers);

    run(function ({grid}) {
      const stream = xs.periodic(100).take(3);
      return {
        grid: grid.register(stream).as('periodic')
      }
    }, drivers);

    
  });

  it('should throw an error when using same id', done => {

    let drivers = { grid: makeGridDriver("throwError") };
    
    run(function ({grid}) {
      const stream = xs.periodic(100);
      return {
        grid: grid.register(stream).as('periodic')
      }
    }, drivers)

    expect(function () {
      run(function ({grid}) {
        const stream = xs.periodic(100);
        return {
          grid: grid.register(stream).as('periodic')
        }
      }, drivers)
    }).to.throw('stream with id periodic is already registered in grid');

    done();
  });

  it('combine multiple streams', done => {
    let drivers = { grid: makeGridDriver("send-with") };
    let expected = [0, 0, 1, 1, 2, 2, 3, 3];

    run(function ({grid}) {
      const stream = xs.periodic(10).take(4);
      const stream2 = xs.periodic(10).take(4);

      return {
        grid: grid
          .send(stream).with({ group: 'tocombine' })
          .send(stream2).with({ group: 'tocombine' })
      }
    }, drivers);
    
    run(function ({grid}) {
      var combined$ = grid.mainStream()
        .filter(stream => stream.with.group == "tocombine")
        .compose(flattenConcurrently);

      combined$.addListener({
        next: (x) => {
          expect(x).to.equal(expected.shift());
        },
        error: (err) => { },
        complete: () => {},
      });
      return {}
    }, drivers);

    setTimeout( () => {
      expect(expected.length).to.equal(0);
      done();
    }, 100)
  })

});