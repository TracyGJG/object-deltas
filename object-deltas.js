/** @type{{[key: string]: string}} */
const STRING_LITERALS = {
  Different: 'Different',
  ObjectType: 'object',
  PropertyAdded: 'Property added',
  PropertyAddedPrimitive: 'Property added - Primitive',
  PropertyAddedObject: 'Property added - Object',
  PropertyAddedArray: 'Property added - Array',
  PrimitiveArray: 'Array of Primitives',
  ObjectArray: 'Array of Objects',
  MessageMissingObjectOne: 'Missing from object One',
  MessageMissingObjectTwo: 'Missing from object Two',
  MessageDifferentValues: 'Different values',
  MessageDifferentDates: 'Different dates',
  MessageDifferentValueAtIndex: 'Different Values at index',
  MessageMissingFromArrayOne: 'Missing value from array One',
  MessageMissingFromArrayTwo: 'Missing value from array Two',
};

/**
 * @typedef {(srcObj: {}) => string} iArraySimplifier
 * @typedef {{ debugMode: boolean, exclusions: string[], arrayItemSimplifier?: iArraySimplifier }} iOptions
 * @typedef {{ propName: string, info: string, obj1Val: any, obj2Val: any }} iDeltaLogEntry */
 /**
 * objectDeltas - Compares primary and secondary objects at the primitive, sub-object and array levels and reports and array of differences (deltas.)
 * @param {{}} obj1 - primary (object) operand
 * @param {{}} obj2 - secondary (object) operand
 * @param {string} basePropName - property fully-qualified name prefix
 * @param {iOptions} options - Optional parameters for the function
 * @return {Array.<iDeltaLogEntry>} - Array of Deltas
 */
