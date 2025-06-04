# Function: object-deltas

## Purpose

This is a Utility function to perform a (semi-)comprehensive comparison of complex objects origination from a common source, and have a common structure.
The function copes with objects of:

- primitives
- date objects
- objects (recursively)
- arrays of primitives
- arrays of objects

It does not cope with arrays at the top level or objects of arrays of arrays.

## Parameters

- obj1: Object One
- obj2: Object Two
- basePropName: Breadcrumb of property names (default = '')
- options: Object containing additional switches:
  - debugMode: Boolean flag to indicate if more verbose information is to be reported (default = true).
    - true: Include additional details such as information regarding array properties.
    - false: Only report the actual differences between like objects.
  - exclusions: List of properties not to be compared (default = []).
  - arrayItemSimplifier: Alternative function for comparing objects in an array.

## Returns a List of deltas (an array of):

- propName: Fully qualified name of the property containing the difference.
- info: Human readable description of the difference found.
- obj1Val: Value of the property from Object One, if found.
- obj2Val: Value of the property from Object Two, if found.

## Sub-functions

- addDelta: Helper function for added details of the detected difference to the reporting array.
- defaultArrayItemsSimplifier: Default function for comparing objects in an array.
- processArray: Helper function for processing objects in array properties.
