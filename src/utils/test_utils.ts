/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */

/**
 * Testing utilities.
 */

// tslint:disable:max-line-length
import {memory, Tensor, test_util} from '@tensorflow/tfjs-core';
import {describeWithFlags} from '@tensorflow/tfjs-core/dist/jasmine_util';
import {disposeScalarCache} from '../backend/tfjs_backend';
import {ValueError} from '../errors';

// tslint:enable:max-line-length

/**
 * Expect values are close between an Tensor or number array.
 * @param actual
 * @param expected
 */
export function expectTensorsClose(
    actual: Tensor|number[], expected: Tensor|number[], epsilon?: number) {
  if (actual == null) {
    throw new ValueError(
        'First argument to expectTensorsClose() is not defined.');
  }
  if (expected == null) {
    throw new ValueError(
        'Second argument to expectTensorsClose() is not defined.');
  }
  test_util.expectArraysClose(actual, expected, epsilon);
}

/**
 * Expect values in array are within a specified range, boundaries inclusive.
 * @param actual
 * @param expected
 */
export function expectTensorsValuesInRange(
    actual: Tensor, low: number, high: number) {
  if (actual == null) {
    throw new ValueError(
        'First argument to expectTensorsClose() is not defined.');
  }
  test_util.expectValuesInRange(actual.dataSync(), low, high);
}


/**
 * Describe tests to be run on CPU and GPU.
 * @param testName
 * @param tests
 */
export function describeMathCPUAndGPU(testName: string, tests: () => void) {
  describeWithFlags(testName, test_util.ALL_ENVS, () => {
    beforeEach(() => {
      disposeScalarCache();
    });
    tests();
  });
}

/**
 * Describe tests to be run on CPU only.
 * @param testName
 * @param tests
 */
export function describeMathCPU(testName: string, tests: () => void) {
  describeWithFlags(testName, test_util.CPU_ENVS, () => {
    beforeEach(() => {
      disposeScalarCache();
    });
    tests();
  });
}

/**
 * Describe tests to be run on GPU only.
 * @param testName
 * @param tests
 */
export function describeMathGPU(testName: string, tests: () => void) {
  describeWithFlags(testName, test_util.WEBGL_ENVS, () => {
    beforeEach(() => {
      disposeScalarCache();
    });
    tests();
  });
}

/**
 * Check that a function only generates the expected number of new Tensors.
 *
 * The test  function is called twice, once to prime any regular constants and
 * once to ensure that additional copies aren't created/tensors aren't leaked.
 *
 * @param testFunc A fully curried (zero arg) version of the function to test.
 * @param numNewTensors The expected number of new Tensors that should exist.
 */
export function expectNoLeakedTensors(
    // tslint:disable-next-line:no-any
    testFunc: () => any, numNewTensors: number) {
  testFunc();
  const numTensorsBefore = memory().numTensors;
  testFunc();
  const numTensorsAfter = memory().numTensors;
  const actualNewTensors = numTensorsAfter - numTensorsBefore;
  if (actualNewTensors !== numNewTensors) {
    throw new ValueError(
        `Created an unexpected number of new ` +
        `Tensors.  Expected: ${numNewTensors}, created : ${
            actualNewTensors}. ` +
        `Please investigate the discrepency and/or use tidy.`);
  }
}
