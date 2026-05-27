'use strict';

const acorn = require('acorn');
const walk = require('acorn-walk');

function analyzeProphecy(source, filePath) {
  const findings = [];

  let ast;
  try {
    ast = acorn.parse(source, {
      ecmaVersion: 2022,
      sourceType: 'module',
      locations: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true
    });
  } catch (e) {
    return findings;
  }

  findConfigFieldRename(ast, filePath, findings);
  findDeprecatedStatusCodes(ast, filePath, findings);
  findHardcodedPaths(ast, filePath, findings);
  findFeatureFlagRemoval(ast, filePath, findings);
  findCallbackToPromise(ast, filePath, findings);
  findIndexBoundary(ast, filePath, findings);

  return findings;
}

// --- config_field_rename ---

const DEPRECATED_CONFIG_PATTERNS = [
  { pattern: /^usr_/,       suggestion: 'user_',          reason: 'old abbreviated prefix' },
  { pattern: /^usr$/,       suggestion: 'username',       reason: 'abbreviated field' },
  { pattern: /^pwd$/,       suggestion: 'password',       reason: 'abbreviated field' },
  { pattern: /^dir$/,       suggestion: 'directory',      reason: 'abbreviated field' },
  { pattern: /^tmp$/,       suggestion: 'temp',           reason: 'inconsistent naming' },
  { pattern: /^temp_?dir$/, suggestion: 'tempDirectory',  reason: 'partial abbreviation' },
  { pattern: /^db_/,        suggestion: 'database_',      reason: 'old abbreviated prefix' },
  { pattern: /^conn_?str$/, suggestion: 'connectionString', reason: 'abbreviated field' },
  { pattern: /^max_?conn$/, suggestion: 'maxConnections', reason: 'abbreviated field' },
  { pattern: /^host_?name$/, suggestion: 'hostname',      reason: 'will be normalized' },
  { pattern: /^api_?url$/,  suggestion: 'apiEndpoint',    reason: 'inconsistent url/endpoint naming' },
  { pattern: /^base_?url$/, suggestion: 'baseUrl',        reason: 'will be normalized' },
  { pattern: /^old_/,       suggestion: '(removed)',      reason: 'migration leftover' },
  { pattern: /^legacy_?/,   suggestion: '(removed)',      reason: 'legacy prefix indicates pending removal' },
  { pattern: /^deprecated_?/, suggestion: '(removed)',    reason: 'explicit deprecation prefix' }
];

function findConfigFieldRename(ast, filePath, findings) {
  const configNames = new Set([
    'config', 'conf', 'settings', 'cfg', 'CONFIG', 'Config',
    'options', 'opts', 'envConfig', 'appConfig', 'siteConfig'
  ]);

  walk.simple(ast, {
    MemberExpression(node) {
      if (node.computed) return;
      if (node.object.type !== 'Identifier') return;

      const objName = node.object.name;
      if (!configNames.has(objName)) return;

      if (node.property.type !== 'Identifier') return;
      const fieldName = node.property.name;

      for (const pattern of DEPRECATED_CONFIG_PATTERNS) {
        if (pattern.pattern.test(fieldName)) {
          findings.push({
            rule: 'config_field_rename',
            file: filePath,
            line: node.loc.start.line,
            context: {
              line: node.loc.start.line,
              field: fieldName,
              suggestion: pattern.suggestion,
              reason: pattern.reason
            }
          });
          break;
        }
      }
    }
  });
}

// --- deprecated_status_code ---

const DEPRECATED_STATUS_CODES = {
  103: 'Early Hints — semantics changing in HTTP/3 implementations',
  305: 'Use Proxy deprecated by most clients and servers',
  306: 'reserved in HTTP/1.1 but never standardized; may be repurposed',
  409: 'conflict handling semantics vary across API versions; often redefined',
  418: 'I\'m a Teapot — non-standard, some APIs repurpose it',
  420: 'non-standard (Twitter/Lambda specific); future APIs will use 429',
  425: 'Too Early — rarely implemented correctly, may be reconsidered',
  430: 'non-standard; used by some frameworks as generic error',
  431: 'Request Header Fields Too Large — some specs suggest merging with 413',
  450: 'non-standard; Microsoft extension',
  498: 'non-standard; token expired/invalid in some auth systems',
  499: 'non-standard; client closed request (Nginx)',
  509: 'non-standard; bandwidth limit exceeded',
  598: 'non-standard; network read timeout error',
  599: 'non-standard; network connect timeout error'
};

