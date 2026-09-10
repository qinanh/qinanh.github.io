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

- **改菜单**：只改 `_includes/menu.html`。左栏和手机顶栏是同一个 include
  （靠 `include.ctx` 区分 `side` / `top` 两套样式），加一项两边同时生效。
  当前页靠 `page.url` 比对自动加 `.on`（实心金点）
- **加一页**：仓库根目录新建 `xxx.html`，开头写 front matter
  （`layout: default` + `title:`），再去 `menu.html` 加一行即可
- ⚠️ `sticky` 怕祖先元素有 `overflow:hidden`。**别给 `main` / `body` 加这个属性**，
  会把左栏的固定效果弄没
- 窄屏（≤820px）是**另一套版式**，不是把桌面版压扁：左栏取消 sticky、收成
  「小头像 + 名字 + 身份 + 联系方式」的身份条，菜单整块搬进顶栏横排。
  手机上封面也不再钉住（`.opening{position:relative}`），滚过去就跟着走

## 联系方式 / 社交

`_includes/socials.html` 一处定义，两处渲染：

| `include.ctx` | 出现在 | 长相 |
|---|---|---|
| `chips` | 左栏身份条下面 | 带字的大 chip（`✉ email` / `GitHub` / `X` / `in LinkedIn`） |
| `icons` | 顶栏右上角 | 光图标的小圆钮，字用 `.slab` 藏起来 |

顶栏那排是必须的：手机上左栏会跟着滚走，只有顶栏一直挂着。

加渠道只改 `_config.yml` 的 `author:` —— 每个键对应一个 `{%- if a.xxx %}`，
**注释掉就不渲染**。`email` / `scholar` / `github` / `orcid` / `twitter`(→x.com) /
`linkedin` / `cv` 都支持，七个渠道现在都填齐了。填了的一律同时进左栏 chip、
顶栏圆钮和 `_layouts/default.html` 里 JSON-LD 的 `sameAs`。

⚠️ 每个图标是一行 `{% assign s_xxx = '<svg…>' %}`，下面靠 `{{ s_xxx }}` 引用。
**加图标时这两个名字必须完全一致** —— 不一致时 Liquid 不报错，只是静默输出空字符串，
圆钮会变成一个空圈（X 那个就踩过这个坑）。

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

`author:` 里几个跟"我是谁"有关的键：

| 键 | 作用 |
|---|---|
| `lab_url` | 组主页。填了左栏的组名和首屏名片上的组名就变成链接 |
| `advisor` / `advisor_url` | 导师姓名和主页，写在 about 第一段里 |
| `education` | `degree` / `school` / `year` 的列表，生成 JSON-LD 的 `alumniOf`。**目前只在结构化数据里用，页面上 about 那段是手写的**，改学历记得两处一起改 |

## 还差什么

- [ ] `assets/cv.pdf` —— 没有就把 `_config.yml` 里的 `cv:` 那行删掉
- [ ] `_config.yml` 里 `scholar:` / `orcid:` 填上（**用户还没提供**）
- [x] `github:` 对过，是本人
- [x] `twitter:`（`EricQinanHuang`）对过，是本人 —— 简介写着 Incoming PhD
      Student @UChicagoPME，站点栏挂的是 `qinanh.com`，等于自证
- [ ] `linkedin:`（`qinan-huang-516551237`）**没验证成功** —— LinkedIn 对匿名
      抓取一律返 999 / 直接弹注册墙，从命令行和真浏览器都看不到公开页。
      等本人确认，或换成自己复制出来的那个 URL

已完成：头像 `assets/img/portrait.jpg` 已就位；`_data/publications.yml`
里的占位条目已全部替换成真实条目（现在在 `publications.html` 那一页）。

## 首屏封面 + 逐屏吸附

`index.html` 的 front matter 里两个开关，都只给首页开：

| 开关 | 作用 |
|---|---|
| `opening: true` | 插入 `_includes/opening.html`：一屏封面（动画电池 + 简化名片 + `scroll down to continue`），`position:sticky` 钉在底下 |
| `snap: true`   | 给 `<main>` 加 `.snap`，每个 section 撑满一屏、一屏一停 |

封面之后是 `main` 这块「纸」往上滑盖住封面（`main` 全出血 + `background-position:0 -100vh`
对齐底纹）。

**「每屏撑满」和「真正吸附」是两件事，门槛不一样：**

