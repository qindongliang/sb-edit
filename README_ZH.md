# sb-edit

`sb-edit` 是一个用于处理和操作 Scratch 项目文件（.sb3）的 JavaScript 库。它可以将 Scratch 项目转换为其他平台代码，特别是支持向 [Leopard](https://github.com/PullJosh/leopard) JS 框架的转换。

> #### 🚧 警告！
>
> `sb-edit` 仍处于开发阶段。并非所有功能都已完善，API 可能会发生重大变化。

---

## 核心功能

### 1. 导入与导出
支持多种 Scratch 相关格式的互相转换：

| 文件格式 | 导入 | 导出 |
| :--- | :---: | :---: |
| Scratch 3.0 (** .sb3 **) | ✅ 是 | ✅ 是 |
| Scratch 2.0 (** .sb2 **) | 🕒 计划中 | 🕒 计划中 |
| [Leopard JS](https://github.com/PullJosh/leopard) | ❌ 否 | ✅ 是 |
| [scratchblocks](https://github.com/tjvr/scratchblocks) | 👻 可能 | 🚧 开发中 |

### 2. 项目编辑
可以直接通过代码修改项目内容：

| 功能 | 添加 | 编辑 | 删除 |
| :--- | :---: | :---: | :---: |
| 角色 (Sprites) | 🕒 计划中 | ✅ 是 | ✅ 是 |
| 舞台 (Stage) | ❌ 否 | ✅ 是 | ❌ 否 |
| 脚本 (Scripts) | 🕒 计划中 | 🕒 计划中 | 🕒 计划中 |
| 造型与声音 | 🕒 计划中 | 🕒 计划中 | 🕒 计划中 |

---

## 🚀 特色功能：Sprunki 增强模式

`sb-edit` 专门为 **Sprunki / Incredibox** 系列模组提供了深度的自动化适配转换逻辑，通过命令行参数 `--sprunki-mode` 开启。

### 1. 自动角色层级修复 (Layer Fix)
Sprunki 模组转换后常会出现角色被背景遮挡（不可见）的问题。开启该模式后，转换器会自动：
*   识别角色的 `moveAhead` 逻辑。
*   将基础层级偏移从 `+7` 自动提升至 `+35`。
*   **效果**：确保角色始终显示在背景素材之上，同时不遮挡顶层 UI。

### 2. 自适应图标网格布局 (Adaptive Icon Grid)
自动重写 `Icons` 角色的排列逻辑：
*   **智能计数**：自动提取所有符合标准的图标造型（XX-a），并结合原始代码逻辑，确保所有角色图标（如 32 个或更多）均能正确生成。
*   **美观排列**：将原本杂乱或单列的图标自动排列为 **10 列** 的网格。
*   **精准间距**：默认使用 **46px** 的横向间距，完美适配 480px 舞台宽度，并自动居中对齐。

---

## 命令行工具 (CLI) 使用

首先全局安装：
```bash
npm i -g sb-edit
```

### 基础转换 (.sb3 转 Leopard)
```bash
sb-edit --input ./my_project.sb3 --output ./dist
```

### 关联本地 Leopard 库
如果您有自己修改过的 `leopard` 框架版本，可以使用 `--leopard-local-path` 参数。转换后的项目将直接引用该路径，而不是默认的官方库：
```bash
sb-edit --input ./project.sb3 --output ./dist --leopard-local-path /path/to/local/leopard
```

### Sprunki 模式转换 (推荐用于 Incredibox 模组)
```bash
sb-edit --input ./sprunki_mod.sb3 --output ./dist --sprunki-mode --leopard-local-path /path/to/local/leopard
```

---

## 开发者指南

### 代码示例：Node.js 中导入 SB3
```javascript
const { Project } = require("sb-edit");
const fs = require("fs");

const file = fs.readFileSync("./project.sb3");
const project = await Project.fromSb3(file);

console.log(project);
```

### 本地开发与构建
如果你想参与开发：
1. **克隆并链接**：
   ```bash
   git clone https://github.com/PullJosh/sb-edit.git
   cd sb-edit
   npm link
   ```
2. **构建代码**：
   ```bash
   npm run build  # 编译 TypeScript
   npm run watch  # 自动监听并编译
   ```
3. **运行测试**：
   ```bash
   npm test       # Jest 测试
   npm run lint   # 代码检查
   ```

---

## 常见问题 (FAQ)
*   **转换后角色看不见？** 确保使用了 `--sprunki-mode`。如果仍不可见，可能是 SVG 兼容性问题，建议检查 `mix-blend-mode` 属性。
*   **图标没对齐？** Sprunki 模式会自动处理布局，如果需要自定义列数，请修改源码中的 `DEFAULT_GRID_CONFIG`。
