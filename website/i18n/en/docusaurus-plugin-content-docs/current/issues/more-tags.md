---
title: Generated styles only apply to view and text tags
description: In the WeChat applet, after darkMode is set to class/selector, the dark:className class selector is invalid on the button. It can be seen that the generated style only affects the view and text tags.
keywords:
  - FAQ
  - Troubleshooting
  - compatibility
  - Generated styles only apply to view and text tags
  - issues
  - more tags
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# Generated styles only apply to view and text tags

In the WeChat applet, after `darkMode` is set to `class`/

This is because the applet does not accept a selector such as `*`.

By default, `weapp-tailwindcss` will convert the `*` selector into the `view,text` selector

This configuration can be changed via `cssOptions.cssSelectorReplacement.universal` to adapt to more tags.

See [`cssOptions`](/docs/api/options/important#cssoptions) for details