| 块 | 媒体查询 | 干什么 |
|---|---|---|
| `.snap .col > section{min-height:calc(100svh - var(--tb))}` | `(min-width:821px) and (min-height:840px)` | 每屏至少一屏高、内容垂直居中。就算某屏内容比窗口还高，它也只是自然长高，不会裁切 |
| `scroll-snap-type:y mandatory`（三列版式） | `(min-width:1201px) and (min-height:900px)` | 一屏一停 |
| `scroll-snap-type:y mandatory`（两列版式） | `(max-width:1200px) and (min-width:821px) and (min-height:1080px)` | 同上 |

吸附的门槛必须按**实测**来定，因为「一屏一停」配上塞不下的屏会把人卡在两屏中间。
2026-09 重测（iframe 1600/1210/1290 宽，高 900，`--tb` 实测 62）：

- **三列版式**（视口 ≥1201px）：几屏内容全部 ≤838px，所以 `900px` 高的窗口就够
- **两列版式**（821–1200px，`.rgrid` 掉到两列、卡片折成两排）：最高那屏
  `#research` 实测 994px，要 `1080px` 高的窗口

改任何一屏的内容后都要重新量一遍这两个数（办法见「本地预览」那节的截图流程，
量 `.col > section` 的 `getBoundingClientRect().height` 跟 `innerHeight - --tb` 比）。

### 渲染性能：这几条别动

之前背景一直闪，是下面几个原因，改回去就会复发：

- **不要用 `background-attachment:fixed`**
- **不要给 `.topbar` 加 `backdrop-filter`**
- **不要在滚动回调里往 `:root` 写自定义属性**（每帧写全局变量会全页重排）。
  现在只写 `.opening` 的 `--e` 和 `.topbar` 的 `--sp`
- **`.opening-in` 上不要放 `translate` / `scale`**。它有 sticky 祖先，Firefox 会把
  合成层钉住，滚上去之后封面会盖在正文上。现在只用 `opacity:calc(1 - var(--e,0))`

- **`.opening` 是 sticky 的整屏盒子，`opacity:0` 之后仍然参与命中测试**。「透明」
  不等于「穿透」—— 滚下去之后它还在视口里，会盖住整页，于是论文链接、左栏菜单、
  三张配图卡**全部点不动，hover 也收不到**（手机端 `≤820px` 时它是
  `position:relative`，跟着文档走，没有这个问题，所以只在桌面上炸）。
  所以 `main` 必须保持 **`position:relative; z-index:2`**：`.opening` 是 `1`，
  两者是 `<body>` 下的兄弟、同一个层叠上下文，谁高谁接事件。封面还在画面里时
  它照常可点，内容纸推上来盖住哪块，哪块就归内容纸。

`.reveal` 的 IntersectionObserver 用 `rootMargin:'0px 0px 40px 0px'`。
**别改回负值** —— 贴着视口底部的元素会被预先下移 26px，负 margin 会让它们永远
进不了判定区。

### 配图卡：点开 + 悬停展开

「what I work on」那三张卡（`.rcard[data-post]`）有两条展开路径，`pick(id)` 是唯一的
切换入口：

- **点击**：任何时候都有效，触屏和键盘（`←` `→` `Enter`，卡片是 `role=tab`）都走这条。
- **悬停**：只在 `matchMedia('(hover:hover) and (pointer:fine)')` 为真的设备上绑
  `mouseenter`。**不能给触屏绑** —— 手指落下时 `mouseenter` 会先于 `click` 触发，
  点哪儿都像已经开过，反而跟点按打架。触屏继续只认点击。
  移动鼠标横向扫过一排三张会连开三张，所以压了 **110ms** 延迟：掠过去不触发，
  停在哪张才开哪张；`mouseleave` / `mousedown` 撤销。110ms 比 chevron 的 260ms
  动画短，手感是「跟手」不是「慢半拍」。
- CSS 那边 `@media (hover:hover) and (pointer:fine)` 里先用 `.rcard:hover` 把边框
  压黑，等于「马上要开」的预告，填掉那 110ms 的空窗。同样只给真实指针的设备，
  免得触屏的 `:hover` 点完粘住不散。