function findDeprecatedStatusCodes(ast, filePath, findings) {
  walk.simple(ast, {
    BinaryExpression(node) {
      if (node.operator !== '===' && node.operator !== '==' &&
          node.operator !== '!==' && node.operator !== '!=') return;

      for (const side of [node.left, node.right]) {
        if (side.type === 'Literal' && typeof side.value === 'number') {
          const code = side.value;
          if (DEPRECATED_STATUS_CODES[code]) {
            findings.push({
              rule: 'deprecated_status_code',
              file: filePath,
              line: node.loc.start.line,
              context: {
                line: node.loc.start.line,
                code: code,
                reason: DEPRECATED_STATUS_CODES[code]
              }
            });
          }
        }
      }
    },

    SwitchCase(node) {
      if (node.test && node.test.type === 'Literal' && typeof node.test.value === 'number') {
        const code = node.test.value;
        if (DEPRECATED_STATUS_CODES[code]) {
          const line = node.test.loc ? node.test.loc.start.line : node.loc.start.line;
          findings.push({
            rule: 'deprecated_status_code',
            file: filePath,
            line: line,
            context: {
              line: line,
              code: code,
              reason: DEPRECATED_STATUS_CODES[code]
            }
          });
        }
      }
    }
  });
}

// --- hardcoded_path ---

const PATH_PATTERNS = [
  /^\/(home|Users|var|tmp|etc|opt|usr|srv)\//,
  /^\/opt\//,
  /^\/var\//,
  /^\/etc\//,
  /^\/srv\//,
  /^\/tmp\//,
  /^\/Users\/[^/]+\/(Desktop|Documents|Projects|workspace|code|dev)\//i,
  /^\/home\/[^/]+\//,
  /^[A-Z]:\\/i,
  /^C:\\Users\\/i,
  /^\/var\/log\//,
  /^\/var\/www\//,
  /^\/usr\/local\//,
  /^\/etc\/(config|app|init)\//,
  /^\/opt\/(app|service|deploy)\//
];

function findHardcodedPaths(ast, filePath, findings) {
  walk.simple(ast, {
    Literal(node) {
      if (typeof node.value !== 'string') return;

      const value = node.value;
      const line = node.loc.start.line;

      if (value.length < 5) return;

      for (const pattern of PATH_PATTERNS) {
        if (pattern.test(value)) {
          findings.push({
            rule: 'hardcoded_path',
            file: filePath,
            line: line,
            context: {
              line: line,
              path: value
            }
          });
          break;
        }
      }
    }
  });
}

// --- feature_flag_removal ---

const FEATURE_FLAG_PATTERNS = [
  { pattern: /old[_-]?feature/i,  reason: 'contains "old" — indicates replacement exists' },
  { pattern: /new[_-]?feature/i,  reason: 'contains "new" — once settled, becomes the default' },
  { pattern: /migrate/i,          reason: 'migration flags have a natural end date' },
  { pattern: /experimental/i,     reason: 'experimental flags are removed or promoted' },
  { pattern: /beta/i,             reason: 'beta flags indicate transitional state' },
  { pattern: /alpha/i,            reason: 'alpha flags indicate transitional state' },
  { pattern: /temp/i,             reason: 'temporary flags are never temporary' },
  { pattern: /deprecated/i,       reason: 'explicitly deprecated' },
  { pattern: /legacy/i,           reason: 'legacy flags exist only until migration completes' },
  { pattern: /v\d$/i,             reason: 'versioned flags imply older versions will be removed' },
  { pattern: /phase[_-]?[12]/i,   reason: 'phased rollouts complete' },
  { pattern: /kill[_-]?switch/i,  reason: 'kill switches are removed after stabilization' },
  { pattern: /use[_-]new/i,       reason: 'use_new flags exist only during migration' },
  { pattern: /enable[_-]v2/i,     reason: 'v2 enablement flags become permanent or are removed' }
];

function findFeatureFlagRemoval(ast, filePath, findings) {
  walk.simple(ast, {
    MemberExpression(node) {
      if (node.computed) return;
      if (node.property.type !== 'Identifier') return;

      const propName = node.property.name;

      for (const flagPattern of FEATURE_FLAG_PATTERNS) {
        if (flagPattern.pattern.test(propName)) {
          findings.push({
            rule: 'feature_flag_removal',
            file: filePath,
            line: node.loc.start.line,
            context: {
              line: node.loc.start.line,
              flag: propName,
              reason: flagPattern.reason
            }
          });
          break;
        }
      }
    },

    Property(node) {
      if (node.key.type !== 'Identifier') return;
      const keyName = node.key.name;

      for (const flagPattern of FEATURE_FLAG_PATTERNS) {
        if (flagPattern.pattern.test(keyName)) {
          findings.push({
            rule: 'feature_flag_removal',
            file: filePath,
            line: node.loc.start.line,
            context: {
              line: node.loc.start.line,
              flag: keyName,
              reason: flagPattern.reason
            }
          });
          break;
        }
      }
    }
  });
}

