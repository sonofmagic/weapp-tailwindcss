from __future__ import annotations

from pathlib import Path
from shutil import copy2

from PIL import Image, ImageOps
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt


OUT = Path("talk/2026-04-02-live/2026-04-02-live-deck.pptx")
BACKUP = Path("talk/2026-04-02-live/2026-04-02-live-deck.original.pptx")
LOGO = Path("assets/logo.png")
PLUGINS_IMG = Path("assets/weapp-tw-plugins.png")
FRAMEWORKS_IMG = Path("assets/weapp-tw-frameworks.png")
RELEASE_IMG = Path("website/blog/2025/3/assets/v4-release.png")
LAYER_IMG = Path("website/docs/quick-start/v4/tailwindcss-v4-uniapp-layer.png")
CREATE_PROJECT_IMG = Path("website/static/img/create-project.png")
DEMO_LOGO = Path("demo/uni-app-tailwindcss-v4/src/static/logo.png")
GENERATED_DIR = Path("talk/2026-04-02-live/assets/generated")
SHOWCASE_COLLAGE = GENERATED_DIR / "showcase-collage.png"

INK = RGBColor(10, 15, 27)
SURFACE = RGBColor(19, 28, 46)
SURFACE_2 = RGBColor(30, 41, 59)
TEXT = RGBColor(244, 248, 255)
MUTED = RGBColor(148, 163, 184)
CYAN = RGBColor(34, 211, 238)
CYAN_2 = RGBColor(14, 165, 233)
EMERALD = RGBColor(52, 211, 153)
AMBER = RGBColor(251, 191, 36)
ROSE = RGBColor(251, 113, 133)
WHITE = RGBColor(255, 255, 255)

POSTINSTALL_SNIPPET = """{
  "scripts": {
    "dev": "npm run dev:mp-weixin",
    "build:mp-weixin": "node ../../scripts/uni-build-guard.mjs build -p mp-weixin",
    "postinstall": "weapp-tw patch"
  }
}"""

VITE_SNIPPET = """plugins: [
  uni(),
  tailwindcss(),
  UnifiedViteWeappTailwindcssPlugin({
    rem2rpx: true,
    cssEntries: [
      path.resolve(__dirname, "src/main.css"),
      path.resolve(__dirname, "src/common.css"),
    ],
  }),
]"""

MAIN_CSS_SNIPPET = """@import "weapp-tailwindcss";
@config "../tailwind.config.js";

@theme {
  --color-neutral-1B: #1b1b1b;
  --color-midnight: #121063;
  --color-tahiti: #3ab7bf;
  --color-bermuda: #78dcca;
}"""

INDEX_SNIPPET = """<view :class="className" class="aspect-[calc(4*3+1)/3]">
  {{ className }}
</view>

const className = ref(
  'bg-[#0000ff] text-[45rpx] text-white'
)"""

PROMPT_SNIPPET = """请帮我生成一组适合小程序页面的 Tailwind 类名，不要写 CSS。
目标是一个渐变卡片：
- 大圆角
- 蓝青色渐变背景
- 柔和阴影
- 标题 32rpx，加粗
- 副标题 24rpx，透明度略低
- 底部一个白底深色字按钮"""

SKILL_PROMPT_SNIPPET = """我现在是 uni-app cli vue3 vite 项目，目标端是微信小程序 + H5。
请按 weapp-tailwindcss skill 给我最小可用配置。
输出需要包含：
1. 安装命令
2. 完整配置文件
3. 页面示例
4. 验证步骤
5. 回滚方案"""

SHOWCASE_IMAGES = [
    Path("website/static/img/showcase/001.区白白/02-1.png"),
    Path("website/static/img/showcase/005.安心校友圈/02-安心-首页.jpg"),
    Path("website/static/img/showcase/010.小而美工具/02-image.png"),
    Path("website/static/img/showcase/011.元气番茄钟/01-image.jpg"),
]


