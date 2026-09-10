# qinanh.com

个人学术主页。Jekyll 4 + 手写卡通主题，配色和图标直接取自 `~/workflow_fig/elements`
那套科研插图（`#4a4a4a` 墨线 + gold / purple / green / blue 四个口味色）。

## 本地预览

Ruby **不在系统里**，装在 micromamba 的 `rb` 环境。用封装脚本，别直接敲 `jekyll`：

```bash
~/site/serve.sh          # → http://localhost:4100
~/site/serve.sh 4200     # 换端口
```

## 版式：左栏固定 + 右侧内容

首页是**一整页**（`#about` / `#research` / `#publications` / `#code` 四个
`<section>`），菜单锚点直接跳过去；`news.html` 是单独的完整 news 列表，
`publications.html` 只是个 meta-refresh 跳到 `/#publications` 的桩。

页面骨架在 `_layouts/default.html` 里的 `.layout` 栅格：左边 238px 是
`_includes/side.html`（头像 / 身份 / 联系方式 / 菜单），右边是正文。
左栏 `position:sticky`，往下滑一直挂在旁边。

- **改菜单**：编辑 `_includes/side.html` 末尾的 `<nav class="menu">`，
  当前页靠 `page.url` 比对自动加 `.on`（实心金点）
- **加一页**：仓库根目录新建 `xxx.html`，开头写 front matter
  （`layout: default` + `title:`），再去菜单加一行即可
- ⚠️ `sticky` 怕祖先元素有 `overflow:hidden`。**别给 `main` / `body` 加这个属性**，
  会把左栏的固定效果弄没
- 窄屏（≤820px）左栏自动回到顶部、取消 sticky，菜单变成横排

## 滚动浮现

`assets/js/reveal.js` 用 IntersectionObserver 给 `.reveal` 元素在进入视口时挂
`.is-in`。想给新元素加效果就加 `class="reveal"`，要错峰再加
`style="--d:120ms"`。

隐藏态写在 `.js .reveal` 下，靠 `<head>` 里那行内联脚本加的 `html.js`
才生效 —— **关掉 JavaScript 页面照样完整显示**，不会白屏。
动画用独立的 `translate` 属性而非 `transform`，避免跟卡片那些 rotate / hover 位移打架。

## 内容都在 `_data/` 里，改 YAML 就行，不用碰 HTML

| 文件 | 管什么 | 备注 |
|---|---|---|
| `_data/research.yml`     | "what I work on" 三张配图卡 | `figure` 选 `_includes/fig_*.html` 里的一张手绘图；`kicker` 是卡上的小标签，`short` 是卡名，`blurb` 是卡上那行概述，`title` + `post` 是点开后的长介绍；`accent` 是 gold/purple/green/blue |
| `_data/publications.yml` | 论文列表 | **目前是占位条目，页面上会显示红色 PLACEHOLDER**。填真的进去，或清空文件让整节隐藏 |
| `_data/projects.yml`     | 开源项目卡 | |
| `_data/news.yml`         | news 时间线 | `html` 字段直接写 HTML |
| `_data/gallery.yml`      | 首屏下面那条渲染图带 | 图放 `assets/img/` |

身份信息（姓名、职称、组、邮箱、Scholar / ORCID / GitHub、CV）全在 `_config.yml`
的 `author:` 下面。**注释掉的行不会显示**，所以确认一个开一个。

## 还差什么

- [ ] `assets/cv.pdf` —— 没有就把 `_config.yml` 里的 `cv:` 那行删掉
- [ ] `_config.yml` 里 `scholar:` / `orcid:` 填上

已完成：头像 `assets/img/portrait.jpg` 已就位；`_data/publications.yml`
里的占位条目已全部替换成真实条目（现在在 `publications.html` 那一页）。

## 首屏封面 + 逐屏吸附

`index.html` 的 front matter 里两个开关，都只给首页开：

| 开关 | 作用 |
|---|---|
| `opening: true` | 插入 `_includes/opening.html`：一屏封面（动画电池 + 简化名片 + `scroll down to continue`），`position:sticky` 钉在底下 |
| `snap: true`   | 给 `<main>` 加 `.snap`，每个 section 撑满一屏、一屏一停 |

