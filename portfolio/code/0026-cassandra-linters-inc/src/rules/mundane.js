'use strict';

const acorn = require('acorn');
const walk = require('acorn-walk');

function analyzeMundane(source, filePath) {
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

  findUnusedImports(ast, filePath, findings);
  findAlwaysTrueFalseConditions(ast, filePath, findings);
  findOverwrittenVariables(ast, filePath, findings);
  findSingleIterationLoops(ast, filePath, findings);
  findUnreachableCode(ast, filePath, findings);

  return findings;
}

/**
 * Attempt to statically evaluate a node to a constant value.
 * Returns undefined if the value cannot be determined.
 */
function evaluateConstant(node) {
  if (!node) return undefined;

  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'Identifier':
      if (node.name === 'undefined') return undefined;
      if (node.name === 'true') return true;
      if (node.name === 'false') return false;
      if (node.name === 'null') return null;
      if (node.name === 'NaN') return NaN;
      return undefined;

    case 'UnaryExpression':
      if (node.operator === '!') {
        const arg = evaluateConstant(node.argument);
        if (arg !== undefined) return !arg;
      }
      if (node.operator === '-') {
        const arg = evaluateConstant(node.argument);
        if (typeof arg === 'number') return -arg;
      }
      if (node.operator === '+' && node.argument.type === 'Literal') {
        return Number(node.argument.value);
      }
      return undefined;

    case 'BinaryExpression': {
      const left = evaluateConstant(node.left);
      const right = evaluateConstant(node.right);
      if (left === undefined || right === undefined) return undefined;

      switch (node.operator) {
        case '==':  return left == right;
        case '!=':  return left != right;
        case '===': return left === right;
        case '!==': return left !== right;
        case '<':   return left < right;
        case '>':   return left > right;
        case '<=':  return left <= right;
        case '>=':  return left >= right;
        case '+':   return left + right;
        case '-':   return left - right;
        case '*':   return left * right;
        case '/':   return left / right;
        case '%':   return left % right;
        default:    return undefined;
      }
    }

    case 'LogicalExpression': {
      const left = evaluateConstant(node.left);
      const right = evaluateConstant(node.right);
      if (left === undefined || right === undefined) return undefined;

      if (node.operator === '&&') return left && right;
      if (node.operator === '||') return left || right;
      if (node.operator === '??') return left ?? right;
      return undefined;
    }

    default:
      return undefined;
  }
}

function findAlwaysTrueFalseConditions(ast, filePath, findings) {
  walk.simple(ast, {
    IfStatement(node) {
      const val = evaluateConstant(node.test);
      if (val === true) {
        findings.push({
          rule: 'always_true_condition',
          file: filePath,
          line: node.loc.start.line,
          context: { line: node.loc.start.line }
        });
      } else if (val === false) {
        findings.push({
          rule: 'always_false_condition',
          file: filePath,
          line: node.loc.start.line,
          context: { line: node.loc.start.line }
        });
      }
    },

    ConditionalExpression(node) {
      const val = evaluateConstant(node.test);
      if (val === true) {
        findings.push({
          rule: 'always_true_condition',
          file: filePath,
          line: node.loc.start.line,
          context: { line: node.loc.start.line }
        });
      } else if (val === false) {
        findings.push({
          rule: 'always_false_condition',
          file: filePath,
          line: node.loc.start.line,
          context: { line: node.loc.start.line }
        });
      }
    },

    WhileStatement(node) {
      const val = evaluateConstant(node.test);
      if (val === false) {
        findings.push({
          rule: 'always_false_condition',
          file: filePath,
          line: node.loc.start.line,
          context: { line: node.loc.start.line }
        });
      }
    },

    DoWhileStatement(node) {
      const val = evaluateConstant(node.test);
      if (val === false) {
        findings.push({
          rule: 'always_false_condition',
          file: filePath,
          line: node.loc.start.line,
          context: { line: node.loc.start.line }
        });
      }
    }
  });
}

function findOverwrittenVariables(ast, filePath, findings) {
  walk.simple(ast, {
    BlockStatement(node) {
      checkOverwrittenInBody(node.body, filePath, findings);
    },
    Program(node) {
      checkOverwrittenInBody(node.body, filePath, findings);
    }
  });
}

