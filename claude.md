# Library Development Guidelines

This document provides guidelines for developing and maintaining this library. It is very important to accurately follow all these guidelines.

## Workflow Guidelines

### Version Control

* Store every user prompt in `prompts.md` immediately upon receiving it:
  ```
  <previous prompts>

  ---

  <user's prompt verbatim>
  ```
* Commit changes after completing any task
* When committing changes:
  1. Use a concise title that briefly summarizes the changes
  2. Include a more detailed summary in the commit body
  3. Include all user prompts received since the last commit:
     ```bash
     git commit -am "Brief summary title" -m "$(cat <<'EOF'
Detailed summary of changes.

<prompt 1>

<prompt 2>

<prompt n...>
EOF
)"
     ```
* Note: `prompts.md` is a local log file and should not be committed to version control
* Each prompt in `prompts.md` should be separated by `---` surrounded by blank lines
* Use a single commit command rather than separate add/commit steps

## Project Overview

`@mitranim/js` is a lightweight JavaScript "standard library" that provides utilities across various domains while maintaining these principles:

* Environment-independent (browsers, Deno, Node)
* No external dependencies
* No transpilation required
* No bundlers required
* Native JS modules only

## Code Organization

The codebase is organized into focused modules:

* `lang.mjs`: Type assertions and core utilities
* `iter.mjs`: Functional iteration utilities
* `obj.mjs`: Object manipulation
* `coll.mjs`: Enhanced data structures
* Plus specialized modules for DOM, HTTP, paths, etc.

## Code Style Guidelines

### Naming Conventions

* `camelCase` for functions and properties
* `PascalCase` for classes
* Type checking functions follow specific patterns:
  * `isThing`: Returns boolean
  * `reqThing`: Requires value to be of type Thing
  * `optThing`: Accepts Thing or null/undefined
  * `onlyThing`: Filters out non-Thing values

### Syntax Conventions