封面之后是 `main` 这块「纸」往上滑盖住封面（`main` 全出血 + `background-position:0 -100vh`
对齐底纹）。吸附只在 `@media(min-height:840px) and (min-width:821px)` 里开 ——
**最高的那屏内容 763px，加上顶栏要 817px 的窗口才够**，窗口不够高还吸附就会把人
卡在两屏中间。所以改任何一屏的内容后都要重新量一遍高度。

### 渲染性能：这几条别动

之前背景一直闪，是下面几个原因，改回去就会复发：

- **不要用 `background-attachment:fixed`**
- **不要给 `.topbar` 加 `backdrop-filter`**
- **不要在滚动回调里往 `:root` 写自定义属性**（每帧写全局变量会全页重排）。
  现在只写 `.opening` 的 `--e` 和 `.topbar` 的 `--sp`
- **`.opening-in` 上不要放 `translate` / `scale`**。它有 sticky 祖先，Firefox 会把
  合成层钉住，滚上去之后封面会盖在正文上。现在只用 `opacity:calc(1 - var(--e,0))`

`.reveal` 的 IntersectionObserver 用 `rootMargin:'0px 0px 40px 0px'`。
**别改回负值** —— 贴着视口底部的元素会被预先下移 26px，负 margin 会让它们永远
进不了判定区。

## 宽度适配

`:root` 里 `--max` 和 `--gutter` 管全局宽度：单栏时 `--max:860px`，两栏版式
重新定义成 `min(1600px,100%)`；内边距统一用 `var(--gutter)`（`clamp(18px,2.4vw,42px)`）。
左栏 `224px`、栏间距 `clamp(30px,3.2vw,54px)` —— 这三个数一起决定正文栏多宽，
所以在 1920 屏上「what I work on」的三张卡是 ~400px，在 1280 屏上 ~310px。

**注意 `--max` 只管到 1440 以上的屏**：视口不到 1440 时 `100%` 先到顶，
这时候想加宽只能动 `--gutter` / 左栏宽度 / `gap`。
论文列表那行是 `grid-template-columns:68px minmax(0,1fr) auto` —— `.pmain` 上的
`min-width:0` 不能删，不然 `white-space:nowrap` 的作者行会把栅格撑破。

## 分享卡（og:image）

`assets/img/og.png` 是从 `og-card.html` 截出来的 1200×630。改了身份信息后重新生成：

Firefox 155 已经删掉 `--screenshot`，只能 Xvfb + ffmpeg 抓屏。两个坑：

- `og-card.html` 在 `_config.yml` 的 `exclude` 里，**Jekyll 不发布它**，所以不能从
  4100 抓。把它和它引用的三张图拷到一个临时目录，用 `python3 -m http.server` 单独伺服。
- Firefox 的视口 = **屏幕的 90%**（1400×900 → 1260×810）。要正好抓到 1200×630，
  Xvfb 就得开 **1340×720**。别按屏幕尺寸反推。

```bash
cd ~/site
mkdir -p /tmp/ogtmp/assets/img
cp og-card.html /tmp/ogtmp/
cp assets/img/{md_box_cg.svg,li_solvation_shell.svg,li_field_motif.png} /tmp/ogtmp/assets/img/
(cd /tmp/ogtmp && setsid python3 -m http.server 4300 --bind 127.0.0.1 &)

# snap 版 firefox 读不了 /tmp，profile 必须在 ~/snap 下；抓之前清掉会话/窗口状态
python3 -c "import os;d=os.path.expanduser('~/snap/firefox/common/.mozilla/firefox/shotprof');[os.remove(os.path.join(d,f)) for f in ('sessionstore.jsonlz4','xulstore.json','.parentlock','lock') if os.path.exists(os.path.join(d,f))]"

setsid Xvfb :97 -screen 0 1340x720x24 &
sleep 3
# 必须前台跑在一个不退出的 shell 里，setsid + & 会立刻挂掉
DISPLAY=:97 firefox --new-instance -P shotprof --kiosk http://127.0.0.1:4300/og-card.html
# 另开一个终端等 20s 后抓屏：
DISPLAY=:97 ffmpeg -f x11grab -draw_mouse 0 -video_size 1200x630 \
  -i :97.0+0,0 -frames:v 1 -y ~/site/assets/img/og.png
pkill -x firefox; pkill -x Xvfb; pkill -f "[h]ttp.server 4300"
```

抓完**看一眼图**再提交 —— 黑屏或者被裁掉一角都是常见失败模式，看图两秒钟就能发现。