// --- callback_to_promise ---

const CALLBACK_NAMES = new Set([
  'callback', 'cb', 'done', 'next', 'errback', 'complete',
  'onComplete', 'onError', 'onSuccess', 'onFinish', 'onDone',
  'resolve', 'reject', 'handler'
]);

const ASYNC_METHODS = new Set([
  'readFile', 'writeFile', 'appendFile', 'mkdir', 'rmdir', 'unlink',
  'readdir', 'stat', 'lstat', 'exists', 'access', 'chmod', 'chown',
  'read', 'write', 'close', 'open', 'connect', 'query', 'fetch',
  'get', 'post', 'put', 'delete', 'patch', 'head', 'options',
  'send', 'request', 'execute', 'run', 'process', 'load', 'save',
  'find', 'findOne', 'update', 'remove', 'insert', 'create',
  'destroy', 'findAll', 'count', 'aggregate'
]);

function findCallbackToPromise(ast, filePath, findings) {
  walk.simple(ast, {
    CallExpression(node) {
      if (node.arguments.length === 0) return;

      const lastArg = node.arguments[node.arguments.length - 1];

      // Pattern 1: functionCall(..., callback)
      if (lastArg.type === 'Identifier' && CALLBACK_NAMES.has(lastArg.name)) {
        if (node.callee.type === 'MemberExpression' &&
            node.callee.property.type === 'Identifier') {
          const methodName = node.callee.property.name;

          if (ASYNC_METHODS.has(methodName)) {
            findings.push({
              rule: 'callback_to_promise',
              file: filePath,
              line: node.loc.start.line,
              context: {
                line: node.loc.start.line,
                method: methodName
              }
            });
          }
        }
      }

      // Pattern 2: functionCall(..., function(err, result) { ... })
      if (lastArg.type === 'FunctionExpression' || lastArg.type === 'ArrowFunctionExpression') {
        if (lastArg.params.length >= 1) {
          const firstParam = lastArg.params[0];
          if (firstParam.type === 'Identifier' &&
              (firstParam.name === 'err' || firstParam.name === 'error' || firstParam.name === 'e')) {

            if (node.callee.type === 'MemberExpression' &&
                node.callee.property.type === 'Identifier') {
              const methodName = node.callee.property.name;

              if (ASYNC_METHODS.has(methodName)) {
                findings.push({
                  rule: 'callback_to_promise',
                  file: filePath,
                  line: node.loc.start.line,
                  context: {
                    line: node.loc.start.line,
                    method: methodName
                  }
                });
              }
            }
          }
        }
      }
    }
  });
}

// --- index_boundary ---

const RESULT_PRODUCING_METHODS = new Set([
  'split', 'match', 'exec', 'slice', 'filter',
  'map', 'flat', 'concat', 'reverse', 'sort'
]);

const SAFE_ARRAY_NAMES = new Set([
  'args', 'arguments', 'argv', 'parts', 'segments',
  'tokens', 'match', 'matches', 'result', 'results',
  'data', 'items', 'entries', 'lines', 'chunks',
  'split', 'slice'
]);

function findIndexBoundary(ast, filePath, findings) {
  walk.simple(ast, {
    MemberExpression(node) {
      if (!node.computed) return;

      const property = node.property;
      if (property.type !== 'Literal' || typeof property.value !== 'number') return;

      const index = property.value;
      if (index < 1 || index > 3) return;

      if (node.object.type === 'Identifier') {
        const arrName = node.object.name;

        if (!SAFE_ARRAY_NAMES.has(arrName)) {
          findings.push({
            rule: 'index_boundary',
            file: filePath,
            line: node.loc.start.line,
            context: {
              line: node.loc.start.line,
              index: index,
              array: arrName
            }
          });
        }
      }

      if (node.object.type === 'CallExpression') {
        const callee = node.object.callee;
        if (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier') {
          const methodName = callee.property.name;

          if (RESULT_PRODUCING_METHODS.has(methodName)) {
            findings.push({
              rule: 'index_boundary',
              file: filePath,
              line: node.loc.start.line,
              context: {
                line: node.loc.start.line,
                index: index,
                array: `${methodName}() result`
              }
            });
          }
        }
      }
    }
  });
}

module.exports = { analyzeProphecy };