SLIDES = [
    {
        "layout": "title",
        "kicker": "2026-04-02 LIVE",
        "title": "小程序还能这么写？",
        "subtitle": "AI 出样式，Tailwind 跑全端",
        "body": "一句话描述界面 -> AI 生成 Tailwind 类名 -> weapp-tailwindcss 自动转译 -> 小程序直接预览",
        "chips": ["痛点重述", "AI 出 UI", "Tailwind 语言层", "工程化落地"],
    },
    {
        "layout": "questions",
        "title": "灵魂拷问",
        "subtitle": "你到底花了多少时间在写样式？",
        "items": [
            "上周写了多少行样式？",
            "花了多少时间调 margin / padding / radius / shadow？",
            "你是在写业务，还是在做像素搬运？",
        ],
        "note": "小程序场景还要额外承担平台差异、单位适配和多端一致性。",
    },
    {
        "layout": "grid4",
        "title": "为什么小程序样式开发一直慢",
        "subtitle": "不是你不努力，是旧范式本来就低效",
        "items": ["表达成本高", "试错成本高", "跨端一致性差", "反馈链路长"],
    },
    {
        "layout": "compare",
        "title": "旧范式 vs 新范式",
        "subtitle": "从“手写属性”切到“表达意图”",
        "left_title": "旧范式",
        "left_items": ["先想 CSS 属性", "一条一条试", "人肉反复试错"],
        "right_title": "新范式",
        "right_items": ["先说清界面意图", "AI 给第一版结果", "Tailwind 做受约束表达"],
    },
    {
        "layout": "prompt",
        "title": "先看结果",
        "subtitle": "一句话，AI 出一版卡片样式",
        "prompt": "做一个渐变卡片，大圆角，柔和阴影，标题 32rpx，副标题 24rpx，底部一个高亮 CTA。不要写传统 CSS，直接给我 Tailwind 类名。",
        "bullets": ["渐变卡片", "大圆角", "柔和阴影", "标题 / 副标题 / CTA"],
    },
    {
        "layout": "grid4",
        "title": "为什么是 Tailwind，不是直接写 CSS",
        "subtitle": "Tailwind 是更适合 AI 的样式语言",
        "items": ["可枚举", "可组合", "可约束", "更稳定"],
    },
    {
        "layout": "flow3",
        "title": "三层模型",
        "subtitle": "意图 -> 原子类 -> 小程序适配",
        "items": ["你：描述界面意图", "AI：生成 Tailwind 类名", "weapp-tailwindcss：翻译成小程序结果"],
        "note": "AI 不直接对接小程序，它先对接 Tailwind 这层表达语言。",
    },
    {
        "layout": "stack",
        "title": "weapp-tailwindcss 在做什么",
        "subtitle": "不只是插件，而是一条工程链路",
        "items": [
            "Tailwind 小程序全方面解决方案",
            "多构建工具基底支持",
            "多框架、多端与运行时适配",
            "把“能写 Tailwind”升级成“能稳定运行”",
        ],
    },
    {
        "layout": "chips",
        "title": "支持范围",
        "subtitle": "覆盖主流小程序开发路线",
        "items": ["webpack", "vite", "rspack", "rollup", "rolldown", "gulp"],
        "note": "支持的是这些构建工具基底，以及其上游框架生态。",
    },
    {
        "layout": "repo",
        "title": "仓库不是 PPT 工程",
        "subtitle": "它同时有 demo、templates、Skill、E2E、benchmark",
        "items": ["demo/*", "templates.jsonc", "skills/weapp-tailwindcss", "watch / HMR 回归", "framework benchmark"],
    },
    {
        "layout": "focus",
        "title": "主 Demo 选型",
        "subtitle": "demo/uni-app-tailwindcss-v4",
        "items": ["直观", "稳定", "贴近日常业务", "适合直播"],
        "note": "现场适合展示 patch、vite 插件、样式入口和页面类名。",
    },
    {
        "layout": "config",
        "title": "关键配置 1",
        "subtitle": 'postinstall: "weapp-tw patch"',
        "items": ["patch 链路不能漏", "任意值问题常和它有关", "JS / TS 字符串 class 也常和它有关"],
    },
    {
        "layout": "config",
        "title": "关键配置 2",
        "subtitle": "vite.config.ts",
        "items": ["uni()", "Tailwind 插件", "UnifiedViteWeappTailwindcssPlugin"],
    },
    {
        "layout": "config",
        "title": "关键配置 3",
        "subtitle": "src/main.css",
        "items": ["Tailwind 入口", "主题变量", "配置承载点"],
    },
    {
        "layout": "flow4",
        "title": "AI Skill",
        "subtitle": "让 AI 不只是写代码，而是按流程做事",
        "items": ["先收集上下文", "再输出配置", "再给验证步骤", "再给回滚方案"],
    },
    {
        "layout": "chips",
        "title": "Skill 先问什么",
        "subtitle": "最小上下文决定方案质量",
        "items": ["框架", "构建器", "目标端", "Tailwind 版本", "包管理器"],
        "note": "上下文不完整，AI 就会四处漏风。",
    },
    {
        "layout": "deliverables",
        "title": "Skill 输出什么",
        "subtitle": "不是一段代码，而是一套落地结果",
        "items": ["修改文件清单", "可复制配置", "安装命令", "验证步骤", "回滚方案"],
    },
    {
        "layout": "repo",
        "title": "进阶技巧",
        "subtitle": "这些地方最容易踩坑",
        "items": ["任意值与 rpx", "动态 class 要枚举", "space-y / space-x", "twMerge / cva / cn", "uni-app x"],
    },
    {
        "layout": "metrics",
        "title": "工程信号",
        "subtitle": "从“能跑”走向“可验证”",
        "items": ["HMR 报告", "framework benchmark", "用数据讨论体验"],
        "note": "重点不是某框架必赢，而是这套生态已经把问题工程化。",
    },
    {
        "layout": "closing",
        "title": "别再把样式开发当体力活",
        "subtitle": "从下一个页面开始试",
        "items": ["AI 写意图", "Tailwind 做语言", "weapp-tailwindcss 负责翻译", "先跑一个 demo，再用一句真实需求试一次"],
    },
]


