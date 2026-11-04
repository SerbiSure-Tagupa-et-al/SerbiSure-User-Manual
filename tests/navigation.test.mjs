// tests/navigation.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, formatHash, resolveNavigation, getAdjacentSteps } from '../src/navigation.js';

test('parseHash correctly handles various hash formats', () => {
  assert.deepEqual(parseHash(''), { role: null, module: null, step: null });
  assert.deepEqual(parseHash('#/'), { role: null, module: null, step: null });
  assert.deepEqual(parseHash('#/homeowner'), { role: 'homeowner', module: null, step: null });
  assert.deepEqual(parseHash('#/homeowner/01-registration'), { role: 'homeowner', module: '01-registration', step: null });
  assert.deepEqual(parseHash('#/homeowner/01-registration/3'), { role: 'homeowner', module: '01-registration', step: 3 });
  assert.deepEqual(parseHash('#/KASAMBAHAY/02-LOGIN/10'), { role: 'kasambahay', module: '02-LOGIN', step: 10 });
});

test('formatHash generates clean deep links', () => {
  assert.equal(formatHash('homeowner', '01-registration', 2), '#/homeowner/01-registration/2');
  assert.equal(formatHash('kasambahay', '02-login', 1), '#/kasambahay/02-login/1');
});

test('resolveNavigation falls back safely when target is invalid', () => {
  const dummyRoles = {
    homeowner: {
      id: 'homeowner',
      modules: [
        {
          id: '01-reg',
          folder: '01-reg',
          steps: [
            { number: 1, title: 'Step 1' },
            { number: 2, title: 'Step 2' }
          ]
        }
      ]
    }
  };

  // Valid target
  const valid = resolveNavigation(dummyRoles, 'homeowner', '01-reg', 2);
  assert.equal(valid.isFallback, false);
  assert.equal(valid.role, 'homeowner');
  assert.equal(valid.module, '01-reg');
  assert.equal(valid.stepNumber, 2);

  // Invalid role -> falls back to homeowner, 01-reg, 1
  const invalidRole = resolveNavigation(dummyRoles, 'superman', '01-reg', 2);
  assert.equal(invalidRole.isFallback, true);
  assert.equal(invalidRole.role, 'homeowner');
  assert.equal(invalidRole.stepNumber, 1);

  // Invalid module -> falls back to first module
  const invalidMod = resolveNavigation(dummyRoles, 'homeowner', 'nonexistent', 2);
  assert.equal(invalidMod.isFallback, true);
  assert.equal(invalidMod.module, '01-reg');
  assert.equal(invalidMod.stepNumber, 1);

  // Invalid step number -> falls back to first step
  const invalidStep = resolveNavigation(dummyRoles, 'homeowner', '01-reg', 999);
  assert.equal(invalidStep.isFallback, true);
  assert.equal(invalidStep.stepNumber, 1);
});

test('getAdjacentSteps keeps navigation within boundaries', () => {
  const steps = [
    { number: 1, title: 'First' },
    { number: 3, title: 'Second' },
    { number: 5, title: 'Third' }
  ];

  const firstAdj = getAdjacentSteps(steps, 1);
  assert.equal(firstAdj.prev, null);
  assert.equal(firstAdj.next.number, 3);

  const midAdj = getAdjacentSteps(steps, 3);
  assert.equal(midAdj.prev.number, 1);
  assert.equal(midAdj.next.number, 5);

  const lastAdj = getAdjacentSteps(steps, 5);
  assert.equal(lastAdj.prev.number, 3);
  assert.equal(lastAdj.next, null);

  // Single step module boundary check
  const singleStep = [{ number: 1, title: 'Only' }];
  const singleAdj = getAdjacentSteps(singleStep, 1);
  assert.equal(singleAdj.prev, null);
  assert.equal(singleAdj.next, null);

  // Non-existent step in module
  const missingAdj = getAdjacentSteps(steps, 999);
  assert.equal(missingAdj.prev, null);
  assert.equal(missingAdj.next, null);
});

test('parseHash safely handles malformed, path traversal, or special characters', () => {
  assert.deepEqual(parseHash('#/../../../etc/passwd'), { role: '..', module: '..', step: null });
  assert.deepEqual(parseHash('#/%20/invalid'), { role: '%20', module: 'invalid', step: null });
  assert.deepEqual(parseHash('#/homeowner/01-mod/-5'), { role: 'homeowner', module: '01-mod', step: null });
  assert.deepEqual(parseHash('#/homeowner/01-mod/NaN'), { role: 'homeowner', module: '01-mod', step: null });
  assert.deepEqual(parseHash('#/homeowner/01-mod/0'), { role: 'homeowner', module: '01-mod', step: null });
});