* **No semicolons** — rely on JavaScript's Automatic Semicolon Insertion
* Use backticks (\`) for string literals even for single words (except in import statements, which require quotes)
* Use spaces, not tabs (2-space indentation)
* Prefer single-line conditions when simple: `if (condition) return value`
* Use braces for multi-line blocks
* Prefer ternary expressions for simple conditionals: `condition ? valueA : valueB`
* Prefer early returns over nested if/else structures
* Use single-line arrow functions without braces for simple returns
* Multi-line arrow functions use braces and explicit return
* Avoid extra spacing in single-line parentheses, brackets, and braces: `[1, 2]` not `[ 1, 2 ]`
* No spaces between parentheses and function bodies: `method() {return value}` not `method() { return value }`

### Variable Declarations

* Use `const` for variables that aren't reassigned (preferred)
* Use `let` for variables that need reassignment
* Never use `var`
* Avoid parameter default values with complex expressions
* Avoid parameter destructuring

### Naming and Organization

* Group related functions together
* Place internal utility functions at the bottom of files
* Use consistent prefixes (`is/req/opt/only`) for type-related functions
* Use descriptive names, with abbreviations marked with "Short for" comments
* Keep function bodies concise and focused
* Prefer small, simple, focused functions over large ones — each function should do one thing well

### Programming Paradigm

* Functional programming emphasized
* Immutability preferred with explicit mutations when needed
* Minimal dependencies between modules
* Type safety through runtime checks
* Prefer statically defined functions over inline closures:
  ```javascript
  // Preferred: Named function definition
  function mapValues(obj) {
    return Object.keys(obj).map(key => transform(obj[key]))
  }

  // Avoid: Anonymous inline closures when reusable
  const result = Object.keys(obj).map(key => transform(obj[key]))
  ```
* Take advantage of function hoisting to organize code with important functions at the top:
  ```javascript
  // Main functions at the top (these can call utility functions defined below)
  function processData(data) {
    const validated = validateInput(data)
    return transformData(validated)
  }

  // Utility functions at the bottom
  function validateInput(data) {
    // Implementation details...
  }

  function transformData(data) {
    // Implementation details...
  }
  ```

### Comments & Documentation

* Use `/* Section */` for grouping related functions
* Use `// comment` for single-line comments
* Mark unfinished code with `// TODO: description`
* Document abbreviations with "Short for" comments
* Document performance optimizations with comments
* Document edge cases and platform-specific behavior

### Import & Export Patterns

* Group imports at the top of files
* Use consistent single-letter aliases (l for lang, i for iter, etc.)
* Use named exports only, never default exports
* Export each function individually rather than in groups
* Maintain minimal cross-module dependencies

## Design Guidelines for New Code

### Function Signatures
* Use standard variable and parameter names based on role and type:

  **For role-based variables (prefer these):**
  * `val` for generic values (when no better name exists)
  * `src` for source data in transformations
  * `tar` for targets of modification
  * `mod` for modifications
  * `opt` for options
  * `ctx` for context
  * `acc` for accumulator

  **For type-based variables (when role isn't clear):**
  * `str` for strings
  * `num` for numbers
  * `obj` for objects
  * `arr` for arrays

  **For domain-specific variables**, use short but descriptive names without abbreviation requirements

  **Exceptions:** Single-letter import aliases (`l`, `i`, `o`, `s`, etc.) and the element creator `E`

  See guidelines.md for the complete list
* Functions should be small, simple, focused and do one thing well
* Functions should have single purposes with descriptive names
* Follow established patterns (`is*`, `req*`, `opt*`, `only*`, etc.)
* Avoid parameter defaults; use separate functions for variant behavior

### Error Handling
* Validate parameters early (fail fast)
* Throw descriptive TypeErrors with informative messages
* Include value type and expected type in error messages
* Use error factories from `lang.mjs` when possible

### Documentation Style
* Add inline comments for non-obvious code and optimizations
* Mark unfinished code with `TODO` comments
* Group related functions with section comments
* Document edge cases and platform-specific behavior
* Each exported function/class should have a clear purpose
* Documentation lives in `/doc/` and is compiled to `/docs/`
* Include examples for non-obvious functionality

### Type Safety
* Prefer tight constraints with explicit validation
* Validate parameters before using them
* Use dedicated type validators from `lang.mjs`
* Use the consistent pattern for type validation variants:
  * `isThing` — Returns boolean indicating if value matches type
  * `reqThing` — Requires value to match type, throws otherwise
  * `optThing` — Accepts the type or null/undefined
  * `onlyThing` — Returns value if it matches type, otherwise undefined
  * `laxThing` — Returns default value if nil, otherwise requires type
* Place validation at the beginning of functions with early returns

### Return Values
* Functions return validated value when successful
* Methods often return `this` for chaining
* Transformational functions return new values (don't modify inputs)
* Mutation functions should be explicit and return the modified object

### Code Organization
* Group related functions together
* Keep internal helpers private (non-exported)
* Separate type checking from business logic
* Use small, focused classes with single responsibilities

### Performance Considerations
* Prioritize performance with carefully documented optimizations
* Use null prototype objects with `Emp()` for dictionaries instead of plain objects
* Minimize unnecessary object creation and property access
* Use symbols for private properties
* Prefer while loops with pre-increment for performance-critical iterations:
  ```javascript
  // More efficient loop with cached length and pre-increment
  let ind = -1
  const len = arr.length
  while (++ind < len) {
    const val = arr[ind]
    // Process val
  }
  ```
* Cache array/string length in variables when iterating in loops
* Consider memory usage and garbage collection patterns
* Use `isX` type checks before expensive operations when possible
* Consider adding `// TODO tune perf` comments for future optimization points

### Class Implementation
* Use class declarations for objects with behavior
* Extend `l.Emp()` instead of `Object` for lightweight inheritance
* Use method shorthand syntax in class bodies
* Use explicit getter/setter syntax for properties with computed values
* Define instance methods with standard syntax, not arrow functions
* Use static methods for factory patterns and class-related utilities
* Make chainable methods return `this`

## Build & Test Commands

```sh
# Testing
make test            # Run all tests
make test_w          # Watch mode for tests
make feat=lang test  # Test specific module

# Linting
make lint       # Run linters (deno & eslint)
make lint_w     # Watch mode for linting

# Documentation
make doc        # Generate documentation
make doc_w      # Watch mode for documentation

# Development
make watch      # Watch mode for tests, lint, and docs
make prep       # Test, lint, and generate docs

# Publishing
make pub        # Tag and push for publishing
```

## Testing Approach

* Uses a custom test framework defined in `test.mjs`
* Each module has corresponding test file in `/test/` directory
* Test files follow naming pattern: `modulename_test.mjs`
* Test assertions use `t.eq()`, `t.ok()`, `t.throws()`, etc.
* Benchmarks are available with `make bench`

### Testing Best Practices

* Test type validations with both valid and invalid inputs
* Test error handling with expected exceptions
* Verify immutability of operations where expected
* Use `t.is` for comparing primitive values (numbers, strings, booleans)
* Use `t.eq` only for deep equality comparisons of objects and arrays
* Test both normal and edge cases for functions
* Test compatibility across supported environments