def add_textbox(slide, left, top, width, height, text, *, size=24, color=TEXT, bold=False, align=PP_ALIGN.LEFT):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.text = text
    p.alignment = align
    run = p.runs[0]
    run.font.name = "PingFang SC"
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return box


def add_card(slide, left, top, width, height, fill, radius=MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE):
    shape = slide.shapes.add_shape(radius, left, top, width, height)
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.color.rgb = fill
    return shape


def add_picture(slide, path: Path, left, top, width=None, height=None):
    if path.exists():
        if width is not None and height is not None:
            return slide.shapes.add_picture(str(path), left, top, width=width, height=height)
        if width is not None:
            return slide.shapes.add_picture(str(path), left, top, width=width)
        if height is not None:
            return slide.shapes.add_picture(str(path), left, top, height=height)
        return slide.shapes.add_picture(str(path), left, top)
    return None


def add_code_block(slide, left, top, width, height, title, code):
    add_card(slide, left, top, width, height, SURFACE)
    add_textbox(slide, left + Inches(0.18), top + Inches(0.12), width - Inches(0.4), Inches(0.22), title, size=11, color=CYAN, bold=True)
    box = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.42), width - Inches(0.4), height - Inches(0.55))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = code
    run = p.runs[0]
    run.font.name = "Menlo"
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(226, 232, 240)
    return box


def ensure_generated_assets():
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)
    if SHOWCASE_COLLAGE.exists():
        return
    canvas = Image.new("RGB", (1600, 900), (10, 15, 27))
    slots = [
        (40, 40, 340, 380),
        (420, 40, 340, 380),
        (800, 40, 760, 380),
        (40, 460, 1520, 400),
    ]
    for src, slot in zip(SHOWCASE_IMAGES, slots):
        if not src.exists():
            continue
        img = Image.open(src).convert("RGB")
        fitted = ImageOps.fit(img, (slot[2], slot[3]), method=Image.Resampling.LANCZOS)
        canvas.paste(fitted, (slot[0], slot[1]))
    canvas.save(SHOWCASE_COLLAGE)


def apply_background(slide, page_num):
    bg = slide.background.fill
    bg.solid()
    bg.fore_color.rgb = INK
    accent = slide.shapes.add_shape(MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0, 0, Inches(0.12), Inches(7.5))
    accent.fill.solid()
    accent.fill.fore_color.rgb = CYAN
    accent.line.color.rgb = CYAN
    add_textbox(slide, Inches(12.3), Inches(7.02), Inches(0.6), Inches(0.24), f"{page_num:02d}", size=11, color=MUTED, align=PP_ALIGN.RIGHT)


def add_header(slide, title, subtitle):
    add_textbox(slide, Inches(0.7), Inches(0.48), Inches(8.8), Inches(0.6), title, size=27, bold=True)
    add_textbox(slide, Inches(0.72), Inches(1.08), Inches(9.6), Inches(0.36), subtitle, size=13, color=MUTED)


