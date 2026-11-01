# Agent Guidelines

## Function naming

Function names should start with a verb that describes the function's action or result, such as `get`, `create`, `validate`, or `resolve`.

Use a non-verb name only when it follows an established convention or is otherwise clearly reasonable for the API, such as an event handler callback (`onGenerate`, `onCopyValue`).

Prefer a read-only getter property for a cheap, deterministic, parameterless projection of an object.

## Declaration order

Organize declarations in TypeScript source files following standard top-down (step-down/newspaper) ordering:

* Place top-level constants directly below imports. Do not scatter constants throughout the file or place them between function declarations.
* Declare public APIs, primary classes, and main entry points before private implementation details.
* Place private helper functions and internal utilities below the public declarations that consume them.
* In classes and interfaces, declare properties before constructors, followed by public methods and private helper methods.

## Code comments

Write comments for someone reading the code fresh, with no knowledge of the change that introduced it. A comment must still make sense once the task, the diff, and the previous implementation are forgotten.

Do not write task-scoped comments:

* No rationale for the edit itself, such as why a line was added, or why one approach was chosen over another during the work.
* No references to code that no longer exists, including removed constants, previous values, or the old implementation.
* No comparisons to prior behavior, such as "no longer needs", "unlike before", or "this avoids the previous drift".
* No restating of what the adjacent code already says plainly.

Do write comments that stay true independently of the change:

* Constraints and invariants a reader cannot infer from the code.
* Non-obvious platform behavior, and unverified assumptions about it, along with where to correct them.
* The contract of a type or function: what it means, not how it came to be.

Prefer expressing intent through names over explaining it in a comment.

Format comments as flat prose:

* Hard-wrap comment lines at 100 columns.
* Keep every line at the comment's base indentation. Do not align continuation lines under a term, and do not indent example values or nested detail into a hanging block.
* Write a term and its explanation as an ordinary sentence rather than as a padded two-column layout.
* Separate such entries with a blank comment line instead of indentation.
* Write TSDoc/JSDoc in multi-line form, with `/**` and `*/` on their own lines, even for a single sentence. Do not write single-line JSDoc such as `/** Returns the value. */`.

## Language

Use American English everywhere: identifiers, comments, documentation, commit messages, and user-facing strings.

Common cases: `center` not `centre`, `behavior` not `behaviour`, `color` not `colour`, `initialize` and `normalize` not `initialise` and `normalise`, `canceled` not `cancelled`, `gray` not `grey`.

This keeps prose consistent with the web and DOM APIs it describes — `style.color` and `classList` among them.

## Markdown verification and formatting

Always run lint against Markdown files in the project to verify correctness:

```bash
npx markdownlint-cli "**/*.md" --ignore node_modules
```

Do not hard-wrap Markdown prose. Keep each paragraph on a single line and let the renderer handle visual wrapping.
Do not use soft wraps in Markdown files.