- **`.ptr` 这道闸门别拆**（挂在 `<html>` 上，JS 确认鼠标真的动过之后才加）。
  Firefox 在指针不在窗口里时，会把「上次已知位置」当成窗口正中，页面载入时
  布局一变就朝那个坐标补发一串 `mouseover` / `mouseenter`。实测抓到的证据：
  `0.24 EVT mouseenter tab-2 client=(960,565)` —— 960×565 正好是窗口正中，
  而那会儿真鼠标在屏幕角落。110ms 后卡片自己跳到第二张，`#research` 的深链接
  就这么被一次用户根本没做的 hover 顶掉了。真 hover 必有 `mousemove`，所以拿
  「出现过两个不同坐标」当闸门；没过闸门之前 JS 不理会 `mouseenter`，CSS 的
  高亮也靠 `.ptr` 一起关掉 —— 否则会出现「边框亮的是 B、面板开的是 A」。
  JS 关掉时没有 `.ptr`，退化成只有阴影的旧样式。

⚠️ 深链接那段必须用 `data-post` 比对，**不能**用 `getElementById(hash)` 判断 ——
`about` / `research` / `publications` / `code` 正好都是 section id，刷新或分享出来的
URL 就带着它们，`pick('research')` 谁都不匹配、三篇全关，面板整块空白。现在
命中不了就回落到第一张。

## 宽度适配

`:root` 里 `--max` 和 `--gutter` 管全局宽度：单栏时 `--max:860px`，两栏版式
重新定义成 `min(1600px,100%)`；内边距统一用 `var(--gutter)`（`clamp(18px,2.4vw,42px)`）。
左栏 `224px`、栏间距 `clamp(30px,3.2vw,54px)` —— 这三个数一起决定正文栏多宽，
所以在 1920 屏上「what I work on」的三张卡是 ~400px，在 1280 屏上 ~310px。

**注意 `--max` 只管到 1440 以上的屏**：视口不到 1440 时 `100%` 先到顶，
这时候想加宽只能动 `--gutter` / 左栏宽度 / `gap`。
论文列表那行是 `grid-template-columns:68px minmax(0,1fr) auto` —— `.pmain` 上的
`min-width:0` 不能删，不然 `white-space:nowrap` 的作者行会把栅格撑破。

**断点顺序是大坑，已经踩过两次。** 同权重选择器后写的赢，而 `@media` 本身
**不加权重**，所以「同一条规则」写在窄屏块里、原始定义却在文件后面时，
原始定义会赢，手机上根本不生效：

- `.rgrid` 的 `@media(max-width:1200px)`（两列）必须写在 `@media(max-width:640px)`
  （一列）**前面**。反过来手机上还是两列，卡片挤成一条
- `.opening{position:relative}` / `.opening-in{opacity:1}` 那三行必须写在
  `.opening` / `.opening-in` / `.scrollcue` 原始定义**之后**（文件靠下的那个
  `@media(max-width:820px)` 块里）。之前写在前面的 820 块里，结果手机上封面照旧
  sticky，正文顶上来时浮着一层鬼影

**`--tb`（顶栏占位高度）不再手写，由 JS 量。** `assets/js/reveal.js` 开头那段
把 `.topbar` 的真实高度写进 `:root --tb`（加载 / resize / 字体加载完各跑一次）。
因为顶栏高度会变：390 宽是 89px、780 宽是 93px，而 CSS 里那个 `54px` / `74px`
是**没 JS 时的兜底值**。写死数字的话锚点跳转会钻到顶栏底下（差 8–15px）。

`@media(min-width:1180px)` 里 `.bio` 排两栏（`column-count:2`）：19px 正文一栏
到底一行太长、整段也太高，`#about` 那一屏会被自己的正文顶出窗口。排两栏之后
`.bio` 从 412px 掉到 266px，`#about` 整屏就塞进 838px 了。窄一点自动退回一栏。

窄屏上另有两处：

- `@media(max-width:820px)` —— 整块换版式（见上面「版式」那节）。顶栏目录
  要求 **5 项一次全看见**，所以去掉了竖排用的那个小圆点、字号收到 12.5px，
  用 `space-between` 把空档摊匀；`overflow-x:auto` 留着只是兜底，正常滚不动
  （390 宽实测 `scrollWidth === offsetWidth === 390`）
- `@media(min-width:561px) and (max-width:820px)` —— 上一条的 `space-between`
  在平板宽度会把 5 个词拉开上百像素，看着散架；这里改成 `flex-start` +
  `gap:30px` 贴左边排