def build(prs: Presentation):
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]
    for idx, spec in enumerate(SLIDES, start=1):
        slide = prs.slides.add_slide(blank)
        apply_background(slide, idx)
        layout = spec["layout"]
        if layout == "title":
            add_picture(slide, LOGO, Inches(11.62), Inches(0.46), width=Inches(0.7), height=Inches(0.7))
            add_textbox(slide, Inches(0.9), Inches(0.72), Inches(2.2), Inches(0.3), spec["kicker"], size=11, color=CYAN, bold=True)
            add_textbox(slide, Inches(0.88), Inches(1.38), Inches(7.4), Inches(1.4), spec["title"], size=29, bold=True)
            add_textbox(slide, Inches(0.88), Inches(2.34), Inches(6.8), Inches(0.6), spec["subtitle"], size=22, color=WHITE)
            add_card(slide, Inches(0.88), Inches(3.22), Inches(5.95), Inches(1.14), SURFACE)
            add_textbox(slide, Inches(1.12), Inches(3.5), Inches(5.5), Inches(0.6), spec["body"], size=14)
            for i, chip in enumerate(spec["chips"]):
                left = Inches(0.9 + (i % 2) * 2.25)
                top = Inches(5.18 + (i // 2) * 0.74)
                add_card(slide, left, top, Inches(2.0), Inches(0.5), SURFACE_2)
                add_textbox(slide, left + Inches(0.16), top + Inches(0.12), Inches(1.7), Inches(0.2), chip, size=11)
            hero = add_card(slide, Inches(8.12), Inches(1.18), Inches(4.45), Inches(4.95), SURFACE)
            hero.fill.fore_color.rgb = RGBColor(15, 23, 42)
            add_textbox(slide, Inches(8.55), Inches(1.7), Inches(3.5), Inches(0.4), "意图 -> 原子类 -> 运行结果", size=15, color=CYAN, bold=True)
            for i, word in enumerate(["Prompt", "Tailwind", "weapp-tw", "Preview"]):
                y = 2.4 + i * 0.8
                add_card(slide, Inches(8.58), Inches(y), Inches(3.3), Inches(0.46), [CYAN_2, EMERALD, AMBER, ROSE][i])
                add_textbox(slide, Inches(8.76), Inches(y + 0.11), Inches(2.9), Inches(0.2), word, size=12, color=INK, bold=True)
            continue

        if layout != "closing":
            add_header(slide, spec["title"], spec["subtitle"])

        if layout == "questions":
            add_textbox(slide, Inches(0.95), Inches(1.75), Inches(6.6), Inches(0.9), "你不是在写样式。\n你是在付出反复试错的时间税。", size=25, bold=True)
            for i, item in enumerate(spec["items"]):
                top = Inches(3.1 + i * 0.92)
                add_card(slide, Inches(0.95), top, Inches(6.2), Inches(0.62), SURFACE)
                add_textbox(slide, Inches(1.16), top + Inches(0.15), Inches(5.7), Inches(0.22), item, size=14.5, bold=True)
            add_card(slide, Inches(8.0), Inches(1.92), Inches(4.0), Inches(3.9), SURFACE_2)
            add_textbox(slide, Inches(8.34), Inches(2.25), Inches(3.0), Inches(0.32), "额外负担", size=14, color=CYAN, bold=True)
            for i, word in enumerate(["平台差异", "单位适配", "多端一致性"]):
                top = Inches(2.95 + i * 0.82)
                add_card(slide, Inches(8.36), top, Inches(2.95), Inches(0.48), RGBColor(13, 47, 66) if i != 1 else RGBColor(6, 119, 98))
                add_textbox(slide, Inches(8.5), top + Inches(0.12), Inches(2.65), Inches(0.16), word, size=12.5, bold=True, align=PP_ALIGN.CENTER)
            add_textbox(slide, Inches(8.34), Inches(5.02), Inches(3.1), Inches(0.58), spec["note"], size=13.5, color=MUTED)
        elif layout == "grid4":
            if spec["title"] == "为什么小程序样式开发一直慢":
                add_textbox(slide, Inches(0.95), Inches(1.78), Inches(8.8), Inches(0.75), "慢，不是因为你不熟。\n是因为这条链路从一开始就没把“表达”和“验证”分开。", size=23, bold=True)
                positions = [(0.95, 3.12), (6.42, 3.12), (0.95, 4.74), (6.42, 4.74)]
                colors = [SURFACE, SURFACE_2, RGBColor(18, 39, 66), RGBColor(34, 45, 70)]
                for (x, y), item, fill in zip(positions, spec["items"], colors):
                    add_card(slide, Inches(x), Inches(y), Inches(4.72), Inches(1.16), fill)
                    add_textbox(slide, Inches(x + 0.22), Inches(y + 0.34), Inches(4.15), Inches(0.28), item, size=18, bold=True)
                add_card(slide, Inches(11.55), Inches(2.1), Inches(0.34), Inches(3.95), CYAN)
            elif spec["title"] == "为什么是 Tailwind，不是直接写 CSS":
                add_card(slide, Inches(0.95), Inches(2.0), Inches(4.25), Inches(3.95), SURFACE)
                add_textbox(slide, Inches(1.28), Inches(2.45), Inches(3.35), Inches(0.5), "结构化语言", size=28, color=CYAN, bold=True)
                add_textbox(slide, Inches(1.28), Inches(3.18), Inches(3.35), Inches(1.35), "比自由 CSS 更可枚举、更可约束，也更适合 AI 稳定输出。", size=16)
                positions = [(5.62, 2.05), (8.92, 2.05), (5.62, 4.08), (8.92, 4.08)]
                colors = [SURFACE, SURFACE_2, RGBColor(18, 39, 66), RGBColor(34, 45, 70)]
                for (x, y), item, fill in zip(positions, spec["items"], colors):
                    add_card(slide, Inches(x), Inches(y), Inches(2.95), Inches(1.58), fill)
                    add_textbox(slide, Inches(x), Inches(y + 0.55), Inches(2.95), Inches(0.25), item, size=18, bold=True, align=PP_ALIGN.CENTER)
            else:
                positions = [(0.9, 1.9), (6.75, 1.9), (0.9, 4.1), (6.75, 4.1)]
                colors = [SURFACE, SURFACE_2, RGBColor(18, 39, 66), RGBColor(34, 45, 70)]
                for (x, y), item, fill in zip(positions, spec["items"], colors):
                    add_card(slide, Inches(x), Inches(y), Inches(5.2), Inches(1.55), fill)
                    add_textbox(slide, Inches(x + 0.28), Inches(y + 0.46), Inches(4.6), Inches(0.5), item, size=21, bold=True)
        elif layout == "compare":
            add_card(slide, Inches(0.92), Inches(1.85), Inches(5.75), Inches(4.45), SURFACE)
            add_card(slide, Inches(6.78), Inches(1.85), Inches(5.65), Inches(4.45), RGBColor(7, 53, 64))
            add_textbox(slide, Inches(1.18), Inches(2.15), Inches(1.8), Inches(0.3), spec["left_title"], size=16, color=ROSE, bold=True)
            add_textbox(slide, Inches(7.05), Inches(2.15), Inches(1.8), Inches(0.3), spec["right_title"], size=16, color=EMERALD, bold=True)
            for i, item in enumerate(spec["left_items"]):
                add_textbox(slide, Inches(1.18), Inches(2.8 + i * 0.92), Inches(4.8), Inches(0.4), f"• {item}", size=21)
            for i, item in enumerate(spec["right_items"]):
                add_textbox(slide, Inches(7.05), Inches(2.8 + i * 0.92), Inches(4.8), Inches(0.4), f"• {item}", size=21)
        elif layout == "prompt":
            add_code_block(slide, Inches(0.9), Inches(1.9), Inches(6.15), Inches(4.65), "Prompt 示例", PROMPT_SNIPPET)
            card = add_card(slide, Inches(7.48), Inches(2.1), Inches(4.82), Inches(3.88), RGBColor(12, 74, 110))
            card.line.color.rgb = CYAN
            add_textbox(slide, Inches(7.83), Inches(2.52), Inches(4.0), Inches(0.4), "渐变卡片", size=21, bold=True)
            add_textbox(slide, Inches(7.83), Inches(3.05), Inches(3.8), Inches(0.35), "AI 直接生成第一版 UI 语言", size=13, color=WHITE)
            for i, bullet in enumerate(spec["bullets"]):
                add_card(slide, Inches(7.82), Inches(3.74 + i * 0.48), Inches(1.66), Inches(0.33), CYAN if i % 2 == 0 else EMERALD)
                add_textbox(slide, Inches(8.02), Inches(3.8 + i * 0.48), Inches(3.4), Inches(0.2), bullet, size=11, color=INK, bold=True)
        elif layout == "flow3":
            colors = [CYAN_2, EMERALD, AMBER]
            add_card(slide, Inches(0.95), Inches(1.95), Inches(3.1), Inches(0.56), SURFACE)
            add_textbox(slide, Inches(1.14), Inches(2.1), Inches(2.7), Inches(0.18), "记住这一张，整场直播都在解释它", size=12.5, color=MUTED)
            for i, item in enumerate(spec["items"]):
                left = Inches(0.95 + i * 4.0)
                add_card(slide, left, Inches(2.65), Inches(3.0), Inches(1.8), colors[i])
                add_textbox(slide, left + Inches(0.22), Inches(3.1), Inches(2.55), Inches(0.7), item, size=18, color=INK, bold=True)
                if i < 2:
                    add_textbox(slide, left + Inches(3.1), Inches(3.15), Inches(0.7), Inches(0.3), "→", size=24, color=MUTED, bold=True, align=PP_ALIGN.CENTER)
            add_textbox(slide, Inches(0.95), Inches(5.65), Inches(11.0), Inches(0.35), spec["note"], size=14, color=MUTED)
        elif layout == "stack":
            add_picture(slide, LAYER_IMG, Inches(7.45), Inches(1.7), width=Inches(4.55), height=Inches(3.5))
            widths = [5.6, 5.1, 4.6, 4.1]
            fills = [RGBColor(13, 47, 66), RGBColor(10, 67, 96), RGBColor(7, 90, 130), RGBColor(4, 112, 162)]
            for i, item in enumerate(spec["items"]):
                left = Inches(0.95 + i * 0.26)
                top = Inches(5.38 - i * 0.73)
                add_card(slide, left, top, Inches(widths[i]), Inches(0.6), fills[i])
                add_textbox(slide, left + Inches(0.18), top + Inches(0.14), Inches(widths[i] - 0.32), Inches(0.2), item, size=12.5, bold=True)
        elif layout == "chips":
            if spec["title"] == "支持范围":
                add_picture(slide, PLUGINS_IMG, Inches(0.95), Inches(2.02), width=Inches(5.45), height=Inches(1.95))
                add_picture(slide, FRAMEWORKS_IMG, Inches(6.82), Inches(2.02), width=Inches(5.45), height=Inches(1.95))
                for i, item in enumerate(spec["items"]):
                    left = Inches(0.98 + i * 1.95)
                    top = Inches(4.72)
                    add_card(slide, left, top, Inches(1.62), Inches(0.52), SURFACE)
                    add_textbox(slide, left, top + Inches(0.12), Inches(1.62), Inches(0.2), item, size=11, bold=True, align=PP_ALIGN.CENTER)
                add_textbox(slide, Inches(0.95), Inches(5.58), Inches(10.8), Inches(0.28), spec["note"], size=13.5, color=MUTED)
            elif spec["title"] == "Skill 先问什么":
                add_textbox(slide, Inches(0.95), Inches(1.82), Inches(6.4), Inches(0.52), "先问对，再输出。\n上下文不完整，AI 只会把错误放大。", size=22, bold=True)
                add_picture(slide, CREATE_PROJECT_IMG, Inches(8.1), Inches(1.88), width=Inches(3.55), height=Inches(1.72))
                for i, item in enumerate(spec["items"]):
                    left = Inches(0.98 + (i % 3) * 2.18)
                    top = Inches(3.45 + (i // 3) * 1.12)
                    add_card(slide, left, top, Inches(1.8), Inches(0.72), SURFACE if i % 2 == 0 else SURFACE_2)
                    add_textbox(slide, left, top + Inches(0.19), Inches(1.8), Inches(0.22), item, size=14.5, bold=True, align=PP_ALIGN.CENTER)
                add_textbox(slide, Inches(8.08), Inches(4.02), Inches(3.35), Inches(0.8), spec["note"], size=13.5, color=MUTED)
            else:
                for i, item in enumerate(spec["items"]):
                    left = Inches(0.95 + (i % 3) * 4.03)
                    top = Inches(2.3 + (i // 3) * 1.28)
                    add_card(slide, left, top, Inches(3.25), Inches(0.82), SURFACE)
                    add_textbox(slide, left + Inches(0.2), top + Inches(0.22), Inches(2.85), Inches(0.3), item, size=18, bold=True, align=PP_ALIGN.CENTER)
                add_textbox(slide, Inches(0.95), Inches(5.55), Inches(10.8), Inches(0.3), spec["note"], size=14, color=MUTED)
        elif layout == "repo":
            if spec["title"] == "仓库不是 PPT 工程":
                add_picture(slide, RELEASE_IMG, Inches(7.25), Inches(1.78), width=Inches(4.95), height=Inches(3.1))
                add_picture(slide, SHOWCASE_COLLAGE, Inches(7.02), Inches(4.88), width=Inches(5.2), height=Inches(1.55))
                add_textbox(slide, Inches(7.22), Inches(6.5), Inches(4.6), Inches(0.28), "不是概念图，是真仓库、真模板、真发布节奏，也有真实落地案例。", size=11.5, color=MUTED)
                for i, item in enumerate(spec["items"]):
                    left = Inches(0.95 + (i % 1) * 5.95)
                    top = Inches(1.96 + i * 0.82)
                    add_card(slide, left, top, Inches(5.55), Inches(0.58), SURFACE if i % 2 == 0 else SURFACE_2)
                    add_textbox(slide, left + Inches(0.18), top + Inches(0.15), Inches(5.05), Inches(0.18), item, size=13, bold=True)
            elif spec["title"] == "进阶技巧":
                add_textbox(slide, Inches(0.95), Inches(1.82), Inches(5.7), Inches(0.5), "最容易翻车的不是语法。\n而是类名生成、枚举边界和端侧约束。", size=20, bold=True)
                add_code_block(slide, Inches(7.15), Inches(1.9), Inches(5.0), Inches(2.3), "真实写法锚点", INDEX_SNIPPET)
                for i, item in enumerate(spec["items"]):
                    left = Inches(0.95 + (i % 1) * 5.95)
                    top = Inches(2.78 + i * 0.64)
                    add_card(slide, left, top, Inches(5.45), Inches(0.54), SURFACE if i % 2 == 0 else SURFACE_2)
                    add_textbox(slide, left + Inches(0.18), top + Inches(0.14), Inches(5.0), Inches(0.16), item, size=12.5, bold=True)
            else:
                for i, item in enumerate(spec["items"]):
                    left = Inches(0.95 + (i % 2) * 5.95)
                    top = Inches(1.95 + (i // 2) * 1.18)
                    add_card(slide, left, top, Inches(5.2), Inches(0.84), SURFACE if i % 2 == 0 else SURFACE_2)
                    add_textbox(slide, left + Inches(0.22), top + Inches(0.2), Inches(4.7), Inches(0.3), item, size=18, bold=True)
        elif layout == "focus":
            add_card(slide, Inches(0.95), Inches(2.0), Inches(5.75), Inches(3.95), SURFACE)
            add_textbox(slide, Inches(1.22), Inches(2.35), Inches(5.0), Inches(0.35), "主讲目录", size=13, color=CYAN, bold=True)
            add_textbox(slide, Inches(1.22), Inches(2.78), Inches(4.9), Inches(1.0), "demo/uni-app-tailwindcss-v4", size=24, bold=True)
            add_textbox(slide, Inches(1.22), Inches(4.6), Inches(4.7), Inches(0.5), spec["note"], size=15)
            add_code_block(slide, Inches(7.08), Inches(1.9), Inches(5.15), Inches(2.15), "index.vue 真实片段", INDEX_SNIPPET)
            add_picture(slide, DEMO_LOGO, Inches(7.18), Inches(4.48), width=Inches(0.82), height=Inches(0.82))
            for i, item in enumerate(spec["items"]):
                left = Inches(7.18 + (i % 2) * 2.4)
                top = Inches(5.0 + (i // 2) * 0.86)
                add_card(slide, left, top, Inches(2.18), Inches(0.95), RGBColor(7, 90, 130) if i < 2 else RGBColor(6, 119, 98))
                add_textbox(slide, left, top + Inches(0.3), Inches(2.18), Inches(0.3), item, size=18, color=INK, bold=True, align=PP_ALIGN.CENTER)
        elif layout == "config":
            add_card(slide, Inches(0.95), Inches(1.92), Inches(11.45), Inches(0.84), RGBColor(14, 165, 233))
            label = "真实配置片段" if spec["title"].endswith("1") else "插件链路片段" if spec["title"].endswith("2") else "样式入口片段"
            add_textbox(slide, Inches(1.24), Inches(2.18), Inches(10.8), Inches(0.25), label, size=19, color=INK, bold=True)
            snippet = POSTINSTALL_SNIPPET if spec["title"].endswith("1") else VITE_SNIPPET if spec["title"].endswith("2") else MAIN_CSS_SNIPPET
            code_title = "package.json" if spec["title"].endswith("1") else "vite.config.ts" if spec["title"].endswith("2") else "src/main.css"
            add_code_block(slide, Inches(0.95), Inches(3.05), Inches(6.65), Inches(3.1), code_title, snippet)
            if spec["title"].endswith("3"):
                add_picture(slide, LOGO, Inches(10.55), Inches(2.2), width=Inches(1.0), height=Inches(1.0))
            for i, item in enumerate(spec["items"]):
                left = Inches(7.98)
                top = Inches(3.1 + i * 0.94)
                add_card(slide, left, top, Inches(3.96), Inches(0.62), SURFACE if i != 1 else SURFACE_2)
                add_textbox(slide, left + Inches(0.18), top + Inches(0.16), Inches(3.58), Inches(0.2), item, size=13.5, bold=True)
        elif layout == "flow4":
            colors = [CYAN_2, CYAN, EMERALD, AMBER]
            add_picture(slide, LOGO, Inches(11.1), Inches(1.72), width=Inches(0.86), height=Inches(0.86))
            add_code_block(slide, Inches(0.95), Inches(1.95), Inches(4.2), Inches(1.55), "Skill 输入风格", SKILL_PROMPT_SNIPPET)
            for i, item in enumerate(spec["items"]):
                left = Inches(0.75 + i * 3.1)
                add_card(slide, left, Inches(4.05), Inches(2.35), Inches(1.02), colors[i])
                add_textbox(slide, left + Inches(0.14), Inches(4.31), Inches(2.05), Inches(0.4), item, size=15.5, color=INK, bold=True, align=PP_ALIGN.CENTER)
                if i < 3:
                    add_textbox(slide, left + Inches(2.42), Inches(4.3), Inches(0.42), Inches(0.2), "→", size=24, color=MUTED, bold=True, align=PP_ALIGN.CENTER)
        elif layout == "deliverables":
            add_picture(slide, CREATE_PROJECT_IMG, Inches(8.3), Inches(1.86), width=Inches(3.3), height=Inches(1.6))
            add_textbox(slide, Inches(0.95), Inches(1.92), Inches(6.4), Inches(0.52), "输出不是“建议”。输出应该是可复制、可验证、可回滚。", size=21, bold=True)
            for i, item in enumerate(spec["items"]):
                left = Inches(0.95 + (i % 3) * 4.0)
                top = Inches(2.82 + (i // 3) * 1.5)
                fill = [SURFACE, SURFACE_2, RGBColor(13, 47, 66), RGBColor(6, 119, 98), RGBColor(92, 56, 18)][i]
                add_card(slide, left, top, Inches(3.2), Inches(1.05), fill)
                add_textbox(slide, left + Inches(0.16), top + Inches(0.32), Inches(2.88), Inches(0.32), item, size=17, bold=True, align=PP_ALIGN.CENTER)
        elif layout == "metrics":
            hero = add_card(slide, Inches(0.95), Inches(2.1), Inches(3.6), Inches(3.2), SURFACE)
            add_textbox(slide, Inches(1.24), Inches(2.6), Inches(2.8), Inches(0.8), "可验证", size=31, color=CYAN, bold=True)
            add_textbox(slide, Inches(1.24), Inches(3.45), Inches(2.8), Inches(1.2), spec["note"], size=15)
            add_picture(slide, RELEASE_IMG, Inches(4.92), Inches(1.98), width=Inches(3.3), height=Inches(2.15))
            add_picture(slide, LAYER_IMG, Inches(8.42), Inches(1.98), width=Inches(3.62), height=Inches(2.15))
            add_picture(slide, SHOWCASE_COLLAGE, Inches(4.95), Inches(4.22), width=Inches(4.6), height=Inches(1.55))
            for i, item in enumerate(spec["items"]):
                left = Inches(9.85)
                top = Inches(4.22 + i * 0.72)
                add_card(slide, left, top, Inches(2.15), Inches(0.52), RGBColor(7, 90, 130) if i == 0 else SURFACE_2)
                add_textbox(slide, left, top + Inches(0.14), Inches(2.15), Inches(0.16), item, size=11.5, bold=True, align=PP_ALIGN.CENTER)
        elif layout == "closing":
            add_textbox(slide, Inches(0.9), Inches(1.55), Inches(7.2), Inches(1.0), spec["title"], size=30, bold=True)
            add_textbox(slide, Inches(0.92), Inches(2.5), Inches(5.2), Inches(0.4), spec["subtitle"], size=18, color=MUTED)
            add_picture(slide, LOGO, Inches(11.26), Inches(0.58), width=Inches(0.72), height=Inches(0.72))
            for i, item in enumerate(spec["items"]):
                top = Inches(3.25 + i * 0.72)
                add_card(slide, Inches(0.95), top, Inches(6.35), Inches(0.48), SURFACE if i % 2 == 0 else SURFACE_2)
                add_textbox(slide, Inches(1.16), top + Inches(0.1), Inches(5.9), Inches(0.2), item, size=16, bold=True)
            add_card(slide, Inches(8.2), Inches(1.8), Inches(3.7), Inches(3.95), RGBColor(6, 119, 98))
            add_textbox(slide, Inches(8.62), Inches(2.42), Inches(2.8), Inches(0.4), "Takeaway", size=14, color=INK, bold=True)
            add_textbox(slide, Inches(8.62), Inches(3.0), Inches(2.65), Inches(1.8), "别再从属性开始。\n先从意图开始。", size=24, color=INK, bold=True)


def main():
    ensure_generated_assets()
    if OUT.exists() and not BACKUP.exists():
        copy2(OUT, BACKUP)
    prs = Presentation()
    build(prs)
    prs.save(OUT)


if __name__ == "__main__":
    main()