## 部署

推到 GitHub 后 `.github/workflows/pages.yml` 会自动构建并发到 Pages。

仓库 Settings → Pages → Source 选 **GitHub Actions**（不是 "Deploy from a branch"）。
自定义域名填 `qinanh.com`，`CNAME` 文件已经在仓库里了。

Cloudflare DNS 侧：

| 记录 | 名称 | 值 |
|---|---|---|
| A | `@` | `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153` |
| CNAME | `www` | `<用户名>.github.io` |

⚠️ 代理状态先设 **DNS only（灰云）**，等 GitHub 签出证书再考虑开橙云，否则
Pages 那边一直卡在 "certificate provisioning"。

## 搜索 / SEO

站点是**单页 + 一个 news 页**，能索引的就这两条。

已经做好的：

- `robots.txt`（`Allow: /` + 指向 sitemap）和 `sitemap.xml`（`jekyll-sitemap` 生成）
- `<link rel="canonical">`、`description`、整套 `og:*` / `twitter:*`
- head 里一段 **Person 结构化数据**（中英文名、单位、邮箱、`knowsAbout`、`sameAs`）
- **全站只有一个 `<h1>`**：首页封面名片的名字、news 页的 "news"。
  这两条别改成 `<div>`，也别再加第二个 `<h1>` —— 这是搜索"Qinan Huang"最直接的信号
- `/news.html` 挂在左侧菜单第 05 项，从每一页都链得到（不加内链它就只能靠 sitemap 被发现）

`sameAs` 会跟着 `_config.yml` 走：把 `scholar:` / `orcid:` 取消注释就自动并进去。

手动部分（代码改不了，得登进去点）：

1. **Google Search Console** → 添加资源 → 选「网域」→ 填 `qinanh.com`。
   DNS 里已经有 `google-site-verification=...` 这条 TXT，点验证会直接过。
2. 左侧「Sitemap」→ 提交 `https://qinanh.com/sitemap.xml`。
3. 顶部「网址检查」→ 贴 `https://qinanh.com/` → 「请求编入索引」。首页进索引通常几天到两周。
4. **Bing Webmaster Tools** → 可以直接「从 Google Search Console 导入」，省一次验证。

## 设计约定

- 墨线 `2.2–2.4px #4a4a4a` + 圆角 16–22px + 硬投影 —— 贴纸感，跟图标的描边一致
- 面板用**浅色描边 + 极淡填充**（照抄 `panel_*.svg`），只有小图标和 chip 才上墨线
- 所有卡片/缩略图带 ±1~2° 旋转，靠 `:nth-child` 轮换，避免整齐得像模板
- 手写体 `Caveat` 只出现在章节标题、日期、注解和链接标签；正文是 `Nunito`，
  标题是 `Fredoka`（圆胖，跟图标的圆角呼应）
- 单一浅色主题，没做 dark mode —— 纸质配色换深色要整套重配，不值当

## 硬规矩

**研究代码仓库一律不转 public。** `simulation_workflow`、`electrag`、`li_field_diffusion`
这些在主页上只出现描述，`url` 一律留空，不外链。公开的只有本来就公开的
`qinanh/xyzrender`，以及**这个站点仓库本身** —— GitHub Pages 要它 public，
里面只有网页源码和已发表的图，没有别的。

## 论文缩略图：`assets/pub/`

`_data/publications.yml` 里的 `thumb:` 从 **`assets/pub/`** 取，显示在 246×164 的宽框里。

- `fig_*.png` / `.jpg` —— 从原文抽出来的插图，默认 `object-fit: contain`（完整显示不裁）
- `mol_*.svg` —— xyzrender 从 SMILES 渲的结构图，方形，要加 `fit: cover` 才能填满宽框

**出版社 PDF 放 `_papers/`，不要放 `assets/`。** 下划线开头的目录 Jekyll 从不发布；
放进 `assets/` 会被原样发到 `qinanh.com/assets/pub/xxx.pdf` 上去。`_papers/` 已在
`.gitignore` 里，只作抽图来源留在本地。

抽图流程（页码和裁切框是一篇一篇看出来的，没有通用脚本）：

```bash
pdftocairo -png -r 200 -f <页码> -l <页码> _papers/xxx.pdf /tmp/pg
# 看图定裁切框，再用 PIL crop 到 assets/pub/
```
