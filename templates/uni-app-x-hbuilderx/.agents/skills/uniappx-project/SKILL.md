---
name: uniappx-project
description: "Provides per-component and per-API examples with platform compatibility details for uni-app-x (Vue 3 + TypeScript + Vite). Use when the user needs official uni-app-x built-in components, API references with examples, cross-platform compatibility checks, or conditional compilation guidance for uni-app-x projects."
license: Complete terms in LICENSE.txt
---

## When to use this skill

Use this skill whenever the user wants to:
- Use any uni-app-x built-in component
- Use any uni-app-x API (network, storage, device, UI, navigation, media, etc.)
- Access per-component or per-API examples with official doc links
- Check platform compatibility for components and APIs in uni-app-x
- Build uni-app-x applications with Vue 3 + TypeScript + Vite

## How to use this skill

This skill is organized to match the official uni-app-x components and API documentation:

1. **Choose component or API category**:
   - Components → `examples/components/built-in/`
   - APIs → `examples/api/` (categorized by domain)

2. **Open the matching example file**:
   - Each component or API has its own example file
   - Each example includes the official documentation URL
   - Examples mirror the official documentation examples

3. **Use references when you need full specs**:
   - `references/components/built-in/` for built-in components
   - `references/api/` for API parameter/return/compatibility details

## Examples and References

### Components (Built-in)
- Examples: `examples/components/built-in/*.md`
- References: `references/components/built-in/*.md`
- Official docs: https://doc.dcloud.net.cn/uni-app-x/component/

### APIs
- Examples: `examples/api/{category}/*.md`
- References: `references/api/*.md`
- Official docs: https://doc.dcloud.net.cn/uni-app-x/api/

## Best Practices

1. **One file per component/API**: Each component and API has an independent example file with official doc link.
2. **Follow platform compatibility**: Check the compatibility section in each example/reference.
3. **Use conditional compilation**: Use `#ifdef`/`#endif` for platform-specific logic.
4. **Keep examples aligned**: Use the official documentation examples as the source of truth.
5. **Prefer references for specs**: Use `references/` for full parameter tables and compatibility.

## Resources

- **Components**: https://doc.dcloud.net.cn/uni-app-x/component/
- **APIs**: https://doc.dcloud.net.cn/uni-app-x/api/
- **uni-app-x**: https://doc.dcloud.net.cn/uni-app-x/

## Keywords

uniappx, uni-app-x, components, api, built-in components, examples, references, Vue 3, TypeScript, Vite, H5, App, mini program, 跨平台, 组件, API, 官方文档
