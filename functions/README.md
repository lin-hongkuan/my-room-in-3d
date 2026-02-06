# Cloudflare Pages Functions

## 云端设置（/api/settings）

「显示设置」开关会保存在 Cloudflare KV 里，所有人看到的是同一份设置，任何人修改都会同步。

### 一次性配置（在 Cloudflare 控制台）

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → 你的 **Pages 项目**。
2. 进入 **Settings** → **Functions**。
3. 在 **KV namespace bindings** 里点 **Add binding**：
   - **Variable name**：`ROOMTOUR_SETTINGS`（必须一致）
   - **KV namespace**：新建一个或选已有命名空间（建议新建一个，如 `roomtour-settings`）。
4. 保存。

新建 KV 命名空间：**Workers & Pages** → **KV** → **Create namespace**，名字随意（如 `roomtour-settings`），创建后复制其 **ID**，在 Pages 绑定里选这个命名空间即可。

部署后访问站点，按 **F12** 打开右下角面板，勾选/取消「显示设置」即会写入云端，其他访客刷新即可看到同一状态。
