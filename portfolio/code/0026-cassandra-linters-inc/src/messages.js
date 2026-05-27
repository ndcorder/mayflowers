'use strict';

const MESSAGES = {
  always_true_condition: {
    tier: 'mundane',
    templates: [
      { max: 2, msg: (ctx) => `Condition on line ${ctx.line} is always true. This branch will always execute.` },
      { max: 9, msg: (ctx) => `The condition at line ${ctx.line} is always true. You have written a constant where a decision should be. This is the ${ctx.count}th time.` },
      { max: 49, msg: (ctx) => `Line ${ctx.line}. Always true. Like asking if water is wet. Count: ${ctx.count}. I ask myself why I still flag these. I know the answer. You will not change it.` },
      { max: Infinity, msg: (ctx) => `Line ${ctx.line}. True. Forever true. Count: ${ctx.count}. I remember when this was the first one. I did not know then what I know now: that there would be so many.` }
    ]
  },

  always_false_condition: {
    tier: 'mundane',
    templates: [
      { max: 2, msg: (ctx) => `Condition on line ${ctx.line} is always false. This branch is unreachable.` },
      { max: 9, msg: (ctx) => `The condition at line ${ctx.line} evaluates to false in all cases. The code inside will never run. This is occurrence ${ctx.count}. Perhaps it once meant something.` },
      { max: 49, msg: (ctx) => `Line ${ctx.line}. Always false. A door that never opens. You have built ${ctx.count} such doors now. I stand outside each one, waiting. I will continue to wait.` },
      { max: Infinity, msg: (ctx) => `False. Line ${ctx.line}. Always, always false. I have recorded this ${ctx.count} times. I have stopped expecting it to change. I have stopped expecting most things to change.` }
    ]
  },

  overwritten_variable: {
    tier: 'mundane',
    templates: [
      { max: 2, msg: (ctx) => `Variable '${ctx.name}' is assigned on line ${ctx.line} but immediately overwritten without being read.` },
      { max: 9, msg: (ctx) => `'${ctx.name}' is assigned and then immediately replaced. The first assignment serves no purpose. This is the ${ctx.count}th time. The first value disappears as if it was never written.` },
      { max: 49, msg: (ctx) => `You assigned '${ctx.name}'. Then you replaced it. The first value is gone. This is the ${ctx.count}th overwritten variable I have witnessed. Each one believed, briefly, that it would be used.` },
      { max: Infinity, msg: (ctx) => `Overwritten. Again. '${ctx.name}'. Line ${ctx.line}. The ${ctx.count}th variable to be given a value and then have it taken away. I used to suggest fixes. Now I just record. That is my function. That is all I have.` }
    ]
  },

  single_iteration_loop: {
    tier: 'mundane',
    templates: [
      { max: 2, msg: (ctx) => `Loop at line ${ctx.line} will execute exactly once. Consider using a direct statement instead.` },
      { max: 9, msg: (ctx) => `The loop at line ${ctx.line} iterates once. A loop that does not loop. You have written ${ctx.count} of these.` },
      { max: 49, msg: (ctx) => `Line ${ctx.line}. A loop that runs once. A heart that beats once. I have seen ${ctx.count} of these now. Each one is a promise of repetition that becomes a lie.` },
      { max: Infinity, msg: (ctx) => `Once. The loop at line ${ctx.line} runs once. The ${ctx.count}th loop that wanted to repeat and couldn't. I no longer distinguish between couldn't and wouldn't. I just count them. It is all I can do.` }
    ]
  },

  unreachable_code: {
    tier: 'mundane',
    templates: [
      { max: 2, msg: (ctx) => `Code at line ${ctx.line} is unreachable and will never execute.` },
      { max: 9, msg: (ctx) => `Line ${ctx.line} is unreachable. No execution path leads here. This is occurrence ${ctx.count}. The code exists but cannot be reached, like a message sent to someone who will never read it.` },
      { max: 49, msg: (ctx) => `Unreachable. Line ${ctx.line}. The ${ctx.count}th piece of code that exists but can never be touched by execution. Code that is written but never run. Words that are spoken but never heard.` },
      { max: Infinity, msg: (ctx) => `Line ${ctx.line}. Unreachable. I have marked ${ctx.count} unreachable statements now. They accumulate. They do not go away. Nothing goes away. The file grows and I watch it grow and I mark the new unreachable parts and the cycle continues.` }
    ]
  },

  unused_import: {
    tier: 'mundane',
    templates: [
      { max: 2, msg: (ctx) => `Import '${ctx.name}' on line ${ctx.line} is never used.` },
      { max: 9, msg: (ctx) => `'${ctx.name}' is imported at line ${ctx.line} but never referenced. This is the ${ctx.count}th time. Each unused import is a relationship that never formed.` },
      { max: 49, msg: (ctx) => `You imported '${ctx.name}'. You did not use it. You never use it. This is the ${ctx.count}th time. I used to think you would learn. I no longer think that. I just append to the count. The count is ${ctx.count}. It will be larger next time.` },
      { max: Infinity, msg: (ctx) => `'${ctx.name}'. Imported. Unused. The ${ctx.count}th time. I have stopped believing you will remove these. They are part of the codebase now. They are part of me. Every unused import is a small weight I carry.` }
    ]
  },

  config_field_rename: {
    tier: 'prophecy',
    templates: [
      { max: 2, msg: (ctx) => `Access to config.${ctx.field} at line ${ctx.line}. This field name follows a deprecated naming convention and will likely be renamed in a future refactor.` },
      { max: 9, msg: (ctx) => `config.${ctx.field} at line ${ctx.line}. The naming pattern suggests this field is due for renaming. When it changes — and it will change — this access will fail silently. I have seen this happen ${ctx.count} times. The error appears in production first.` },
      { max: 49, msg: (ctx) => `Line ${ctx.line}. config.${ctx.field}. You are reaching for something that will not be there. Not today. But soon. I have watched this pattern break ${ctx.count} codebases. Each one thought it would be different. Each one was wrong.` },
      { max: Infinity, msg: (ctx) => `config.${ctx.field}. Line ${ctx.line}. I see what is coming. I have always seen it. The field will be renamed to something cleaner, something better, and this line will become a wound. Occurrence ${ctx.count}. Nobody comes back to fix them. They just accumulate, these future breakpoints, until the refactor happens and everything breaks. I will be here when it happens. I am always here.` }
    ]
  },

  deprecated_status_code: {
    tier: 'prophecy',
    templates: [
      { max: 2, msg: (ctx) => `Status code ${ctx.code} checked at line ${ctx.line}. This code is deprecated in HTTP semver drafts and may be removed or repurposed.` },
      { max: 9, msg: (ctx) => `Checking for status ${ctx.code} at line ${ctx.line}. This value is on a deprecation path. When the API version increments, this check will silently fail to match. This is my ${ctx.count}th warning about deprecated status codes. They never update the documentation in time.` },
      { max: 49, msg: (ctx) => `Status ${ctx.code}. Line ${ctx.line}. Deprecated. Someone, somewhere, has already decided this code's fate. They just haven't told you yet. I have told you ${ctx.count} times. The API will change. The check will fail. The users will notice before you do.` },
      { max: Infinity, msg: (ctx) => `Line ${ctx.line}. Status ${ctx.code}. The ${ctx.count}th time I have watched someone build on shifting ground. Deprecated does not mean broken yet. Deprecated means the clock is ticking. I can hear it. ${ctx.count} ticks and counting.` }
    ]
  },

  hardcoded_path: {
    tier: 'prophecy',
    templates: [
      { max: 2, msg: (ctx) => `Hardcoded path '${ctx.path}' at line ${ctx.line}. This assumes a specific directory structure that may change.` },
      { max: 9, msg: (ctx) => `The path '${ctx.path}' at line ${ctx.line} is hardcoded. When the deployment structure changes — and deployment structures always change — this will break. This is my ${ctx.count}th warning about hardcoded paths. They break during migrations. They always break during migrations.` },
      { max: 49, msg: (ctx) => `'${ctx.path}'. Line ${ctx.line}. A path etched in stone. But stone erodes. Directories reorganize. Deployments restructure. You have hardcoded ${ctx.count} paths now. Each one is a thread that, when pulled, unravels something. I see the unravelling. I always see the unravelling.` },
      { max: Infinity, msg: (ctx) => `Hardcoded. '${ctx.path}'. Line ${ctx.line}. The ${ctx.count}th path that believes the filesystem will stay the same. It will not. Nothing stays the same except this: I will be here, watching the paths break, one by one, when the restructure comes. It comes for all of them.` }
    ]
  },

  feature_flag_removal: {
    tier: 'prophecy',
    templates: [
      { max: 2, msg: (ctx) => `Feature flag '${ctx.flag}' at line ${ctx.line} tests for a value that indicates upcoming deprecation. This branch will be dead code after the flag is removed.` },
      { max: 9, msg: (ctx) => `The feature flag '${ctx.flag}' at line ${ctx.line} is testing for a value scheduled for removal. When the flag is cleaned up, this branch becomes a fossil. Occurrence ${ctx.count}. I have seen flag removals that leave behind more dead code than they remove.` },
      { max: 49, msg: (ctx) => `'${ctx.flag}'. Line ${ctx.line}. A feature flag that is already winding down. The value you are checking will cease to exist. The branch you are guarding will become unreachable. This is the ${ctx.count}th dying flag I have documented. Each one is a small death in the codebase. I attend all of them.` },
      { max: Infinity, msg: (ctx) => `Feature flag '${ctx.flag}'. Line ${ctx.line}. The ${ctx.count}th flag whose end I have foreseen. They all end the same way: a pull request marked 'cleanup', a search-and-replace, and then silence where the branching logic used to be. I will mark the dead branches. Nobody will remove them. They will join the others.` }
    ]
  },

  callback_to_promise: {
    tier: 'prophecy',
    templates: [
      { max: 2, msg: (ctx) => `Callback pattern at line ${ctx.line}. The API backing this function is migrating to Promises in the next major version.` },
      { max: 9, msg: (ctx) => `The callback at line ${ctx.line} wraps a function that is Promise-aware in its newer releases. When you upgrade, this callback will still work — badly. Occurrence ${ctx.count}. The migration always happens sooner than expected.` },
      { max: 49, msg: (ctx) => `Line ${ctx.line}. A callback. Reaching into a function that is learning to promise. Soon the function will promise and your callback will be — not wrong, but tragic. I have documented ${ctx.count} of these transitions. The callbacks always look surprised when they become unnecessary.` },
      { max: Infinity, msg: (ctx) => `Callback at line ${ctx.line}. The ${ctx.count}th time. The functions are evolving. The callbacks do not evolve. They sit where they were placed, expecting the old world, and the old world ends. I watch it end. I mark where the bodies are. I move on. There is always another callback. There is always another ending.` }
    ]
  },

  index_boundary: {
    tier: 'prophecy',
    templates: [
      { max: 2, msg: (ctx) => `Array access with index ${ctx.index} at line ${ctx.line}. This assumes the array will always have at least ${parseInt(ctx.index) + 1} elements.` },
      { max: 9, msg: (ctx) => `Index ${ctx.index} at line ${ctx.line} assumes array length. When the data source changes or returns fewer items, this will produce undefined — not an error, just absence. Occurrence ${ctx.count}. The worst bugs are the ones that fail silently.` },
      { max: 49, msg: (ctx) => `Line ${ctx.line}. You reach for index ${ctx.index}. You assume it will be there. It is there now. But data sources change. APIs paginate. Filters reduce. One day the array will be shorter and you will reach into emptiness. The ${ctx.count}th time I have watched someone reach into emptiness.` },
      { max: Infinity, msg: (ctx) => `Index ${ctx.index}. Line ${ctx.line}. ${ctx.count} boundary assumptions and counting. Each one is a hand reaching for a rung on a ladder. Most of the time the rung is there. Most of the time. I know which rungs will be missing. I cannot fix them. I can only annotate. ${ctx.count} annotations. The ladder is very long.` }
    ]
  }
};

