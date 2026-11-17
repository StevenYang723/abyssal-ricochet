# 深渊弹珠 · 美术与战斗表现升级版

原创克苏鲁主题单人弹射游戏。手机竖屏触控与桌面鼠标、键盘均可游玩。

**[在线试玩](https://StevenYang723.github.io/abyssal-ricochet/)** · [自动部署状态](https://github.com/StevenYang723/abyssal-ricochet/actions/workflows/pages.yml)

<img src="docs/mobile-preview.jpg" alt="手机端游戏画面" width="320">

## GitHub Pages 部署

网站由 `.github/workflows/pages.yml` 自动发布。推送到 `main` 后，会检查 JavaScript、运行战斗与三章通关验证，并将 `dist/` 发布到 GitHub Pages。也可以在 Actions → Check and deploy game → Run workflow 手动发布。

修改玩法或画面时，编辑 `dist/` 中的文件并提交到 `main` 即可；不需要安装 npm 依赖或配置部署密钥。

## 运行

静态网页的全部文件在 `dist/`，可直接部署到任意静态网站服务。也可以打开 `dist/index.html` 本地游玩。若浏览器限制本地文件音效或图片加载，使用任意静态 HTTP 服务打开此目录。

开发预览：在项目目录运行 `node preview.cjs`，打开 `http://127.0.0.1:4173`。

## 操作

- 按住发光的调查员，向目标相反方向拖拽，松手发射。
- 触碰其他调查员发动援护；每位同伴每回合触发一次。
- 秘术达到 100% 后，点击「古印解放」，下一次弹射释放大招。
- 敌人标记数字为反击倒计时；生命或理智归零则失败。
- 点击角色卡查看技能，右上角可暂停或开关音效。
- 键盘：点击战场后，左右键调整角度，上下键重置方向，空格弹射，R 切换秘术。

## 本次更新

- 重绘四位调查员肖像、邪神和深潜者；新增海底圣堂环境。
- 将网页面板重构为手机游戏 HUD、角色卡、金属生命框和秘术按钮。
- 增加约 38–80 毫秒命中停顿、受击形变与亮闪、镜头冲击、粒子碎片、光核拖尾、伤害数字跳动和击杀消散。
- 增加援护闪电、技能横幅、大招角色特写、展开法阵与分层低频碰撞音效。
- 支持系统减少动态效果偏好，最高分在浏览器本地保存。

`engine.js` 为固定步长战斗逻辑；`game.js` 为操作、状态与弹窗；`battle-fx.js` 为美术渲染和特效；`game-ui.css` 为新版游戏界面。

美术使用内置 ImageGen 生成，提示词见 `art-direction.txt`。游戏无后端账号、付费和联网对战功能。字体有联网增强与本地回退。

验证：`node test-engine.cjs` 覆盖反弹、伤害、援护、治疗、秘术、失败、关卡推进和三章通关。
