# My Room in 3D — Cloudflare Pages 部署与设置指南

按下面步骤做一遍，之后**每次推代码到 GitHub，网站都会自动重新构建并更新**。

---

## 一、准备：代码在 GitHub 上

### 1.1 若项目还没推到 GitHub

1. 用下面链接**一键创建空仓库**（已填好仓库名，用 **lin-hongkuan** 账号登录后打开）：  
   **https://github.com/new?name=my-room-in-3d**  
   打开后选 **Public**，**不要**勾选 “Add a README file”，点 **Create repository**。

2. 本地在项目根目录执行（远程已设为 `lin-hongkuan/my-room-in-3d`，只需推送）：

```bash
cd f:\roomtour\my-room-in-3d
git push -u origin main
```

3. 确认浏览器里打开 https://github.com/lin-hongkuan/my-room-in-3d 能看到代码（含 `src`、`bundler`、`functions`、`static`、`package.json` 等）。

### 1.2 若已经在 GitHub

- 确保要部署的分支（一般是 `main`）已包含最新代码，并且仓库里有 **`functions`** 文件夹（云端设置 API 需要）。

---

## 二、在 Cloudflare 创建 Pages 项目并连上 GitHub

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com)，登录。
2. 左侧选 **Workers & Pages**。
3. 点 **Create** → **Pages** → **Connect to Git**。
4. 选 **GitHub**，按提示授权 Cloudflare 访问你的 GitHub（若未授权）。
5. 选 **你的账号** 下的仓库，例如 **`my-room-in-3d`**。
6. 点 **Begin setup** 进入构建配置。

---

## 三、配置构建（Build settings）

在 **Build configuration** 里填：

| 项 | 填写的值 |
|----|----------|
| **Production branch** | `main`（或你用来发布的分支） |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | 留空（项目根目录就是仓库根目录） |

- **Environment variables（环境变量）**：一般不用填；若构建报错和 Node 版本有关，可加一条：
  - **Variable name**：`NODE_VERSION`
  - **Value**：`18`

然后点 **Save and Deploy**。等几分钟，第一次部署会跑一次构建。

- 成功：会给你一个地址，形如 `https://my-room-in-3d.xxx.pages.dev`，点进去就是你的网站。
- 失败：在 **Deployments** 里点进这次部署，看 **Build log** 里的报错，按提示改（常见是 Node 版本或依赖安装问题）。

---

## 四、绑定 KV（让「显示设置」存云端）

只有做了这一步，按 F12 里的「显示设置」才会保存到云端、所有人看到同一份。

### 4.1 新建 KV 命名空间

1. Cloudflare Dashboard 左侧 **Workers & Pages** → 上方 **KV**。
2. 点 **Create namespace**。
3. **Namespace name** 填：`roomtour-settings`（或任意名字）。
4. 点 **Add**，记下这个命名空间（后面绑定要用）。

### 4.2 把 KV 绑到 Pages 项目

1. 回到 **Workers & Pages** → **Pages** → 点进你的项目（如 `my-room-in-3d`）。
2. 顶部 **Settings** → 左侧 **Functions**。
3. 找到 **KV namespace bindings**，点 **Add binding**。
4. 填写：
   - **Variable name**：**`ROOMTOUR_SETTINGS`**（必须和代码里一致，不要改）
   - **KV namespace**：选刚建的 `roomtour-settings`。
5. 点 **Save**。

### 4.3 设置管理后台密码 (Optional)

为了防止他人修改你的卡片内容，建议设置一个自定义 Token：
1. 在同一页面（Settings -> Functions）找到 **Environment variables**。
2. 点 **Add variable**。
3. **Variable name**: `ADMIN_TOKEN`
4. **Value**: `你的自定义密码` (默认是 `admin123`)
5. 点 **Save**。

---

## 五、使用管理后台

部署完成后，你可以通过以下地址管理你的 3D 房间内容：
- **地址**: `你的域名/admin.html`
- **操作**: 
    1. 在页面顶部输入你设置的 `ADMIN_TOKEN`。
    2. 修改各个区域（电脑、Mac、电视等）的卡片信息。
    3. 点击 **保存更改**，设置将立即同步到云端。
    4. 刷新 3D 房间页面即可看到更新。

---

## 六、之后每次更新网站怎么做？

- **推代码到 GitHub**（你连接的那个分支，例如 `main`）  
  → Cloudflare 会自动：
  1. 拉取最新代码  
  2. 执行 `npm run build`  
  3. 用新生成的 `dist` + `functions` 做一次新部署  
  4. 网站自动变成新版本  

所以：**是的，每次 push 代码上去，网站都会自动更新。** 不用手动再点「部署」。

- 在 **Deployments** 里可以看到每次 push 触发的部署记录，点进某次可看 **Build log** 和 **Preview URL**。

---

## 六、可选：自定义域名

1. 在 Pages 项目里点 **Custom domains**。
2. 点 **Set up a custom domain**，输入你的域名（如 `room.你的域名.com`）。
3. 按提示在域名服务商那里添加 Cloudflare 给出的 CNAME 或 A 记录。
4. 生效后访问该域名即可打开同一站点。

---

## 七、本地先验证构建（可选）

部署前可在本机确认能构建通过：

```bash
cd f:\roomtour\my-room-in-3d
npm install
npm run build
```

若成功，会生成 `dist` 目录；Cloudflare 上用的就是同一条命令和同一个输出目录。

---

## 八、小结

| 步骤 | 做什么 |
|------|--------|
| 1 | 代码在 GitHub，且含 `functions` 文件夹 |
| 2 | Cloudflare Pages 连 GitHub，选仓库 |
| 3 | 构建命令 `npm run build`，输出目录 `dist` |
| 4 | 建 KV 命名空间，并在 Pages 的 Functions 里绑定为 `ROOMTOUR_SETTINGS` |
| 5 | 之后：改代码 → push 到 main → 网站自动更新 |

遇到具体报错时，把 **Build log** 里相关几行贴出来，可以据此排查。
