import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const braces = require("braces");
const isDepthError = (error) =>
  error instanceof SyntaxError && /nesting depth exceeds limit/.test(error.message);

test("ordinary glob patterns keep their behavior", () => {
  assert.equal(braces.compile("src/{app,worker}/*.ts"), "src/(app|worker)/*.ts");
  assert.deepEqual(braces.expand("file-{1..3}.ts"), ["file-1.ts", "file-2.ts", "file-3.ts"]);
  assert.deepEqual(braces.expand("{a,{b,c}}"), ["a", "b", "c"]);
  assert.equal(braces.stringify("{a,b}"), "{a,b}");
  const literal = "\"" + "{".repeat(200) + "\"";
  assert.equal(braces.stringify(literal), "{".repeat(200));
});

for (const method of ["parse", "compile", "expand", "stringify"]) {
  test(`${method} rejects hostile nesting before stack exhaustion`, () => {
    for (const [open, close] of [["{", "}"], ["(", ")"]]) {
      const pattern = open.repeat(4000) + "a" + close.repeat(4000);
      assert.throws(() => braces[method](pattern), isDepthError);
      assert.doesNotThrow(() => braces[method](open.repeat(99) + "a" + close.repeat(99)));
    }
  });
}

for (const method of ["compile", "expand", "stringify"]) {
  test(`${method} also guards AST input that bypasses parsing`, () => {
    let ast = { type: "text", value: "a", nodes: [] };
    for (let depth = 0; depth < 4000; depth++) {
      ast = { type: "root", nodes: [ast] };
    }
    assert.throws(() => braces[method](ast), isDepthError);
  });
}
