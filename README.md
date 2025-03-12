# LabMan - 科研项目管理系统

LabMan 是一个基于 Web 的科研项目管理系统，帮助研究团队更有效地管理项目、里程碑和进度。

## 功能特点

- **项目管理**: 管理项目基本信息、团队成员、合作单位、经费预算等
- **里程碑管理**: 年度评审、中期评审、结项评审等里程碑追踪
- **进度管理**: 对照任务书和考核指标，展示各指标项完成情况
- **统计数据**: 项目数年度分析、项目类别分析、各团队承担项目情况
- **任务书上传**: 支持上传和管理项目任务书文档
- **甘特图**: 支持在线创建和编辑项目甘特图
- **主题切换**: 可以随时调整界面主题和颜色

## 技术栈

- **前端**: Vue.js 3, Tailwind CSS, Chart.js, Pinia
- **后端**: Node.js, Express
- **数据库**: SQLite (本地存储)

## 运行要求

- Node.js 18+, 20+ LTS 版本推荐（注意：Node.js 23+ 可能需要使用备选安装方法）
- npm 9+

## 安装和启动

### 方法一：使用初始化脚本（推荐）

1. 克隆仓库:

```bash
git clone https://github.com/yourusername/labman.git
cd labman
```

2. 运行初始化脚本:

```bash
node init.js
```

3. 启动应用:

```bash
npm run start
```

### 方法二：手动安装

1. 克隆仓库:

```bash
git clone https://github.com/yourusername/labman.git
cd labman
```

2. 安装依赖:

```bash
npm install
```

3. 创建必要的目录:

```bash
mkdir -p backend/uploads
```

4. 启动前端开发服务器:

```bash
npm run dev
```

5. 在另一个终端启动后端服务器:

```bash
npm run server
```

### Node.js 23+ 兼容性问题

如果您使用的是 Node.js 23+ 并且在安装过程中遇到了 better-sqlite3 兼容性问题，可以尝试以下方法：

#### 方法一：使用内存服务器模式（不需要 SQLite）

此模式使用内存中的数据存储，仅适用于测试和演示：

```bash
npm run start:memory
```

#### 方法二：使用 sqlite3 替代 better-sqlite3

修改 package.json 删除 better-sqlite3 依赖，确保包含 sqlite3：

```json
"dependencies": {
  // ...删除 better-sqlite3 行
  "sqlite3": "^5.1.7",
  // ...其他依赖
}
```

然后重新安装并启动：

```bash
npm install
npm run start
```

#### 方法三：降级到 Node.js LTS 版本

推荐安装 Node.js v20.x LTS 版本，可以与所有依赖包完全兼容。

## 访问应用

在浏览器中访问:

```
http://localhost:5173
```

## 开发指南

- 前端开发服务器运行在 `http://localhost:5173` (Vite 默认端口)
- 后端 API 服务器运行在 `http://localhost:3000`
- 前端代码位于 `src` 目录
- 后端代码位于 `backend` 目录
- 数据库文件 `labman.db` 会自动在 `backend` 目录中创建

## 示例登录

- 用户名: `admin`
- 密码: `password`

## 许可证

MIT
