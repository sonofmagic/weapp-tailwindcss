---
"weapp-tailwindcss": patch
---

Fix css-macro conditional comment generation for logical platform expressions.

- Normalize `ifdef/ifndef` conditions like `H5||APP` and `H5_||_APP` to the uni-app style `H5 || APP`.
- Keep escaped expressions (such as `H5\\_||\\_MP-WEIXIN`) as literals.
- Ensure emitted conditional comments are always valid paired blocks (`#ifdef/#endif` and `#ifndef/#endif`) without nested `#ifndef` expansion.
- Restore stable CSS output generation in uni-app scenarios using `ifdef-[...]` class macros.
