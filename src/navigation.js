// src/navigation.js

/**
 * Parses a location hash into role, module, and step components.
 * e.g., "#/homeowner/01-registration/2" -> { role: 'homeowner', module: '01-registration', step: 2 }
 */
export function parseHash(hashStr = '') {
  const clean = hashStr.replace(/^#\/?/, '').trim();
  if (!clean) {
    return { role: null, module: null, step: null };
  }

  const parts = clean.split('/').filter(Boolean);
  const role = parts[0] ? parts[0].toLowerCase() : null;
  const moduleFolder = parts[1] || null;
  let step = null;

  if (parts[2]) {
    const parsed = parseInt(parts[2], 10);
    if (!isNaN(parsed) && parsed > 0) {
      step = parsed;
    }
  }

  return { role, module: moduleFolder, step };
}

/**
 * Formats role, module, and step into a canonical hash URL.
 */
export function formatHash(role, moduleFolder, stepNumber) {
  if (!role) return '#/';
  if (!moduleFolder) return `#/${role}`;
  if (stepNumber == null) return `#/${role}/${moduleFolder}`;
  return `#/${role}/${moduleFolder}/${stepNumber}`;
}

/**
 * Resolves requested navigation targets against loaded manual content,
 * safely falling back to first valid role, module, or step if targets do not exist.
 */
export function resolveNavigation(rolesMap, requestedRole, requestedModule, requestedStep) {
  let isFallback = false;
  let roleFellBack = false;

  // 1. Resolve role
  let roleKey = requestedRole && rolesMap[requestedRole] ? requestedRole : null;
  if (!roleKey) {
    isFallback = true;
    roleFellBack = true;
    roleKey = Object.keys(rolesMap)[0] || 'homeowner';
  }

  const roleData = rolesMap[roleKey];
  const modules = roleData ? roleData.modules : [];

  if (!modules || modules.length === 0) {
    return {
      role: roleKey,
      roleData,
      module: null,
      moduleData: null,
      step: null,
      stepNumber: null,
      isFallback
    };
  }

  // 2. Resolve module
  let moduleData = requestedModule ? modules.find(m => m.id === requestedModule || m.folder === requestedModule) : null;
  let moduleFellBack = false;
  if (!moduleData) {
    isFallback = true;
    moduleFellBack = true;
    moduleData = modules[0];
  }

  // 3. Resolve step
  const steps = moduleData.steps || [];
  if (steps.length === 0) {
    return {
      role: roleKey,
      roleData,
      module: moduleData.folder,
      moduleData,
      step: null,
      stepNumber: null,
      isFallback
    };
  }

  let step = null;
  // If neither role nor module fell back, preserve requestedStep if it exists
  if (!roleFellBack && !moduleFellBack && requestedStep != null) {
    step = steps.find(s => s.number === requestedStep);
  }

  if (!step) {
    if (requestedStep != null) isFallback = true;
    step = steps[0];
  }

  return {
    role: roleKey,
    roleData,
    module: moduleData.folder,
    moduleData,
    step,
    stepNumber: step.number,
    isFallback
  };
}

/**
 * Returns previous and next step objects within the active module.
 * Navigation stays strictly within the selected module.
 */
export function getAdjacentSteps(steps = [], currentStepNumber) {
  const currentIndex = steps.findIndex(s => s.number === currentStepNumber);
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const next = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;

  return { prev, next };
}
