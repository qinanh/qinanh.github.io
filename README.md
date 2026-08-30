# qinanh.com

个人学术主页。Jekyll 4 + 手写卡通主题，配色和图标直接取自 `~/workflow_fig/elements`
那套科研插图（`#4a4a4a` 墨线 + gold / purple / green / blue 四个口味色）。

## 本地预览

Ruby **不在系统里**，装在 micromamba 的 `rb` 环境。用封装脚本，别直接敲 `jekyll`：

```bash
~/site/serve.sh          # → http://localhost:4100
~/site/serve.sh 4200     # 换端口
```

## 内容都在 `_data/` 里，改 YAML 就行，不用碰 HTML

| 文件 | 管什么 | 备注 |
|---|---|---|
| `_data/research.yml`     | "what I work on" 三张大卡 | `icon` 取 `assets/icons/` 里的文件名（不含 `.svg`）；`accent` 是 gold/purple/green/blue |
| `_data/publications.yml` | 论文列表 | **目前是占位条目，页面上会显示红色 PLACEHOLDER**。填真的进去，或清空文件让整节隐藏 |
| `_data/projects.yml`     | 开源项目卡 | |
| `_data/news.yml`         | news 时间线 | `html` 字段直接写 HTML |
| `_data/gallery.yml`      | 首屏下面那条渲染图带 | 图放 `assets/img/` |

身份信息（姓名、职称、组、邮箱、Scholar / ORCID / GitHub、CV）全在 `_config.yml`
的 `author:` 下面。**注释掉的行不会显示**，所以确认一个开一个。

## 还差什么

- [ ] `assets/img/portrait.jpg` —— 头像。没有的话方框里显示占位提示
- [ ] `assets/cv.pdf` —— 没有就把 `_config.yml` 里的 `cv:` 那行删掉
- [ ] `_data/publications.yml` —— 换掉占位条目
- [ ] `_config.yml` 里 `scholar:` / `orcid:` 填上

## 分享卡（og:image）

`assets/img/og.png` 是从 `og-card.html` 截出来的 1200×630。改了身份信息后重新生成：

```bash
~/site/serve.sh &
firefox --headless --window-size=1200,630 \
  --screenshot ~/site/assets/img/og.png http://127.0.0.1:4100/og-card.html
```

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

## 设计约定

- 墨线 `2.2–2.4px #4a4a4a` + 圆角 16–22px + 硬投影 —— 贴纸感，跟图标的描边一致
- 面板用**浅色描边 + 极淡填充**（照抄 `panel_*.svg`），只有小图标和 chip 才上墨线
- 所有卡片/缩略图带 ±1~2° 旋转，靠 `:nth-child` 轮换，避免整齐得像模板
- 手写体 `Caveat` 只出现在章节标题、日期、注解和链接标签；正文是 `Nunito`，
  标题是 `Fredoka`（圆胖，跟图标的圆角呼应）
- 单一浅色主题，没做 dark mode —— 纸质配色换深色要整套重配，不值当

## 硬规矩

**任何仓库都不转 public。** `simulation_workflow`、`electrag`、`li_field_diffusion`
这些在主页上只出现描述，`url` 一律留空，不外链。唯一例外是本来就公开的
`qinanh/xyzrender`。