function objectDeltas(
  obj1,
  obj2,
  basePropName = '',
  options
) {
  /** @type {iOptions} */
  const { debugMode, exclusions, arrayItemSimplifier } = { debugMode: true, exclusions: [], arrayItemSimplifier: undefined, ...options};
  /** @type{Array.<iDeltaLogEntry>} */
  const deltas = []; // Collated list of deltas.
  /**
   * addDelta - Helper function to add deltas to the list.
   * @param {string} propName
   * @param {string} info
   * @param {any} [obj1Val]
   * @param {any} [obj2Val]
   * @return number - Unused
   */
  const addDelta = (propName, info, obj1Val = '-', obj2Val = '-') => {
    if (debugMode || info.startsWith(STRING_LITERALS.Different) || info.startsWith(STRING_LITERALS.PropertyAdded)) {
      deltas.push({
        propName,
        info,
        obj1Val,
        obj2Val
      });
    }
  }

  /** @type iArraySimplifier */
  const applicableArrayItemSimplifier =
    arrayItemSimplifier || defaultArrayItemSimplifier;

  /** Helper functions */
  const trueObjectTest = arrItem =>
    arrItem !== null &&
    !Array.isArray(arrItem) &&
    typeof arrItem === STRING_LITERALS.ObjectType;
  const truePrimitiveTest = arrItem =>
    arrItem !== null &&
    !Array.isArray(arrItem) &&
    typeof arrItem !== STRING_LITERALS.ObjectType;

  /**
   * processArray - Analise each item in arrays from both objects, comparing their properties.
   * @param {string} arrayName
   * @param {[any]} arr1
   * @param {[any]} arr2
   * @return void
   */
  const processArray = (arrayName, arr1, arr2) => {
    // Check for sub-arrays
    if (
      (arr1.length && trueObjectTest(arr1[0])) ||
      (arr2.length && trueObjectTest(arr2[0]))
    ) {
      addDelta(arrayName, STRING_LITERALS.ObjectArray, arr1.length, arr2.length);
      arr1.forEach((item, idx) => {
        const simplifiesArr1ObjString = applicableArrayItemSimplifier(item);
        const matchingItemFromArr2Obj = arr2.find(
          _ => applicableArrayItemSimplifier(_) === simplifiesArr1ObjString
        );
        console.log(`Simplified Obj1: ${simplifiesArr1ObjString}; Matching in 2: ${matchingItemFromArr2Obj}`)
        if (matchingItemFromArr2Obj) {
          deltas.push(
            ...objectDeltas(
              item,
              matchingItemFromArr2Obj,
              `${arrayName}[${idx}].`,
              options
            )
          );
        }
        else {
          addDelta(
            `${arrayName}[${idx}]`,
            STRING_LITERALS.MessageMissingFromArrayTwo,
            JSON.stringify(item),
            undefined
          );
        }
      });
      arr2.forEach((item, idx) => {
        const simplifiesArr2ObjString = applicableArrayItemSimplifier(item);
        const matchingItemFromArr1Obj = arr1.find(
          _ => applicableArrayItemSimplifier(_) === simplifiesArr2ObjString
        );
        if (!matchingItemFromArr1Obj) {
          addDelta(
            `${arrayName}[${idx}]`,
            STRING_LITERALS.MessageMissingFromArrayOne,
            undefined,
            JSON.stringify(item)
          );
        }
      });
    } else if (
      (arr1.length && truePrimitiveTest(arr1[0])) ||
      (arr2.length && truePrimitiveTest(arr2[0]))
    ) {
      addDelta(arrayName, STRING_LITERALS.PrimitiveArray, arr1.length, arr2.length); // Or both are empty.
      // Check values in array 1
      arr1.forEach((item, idx) => {
        if (item !== arr2[idx]) {
          // Compare values at same index
          addDelta(
            `${arrayName}[${idx}]`,
            STRING_LITERALS.MessageDifferentValueAtIndex,
            item,
            arr2[idx]
          );
          if (!arr2.includes(item)) {
            addDelta(
              `${arrayName}[${idx}]`,
              STRING_LITERALS.MessageMissingFromArrayTwo,
              item,
              undefined
            );
          }
        }
      });
      // Check extra values in array 2
      arr2.forEach((item, idx) => {
        const arr1Len = arr1.length;
        if (idx >= arr1Len) {
          addDelta(
            `${arrayName}[${idx}]`,
            STRING_LITERALS.MessageDifferentValueAtIndex,
            undefined,
            item
          );
        }
        if (!arr1.includes(item)) {
          addDelta(
            `${arrayName}[${idx}]`,
            STRING_LITERALS.MessageMissingFromArrayOne,
            undefined,
            item
          );
        }
      });
    }
  };

  // Process properties in Object 1, by key (property name.)
  Object.keys(obj1).forEach(key => {
    if (!exclusions.includes(key)) {
      if (!obj2.hasOwnProperty(key)) {
        // Key from Object 1 not found in Object 2.
        addDelta(`${basePropName}${key}`, STRING_LITERALS.MessageMissingObjectTwo, obj1[key]);
      } else if (Array.isArray(obj1[key])) {
        // Compare array properties using dedicated function.
        processArray(`${basePropName}${key}`, obj1[key], obj2[key]);
      } else if (obj1[key] instanceof Date) {
        // console.warn(`Date Comparison: ${obj1[key].valueOf() - obj2[key].valueOf()}`);
        if (obj1[key].valueOf() !== obj2[key].valueOf()) {
          // Compare date values.
          addDelta(
            `${basePropName}${key}`,
            STRING_LITERALS.MessageDifferentDates,
            obj1[key],
            obj2[key]
          );
        }
      } else if (
        obj1[key] !== null &&
        typeof obj1[key] === STRING_LITERALS.ObjectType
      ) {
        // Compare object properties through recursion.
        deltas.push(
          ...objectDeltas(
            obj1[key],
            obj2[key],
            `${basePropName}${key}.`,
            options
          )
        );
      } else if (obj1[key] !== obj2[key]) {
        // Compare property values.
        addDelta(
          `${basePropName}${key}`,
          STRING_LITERALS.MessageDifferentValues,
          obj1[key],
          obj2[key]
        );
      }
    }
  });

  // Check Object 2 for keys not present in Object 1.
  Object.keys(obj2).forEach(key => {
    if (!exclusions.includes(key)) {
      if (!obj1.hasOwnProperty(key)) {
        if (truePrimitiveTest(obj2[key])) {
          addDelta(`${basePropName}${key}`, STRING_LITERALS.PropertyAddedPrimitive, 'undefined', obj2[key]);
        }
        else if (trueObjectTest(obj2[key])) {
          addDelta(`${basePropName}${key}`, STRING_LITERALS.PropertyAddedObject, 'undefined', JSON.stringify(obj2[key]));
        }
        else {
          addDelta(`${basePropName}${key}`, STRING_LITERALS.PropertyAddedArray, 'undefined', JSON.stringify(obj2[key]));
        }
      }
    }
  });

  return deltas;
}

/** @type iArraySimplifier */
/**
 * defaultArrayItemSimplifier - Extract root-level primitive properties
 * @param {{}} srcObj
 * @return string
 */
function defaultArrayItemSimplifier(srcObj) {
  let tgtObj = {};
  Object.keys(srcObj).sort().forEach(key => {
    if (
      !Array.isArray(srcObj[key]) &&
      (srcObj[key] === null ||
        typeof srcObj[key] !== STRING_LITERALS.ObjectType)
    ) {
      tgtObj[key] = srcObj[key];
    }
  });
  return JSON.stringify(tgtObj);
};

objectDeltas([], {});