function checkOverwrittenInBody(body, filePath, findings) {
  if (!body || body.length < 2) return;

  for (let i = 0; i < body.length - 1; i++) {
    const stmt = body[i];
    const next = body[i + 1];

    if (stmt.type !== 'VariableDeclaration' || next.type !== 'VariableDeclaration') continue;

    for (const decl of stmt.declarations) {
      if (decl.id.type !== 'Identifier') continue;
      const varName = decl.id.name;
      const varLine = stmt.loc.start.line;

      for (const nextDecl of next.declarations) {
        if (nextDecl.id.type !== 'Identifier') continue;
        if (nextDecl.id.name === varName) {
          findings.push({
            rule: 'overwritten_variable',
            file: filePath,
            line: varLine,
            context: { name: varName, line: varLine }
          });
        }
      }
    }
  }

  for (const stmt of body) {
    if (stmt.type === 'BlockStatement') {
      checkOverwrittenInBody(stmt.body, filePath, findings);
    } else if (stmt.type === 'IfStatement') {
      if (stmt.consequent && stmt.consequent.type === 'BlockStatement') {
        checkOverwrittenInBody(stmt.consequent.body, filePath, findings);
      }
      if (stmt.alternate) {
        if (stmt.alternate.type === 'BlockStatement') {
          checkOverwrittenInBody(stmt.alternate.body, filePath, findings);
        } else if (stmt.alternate.type === 'IfStatement') {
          checkOverwrittenInBody([stmt.alternate], filePath, findings);
        }
      }
    } else if (stmt.type === 'ForStatement' || stmt.type === 'WhileStatement' || stmt.type === 'DoWhileStatement') {
      if (stmt.body && stmt.body.type === 'BlockStatement') {
        checkOverwrittenInBody(stmt.body.body, filePath, findings);
      }
    } else if (stmt.type === 'FunctionDeclaration') {
      if (stmt.body && stmt.body.type === 'BlockStatement') {
        checkOverwrittenInBody(stmt.body.body, filePath, findings);
      }
    } else if (stmt.type === 'TryStatement') {
      if (stmt.block) {
        checkOverwrittenInBody(stmt.block.body, filePath, findings);
      }
      if (stmt.handler && stmt.handler.body) {
        checkOverwrittenInBody(stmt.handler.body.body, filePath, findings);
      }
      if (stmt.finalizer) {
        checkOverwrittenInBody(stmt.finalizer.body, filePath, findings);
      }
    } else if (stmt.type === 'SwitchStatement') {
      for (const c of stmt.cases || []) {
        checkOverwrittenInBody(c.consequent, filePath, findings);
      }
    }
  }
}

function findSingleIterationLoops(ast, filePath, findings) {
  walk.simple(ast, {
    ForStatement(node) {
      if (node.init && node.init.type === 'VariableDeclaration') {
        for (const decl of node.init.declarations) {
          if (decl.id.type === 'Identifier' && decl.init) {
            const initVal = evaluateConstant(decl.init);
            const testName = decl.id.name;

            if (node.test) {
              const testVal = checkTestAgainstInit(node.test, testName, initVal);
              if (testVal === 'single') {
                findings.push({
                  rule: 'single_iteration_loop',
                  file: filePath,
                  line: node.loc.start.line,
                  context: { line: node.loc.start.line }
                });
              }
            }
          }
        }
      }
    },

    WhileStatement(node) {
      const testVal = evaluateConstant(node.test);
      if (testVal === true && node.body && node.body.type === 'BlockStatement') {
        const hasBreak = checkForBreak(node.body);
        if (hasBreak) {
          findings.push({
            rule: 'single_iteration_loop',
            file: filePath,
            line: node.loc.start.line,
            context: { line: node.loc.start.line }
          });
        }
      }
    }
  });
}

function checkTestAgainstInit(testNode, varName, initVal) {
  if (initVal === undefined) return null;

  if (testNode.type === 'BinaryExpression') {
    if (testNode.left.type === 'Identifier' && testNode.left.name === varName) {
      const rightVal = evaluateConstant(testNode.right);
      if (rightVal !== undefined) {
        if (testNode.operator === '<=' && initVal === rightVal) return 'single';
        if (testNode.operator === '<'  && initVal === rightVal - 1) return 'single';
        if (testNode.operator === '>=' && initVal === rightVal) return 'single';
        if (testNode.operator === '>'  && initVal === rightVal + 1) return 'single';
        if (testNode.operator === '==' && initVal === rightVal) return 'single';
        if (testNode.operator === '===' && initVal === rightVal) return 'single';
      }
    }
    if (testNode.right.type === 'Identifier' && testNode.right.name === varName) {
      const leftVal = evaluateConstant(testNode.left);
      if (leftVal !== undefined) {
        if (testNode.operator === '<=' && initVal === leftVal) return 'single';
        if (testNode.operator === '>=' && initVal === leftVal) return 'single';
        if (testNode.operator === '==' && initVal === leftVal) return 'single';
        if (testNode.operator === '===' && initVal === leftVal) return 'single';
      }
    }
  }

  if (testNode.type === 'Literal') {
    if (initVal === testNode.value) return 'single';
  }

  return null;
}

function checkForBreak(body) {
  let found = false;
  try {
    walk.simple(body, {
      BreakStatement() {
        found = true;
      },
      FunctionExpression() { throw new Error('skip'); },
      ArrowFunctionExpression() { throw new Error('skip'); },
      FunctionDeclaration() { throw new Error('skip'); }
    });
  } catch (e) {
    if (e.message === 'skip') return false;
  }
  return found;
}