- `@media(max-width:560px)` —— 论文行从「缩略图 + 正文 + 期刊章」三栏收成两栏，
  期刊章挪到标题底下；封面、卡片内边距各收一号；顶栏社交圆钮收到 27px
  （不然「品牌名 + 6 个圆钮」在 390 宽会顶到边）

自查办法：`document.documentElement.scrollWidth === clientWidth` 且没有元素
`getBoundingClientRect().right > innerWidth`（`overflow:auto` 里的除外，比如那条
渲染图带是故意横滑的）。

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

`deploy-pages` 那一步显式设了 `timeout: 1800000`（30 分钟）。默认只有 10 分钟，
Pages 后端拥堵时会直接 `Timeout reached, aborting!` 而构建本身是好的。

如果部署报 `due to in progress deployment. Please cancel <sha> first`，说明后端卡住了
一个旧部署。`deploy-pages` 日志里 `Created deployment ... ID: <sha>` 的那个 sha 就是
Pages 部署 ID，用它可以释放：

```bash
gh api "repos/qinanh/qinanh.github.io/pages/deployments/<sha>"          # 看状态
gh api -X POST "repos/qinanh/qinanh.github.io/pages/deployments/<sha>/cancel"
```

（`deployments` API 里的数字 ID 不行，会 404。）

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
- head 里一段 **Person 结构化数据**（中英文名、单位、邮箱、`knowsAbout`、`sameAs`、
  `worksFor` 指向组主页、`alumniOf` 从 `_config.yml` 的 `education:` 生成）
- **全站只有一个 `<h1>`**：首页封面名片的名字、news 页的 "news"。
  这两条别改成 `<div>`，也别再加第二个 `<h1>` —— 这是搜索"Qinan Huang"最直接的信号
- `/news.html` 挂在左侧菜单第 05 项，从每一页都链得到（不加内链它就只能靠 sitemap 被发现）

`sameAs` 会跟着 `_config.yml` 走，目前 GitHub / X / LinkedIn / ORCID / Scholar 五个
都已确认填好。**链接必须是真的** —— 结构化数据里的假链接比没有更糟，改之前先验证。

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
- 章节大标题（`.sec h2/h1`）用**荧光笔**强调：`clamp(32px,3.3vw,46px)` +
  一层 `linear-gradient` 半透明色带。⚠️ 色带必须走 `background-image`，
  **不能**用 `::before` + `z-index:-1` —— `body` 没建层叠上下文，负 z-index
  会沉到 `body` 背景底下，看着像没渲染出来
- 「what I work on」那三张卡点开时，`.posts` 顶上会长出一枚旋转 45° 的方角
  （`::before`），横向位置由 JS 写进 `--stem`（被点那张卡的中线），
  所以面板看起来是从那张卡里抽出来的。卡片右侧的 `chevron` 同步转 180°
- `.post p` 限宽 `86ch`：面板占满整栏是为了跟三张卡对齐，但正文一行的字
  不能跟着拉那么长

### 三张配图（`_includes/fig_*.html`）

`fig_rl` / `fig_mixture` / `fig_generative` 是手写 SVG，共用 `viewBox="0 0 360 200"`
和同一套设计规则，改一张要顺手看另外两张：

- **留白网格**：左右各留 22，上 26、下 14。盒子一律 `y=34/38` 起、同高，
  小标题（`ftiny`）挂在盒子上沿**外侧**，不塞进盒子里
- **箭头只走留白**：杆 `H` 段 + 一个 5.5×5 的 V 形箭头，长度一致，两头各留 ~5px；
  **任何线都不许插进图形或压住文字**。`reward → update` 那种必须横穿的标签，
  底下垫一块 `.fhalo`（跟底色同色的圆角矩形）把线压掉
- **三档标签**：`ftiny`（等宽 10.5px，容器名）/ `flab`（圆体 13px，主标签）/
  `fnote`（手写体 13px，次要说明）。同一层含义在三个图里用同一档
- 颜色全部继承卡片的 `data-accent`：`--c-line` 给实心小圆（`.fatom`）、
  `--c-fill` 给 chip 底色。加新元素前先想清楚用哪一档，别硬写颜色
- `.fmark` 是墨色圆上的「+」（阳离子），用 `--paper-2` 白描边才看得见
- `.fig` 上有一条 `max-height:198px`：图是定比矢量，两列版式里卡片变宽、
  图会跟着长高把 `#research` 顶出窗口，封顶之后 SVG 自己等比缩进中间

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
