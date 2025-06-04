const now = Date.now();
const debugMode = true;
const testObj = { alpha: 'duplicate' };
const testDate1 = new Date();
const testDate2 = new Date(testDate1.valueOf() + 10);
const mockId = id => {
  let _id = {};
  Object.defineProperty(_id, 'toString', {
    value: _ => {
      return id.toString();
    },
    enumerable: false
  });
  return _id;
};

const testCases = [
  {
    title: 'Empty objects - no deltas',
    obj1: {},
    obj2: {},
    deltas: false,
    useSimplifier: false
  },
  {
    title: 'Identical simple objects - no deltas',
    obj1: { alpha: 'alpha', beta: true, delta: 1, gamma: now },
    obj2: { alpha: 'alpha', beta: true, delta: 1, gamma: now },
    deltas: false,
    useSimplifier: false
  },
  {
    title: 'Different simple objects (1)',
    obj1: { alpha: 'alpha' },
    obj2: { alpha: 'alpha2' },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Different simple objects (2)',
    obj1: { alpha: 'alpha', beta: true, delta: 1, gamma: Date.now() },
    obj2: { alpha: 'alpha2', beta: false, delta: 2, gamma: now },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Missing "beta" property from obj2',
    obj1: { alpha: 'alpha', beta: 'beta' },
    obj2: { alpha: 'alpha' },
    deltas: debugMode,
    useSimplifier: false
  },
  {
    title: 'Missing "beta" property from obj1',
    obj1: { alpha: 'alpha' },
    obj2: { alpha: 'alpha', beta: 'beta' },
    deltas: debugMode,
    useSimplifier: false
  },
  {
    title: 'Duplicate objects - no deltas',
    obj1: testObj,
    obj2: testObj,
    deltas: false,
    useSimplifier: false
  },
  {
    title: 'Nested objects with no deltas',
    obj1: { alpha: { beta: 'beta1', delta: 1, gamma: true } },
    obj2: { alpha: { beta: 'beta1', delta: 1, gamma: true } },
    deltas: false,
    useSimplifier: false
  },
  {
    title: 'Nested objects with deltas',
    obj1: { alpha: { beta: 'beta1', delta: 1 } },
    obj2: { alpha: { beta: 'beta2', gamma: true } },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Null property test 1',
    obj1: { alpha: { beta: null, delta: 1 } },
    obj2: { alpha: { beta: 'beta2', gamma: true } },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Null property test 2',
    obj1: { alpha: { beta: 'beta1', delta: 1 } },
    obj2: { alpha: { beta: null, gamma: true } },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array property (objects) - no deltas',
    obj1: { list: [testObj] },
    obj2: { list: [testObj] },
    deltas: debugMode,
    useSimplifier: false
  },
  {
    title: 'Array property (objects) - with deltas (mismatch)',
    obj1: { list: [testObj] },
    obj2: { list: [{}] },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array property (objects) - with deltas (removed)',
    obj1: { list: [testObj, {}, { alpha: 'missing' }] },
    obj2: { list: [{}] },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array property (objects) - with deltas (added)',
    obj1: { list: [{}] },
    obj2: { list: [testObj, {}, { alpha: 'missing' }] },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array property (strings) - no deltas',
    obj1: { list: ['alpha', 'beta'] },
    obj2: { list: ['alpha', 'beta'] },
    deltas: debugMode,
    useSimplifier: false
  },
  {
    title: 'Array property (strings) - with deltas (removals)',
    obj1: { list: ['alpha', 'beta', 'gamma', 'theta', 'delta'] },
    obj2: { list: ['alpha', 'delta', 'beta'] },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array property (strings) - with deltas (additions)',
    obj1: { list: ['alpha', 'delta', 'theta'] },
    obj2: { list: ['alpha', 'beta', 'delta', 'gamma', 'theta'] },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array property (strings) - without deltas when excluded',
    obj1: { zeta: 'exclude1' },
    obj2: { zeta: 'exclude2' },
    deltas: false,
    useSimplifier: false
  },
  {
    title: 'Array of non-matching objects',
    obj1: {
      list: [
        { id: 1234, payload: { alpha: 'ALPHA' } },
        { id: 1235, payload: { alpha: 'ALPHA' } },
        { id: 1236, payload: { alpha: 'ECHO' } }
      ]
    },
    obj2: {
      list: [
        { id: 1234, payload: { alpha: 'ALPHA' } },
        { id: 1235, payload: { alpha: 'BETA' } },
        { id: 1237, payload: { alpha: 'DELTA' } },
        { id: 1238, payload: { alpha: 'ECHO' } }
      ]
    },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array of objects with array of object properties',
    obj1: {
      list: [
        { id: 1234, payload: [{ alpha: [{ beta: 'GAMMA' }] }] },
        { id: 1235, payload: [{ alpha: [{ beta: 'GAMMA' }] }] },
        { id: 1236, payload: [{ alpha: [{ beta: 'GAMMA' }] }] },
        { id: 1237, payload: [{ alpha: [{ beta: 'GAMMA' }] }] }
      ]
    },
    obj2: {
      list: [
        { id: 1234, payload: [{ alpha: [{ beta: 'GAMMA' }] }] },
        { id: 1235, payload: [{ beta: [{ beta: 'GAMMA' }] }] },
        { id: 1236, payload: [{ alpha: [{ delta: 'GAMMA' }] }] },
        { id: 1238, payload: [{ alpha: [{ beta: 'GAMMA' }] }] }
      ]
    },
    deltas: true,
    useSimplifier: false
  },
  {
    title: 'Array of objects with array of object properties with _id objects',
    obj1: {
      list: [
        {
          _id: mockId(1234),
          payload: [
            { _id: mockId(0), alpha: [{ _id: mockId(0), beta: 'GAMMA' }] }
          ]
        },
        {
          _id: mockId(1235),
          payload: [
            { _id: mockId(0), alpha: [{ _id: mockId(0), beta: 'GAMMA' }] }
          ]
        },
        {
          _id: mockId(1236),
          payload: [
            { _id: mockId(0), alpha: [{ _id: mockId(0), beta: 'GAMMA' }] }
          ]
        },
        {
          _id: mockId(1237),
          payload: [
            { _id: mockId(0), alpha: [{ _id: mockId(0), beta: 'GAMMA' }] }
          ]
        }
      ]
    },
    obj2: {
      list: [
        {
          _id: mockId(1234),
          payload: [
            { _id: mockId(0), alpha: [{ _id: mockId(0), beta: 'GAMMA' }] }
          ]
        },
        {
          _id: mockId(1235),
          payload: [
            { _id: mockId(0), beta: [{ _id: mockId(0), beta: 'GAMMA' }] }
          ]
        },
        {
          _id: mockId(1236),
          payload: [
            { _id: mockId(0), alpha: [{ _id: mockId(0), delta: 'GAMMA' }] }
          ]
        },
        {
          _id: mockId(1238),
          payload: [
            { _id: mockId(0), alpha: [{ _id: mockId(0), beta: 'GAMMA' }] }
          ]
        }
      ]
    },
    deltas: true,
    useSimplifier: true
  },
  {
    title: 'Date comparison - matching',
    obj1: { theta: testDate1 },
    obj2: { theta: testDate1 },
    deltas: false,
    useSimplifier: false
  },
  {
    title: 'Date comparison - mis-matching',
    obj1: { theta: testDate1 },
    obj2: { theta: testDate2 },
    deltas: true,
    useSimplifier: false
  }
];

(_ => {
  console.clear();

  // console.log(`mockId`, mockId(7777));
  // console.log(`mockId`, JSON.stringify(mockId(7777)));
  // const mockIdValue = mockId(7777).toString();
  // console.log(`mockId`, mockIdValue);
  // console.log(`mockId`, typeof mockIdValue);

  let overall = true;

  const arrayItemSimplifierBy_id = srcObj => srcObj._id.toString();

  testCases.forEach(({ title, obj1, obj2, deltas, useSimplifier }, idx) => {
    console.info(`\n${idx + 1}) ${title}`);
    const applySimplifier = useSimplifier
      ? arrayItemSimplifierBy_id
      : undefined;

    const results = objectDeltas(obj1, obj2, undefined, {
      debugMode,
      exclusions: ['zeta'],
      arrayItemSimplifier: applySimplifier
    });

    results.length && console.table(results);
    if (deltas) {
      if (results.length) {
        console.info('PASS(pos)');
      } else {
        console.info('FAIL(pos)');
        overall = false;
      }
    } else {
      if (results.length) {
        console.info('FAIL(neg)');
        overall = false;
      } else {
        console.info('PASS(neg)');
      }
    }
  });
  console.log('Overall:', overall ? 'PASS' : 'FAIL');
})();