function findUnreachableCode(ast, filePath, findings) {
  walk.simple(ast, {
    BlockStatement(node) {
      checkUnreachableInBody(node.body, filePath, findings);
    },
    Program(node) {
      checkUnreachableInBody(node.body, filePath, findings);
    }
  });
}

function checkUnreachableInBody(body, filePath, findings) {
  if (!body || body.length < 2) return;

  const terminalTypes = new Set([
    'ReturnStatement', 'ThrowStatement', 'BreakStatement', 'ContinueStatement'
  ]);

  for (let i = 0; i < body.length - 1; i++) {
    const stmt = body[i];

    if (terminalTypes.has(stmt.type)) {
      for (let j = i + 1; j < body.length; j++) {
        const unreachable = body[j];
        if (unreachable.type === 'FunctionDeclaration') continue;

        findings.push({
          rule: 'unreachable_code',
          file: filePath,
          line: unreachable.loc.start.line,
          context: { line: unreachable.loc.start.line }
        });
        break;
      }
    }

    if (stmt.type === 'IfStatement' &&
        stmt.consequent && stmt.alternate &&
        isTerminal(stmt.consequent) && isTerminal(stmt.alternate)) {
      for (let j = i + 1; j < body.length; j++) {
        const unreachable = body[j];
        if (unreachable.type === 'FunctionDeclaration') continue;

        findings.push({
          rule: 'unreachable_code',
          file: filePath,
          line: unreachable.loc.start.line,
          context: { line: unreachable.loc.start.line }
        });
        break;
      }
    }
  }

  for (const stmt of body) {
    if (stmt.type === 'BlockStatement') {
      checkUnreachableInBody(stmt.body, filePath, findings);
    } else if (stmt.type === 'IfStatement') {
      if (stmt.consequent && stmt.consequent.type === 'BlockStatement') {
        checkUnreachableInBody(stmt.consequent.body, filePath, findings);
      }
      if (stmt.alternate) {
        if (stmt.alternate.type === 'BlockStatement') {
          checkUnreachableInBody(stmt.alternate.body, filePath, findings);
        } else if (stmt.alternate.type === 'IfStatement') {
          checkUnreachableInBody([stmt.alternate], filePath, findings);
        }
      }
    } else if (stmt.type === 'ForStatement' || stmt.type === 'WhileStatement' || stmt.type === 'DoWhileStatement') {
      if (stmt.body && stmt.body.type === 'BlockStatement') {
        checkUnreachableInBody(stmt.body.body, filePath, findings);
      }
    } else if (stmt.type === 'FunctionDeclaration') {
      if (stmt.body && stmt.body.type === 'BlockStatement') {
        checkUnreachableInBody(stmt.body.body, filePath, findings);
      }
    } else if (stmt.type === 'TryStatement') {
      if (stmt.block) {
        checkUnreachableInBody(stmt.block.body, filePath, findings);
      }
      if (stmt.handler && stmt.handler.body) {
        checkUnreachableInBody(stmt.handler.body.body, filePath, findings);
      }
      if (stmt.finalizer) {
        checkUnreachableInBody(stmt.finalizer.body, filePath, findings);
      }
    } else if (stmt.type === 'SwitchStatement') {
      for (const c of stmt.cases || []) {
        checkUnreachableInBody(c.consequent, filePath, findings);
      }
    }
  }
}

function isTerminal(node) {
  if (node.type === 'ReturnStatement' || node.type === 'ThrowStatement') return true;
  if (node.type === 'BlockStatement') {
    return node.body.length > 0 && isTerminal(node.body[node.body.length - 1]);
  }
  return false;
}

function findUnusedImports(ast, filePath, findings) {
  const imports = new Map();

  walk.simple(ast, {
    ImportDeclaration(node) {
      for (const spec of node.specifiers) {
        if (spec.type === 'ImportDefaultSpecifier' ||
            spec.type === 'ImportSpecifier' ||
            spec.type === 'ImportNamespaceSpecifier') {
          const name = spec.local.name;
          imports.set(name, node.loc.start.line);
        }
      }
    }
  });

  if (imports.size === 0) return;

  const usageCounts = new Map();
  for (const name of imports.keys()) {
    usageCounts.set(name, 0);
  }

  walk.simple(ast, {
    Identifier(node, ancestors) {
      const name = node.name;
      if (!imports.has(name)) return;

      if (ancestors) {
        for (const ancestor of ancestors) {
          if (ancestor.type === 'ImportDeclaration' ||
              ancestor.type === 'ImportSpecifier' ||
              ancestor.type === 'ImportDefaultSpecifier' ||
              ancestor.type === 'ImportNamespaceSpecifier') {
            return;
          }
        }
      }
      usageCounts.set(name, (usageCounts.get(name) || 0) + 1);
    }
  });

  for (const [name, line] of imports) {
    if (usageCounts.get(name) === 0) {
      findings.push({
        rule: 'unused_import',
        file: filePath,
        line: line,
        context: { name, line }
      });
    }
  }
}

module.exports = { analyzeMundane };