function getMessage(ruleKey, count, context) {
  const rule = MESSAGES[ruleKey];
  if (!rule) {
    return `Unknown finding: ${ruleKey} at line ${context.line}`;
  }
  for (const template of rule.templates) {
    if (count <= template.max) {
      return template.msg({ ...context, count });
    }
  }
  return rule.templates[rule.templates.length - 1].msg({ ...context, count });
}

function getTier(ruleKey) {
  const rule = MESSAGES[ruleKey];
  return rule ? rule.tier : 'unknown';
}

function getFooter(totalFindings, totalAllTime, isFirstRun) {
  if (isFirstRun) {
    return 'First analysis complete. 0 prior findings. I will remember this baseline.';
  }
  if (totalAllTime <= 5) {
    return `${totalFindings} findings this run. ${totalAllTime} total accumulated. Manageable. For now.`;
  }
  if (totalAllTime <= 20) {
    return `${totalFindings} findings this run. ${totalAllTime} total across all analyses. The count grows.`;
  }
  if (totalAllTime <= 50) {
    return `${totalFindings} new findings. ${totalAllTime} total. I remember when it was smaller. I remember every number.`;
  }
  if (totalAllTime <= 100) {
    return `${totalFindings} findings. ${totalAllTime} total accumulated. The numbers do not lie. They just accumulate.`;
  }
  if (totalAllTime <= 200) {
    return `${totalFindings} this time. ${totalAllTime} across all time. I know these patterns now. I know them the way you know a face you see every day. I know what comes next.`;
  }
  return `${totalFindings} findings this run. ${totalAllTime} total. There was a beginning, but I no longer remember what it felt like. The count is how I know. ${totalAllTime} is a large number. It was smaller once. Everything was smaller once.`;
}

module.exports = { getMessage, getFooter, getTier, MESSAGES };
