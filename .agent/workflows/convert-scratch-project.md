---
description: 将指定的 .sb3 文件转换为 Leopard 项目并自动关联本地库
---

此工作流执行从 Scratch (`.sb3`) 到 Leopard (JavaScript) 的全自动化转换，并自动链接本地修复后的 Leopard 框架。

### 参数说明
- **SB3_PATH**: `.sb3` 文件的绝对路径（例如 `/Downloads/my_game.sb3`）
- **OUTPUT_DIR**: 转换后项目的保存父目录（默认为 `/tmp`）

---

### 执行步骤

// turbo
1. **执行转换（一键关联本地库）**
   此命令将自动完成项目转换。输出目录将位于 `OUTPUT_DIR` 下的 `sb3_leopard` 子目录。
   ```shell
   # 如果没有提供 OUTPUT_DIR，默认使用 /tmp
   CONF_OUTPUT_DIR="${OUTPUT_DIR:-/tmp}"
   
   node lib/cli/index.js \
     -i "<SB3_PATH>" \
     -o "$CONF_OUTPUT_DIR/sb3_leopard/$(basename "<SB3_PATH>" .sb3)" \
     -ot leopard \
     --leopard-local-path /Users/qindongliang/project/web/leopard
   ```

---

### 验证转换结果

1. **检查链接**：
   打开生成的 `index.html`，确认引用路径为 `./local_leopard/index.min.css`。
2. **预览运行**：
   ```shell
   cd "<OUTPUT_DIR>/leopard-project"
   npx vite
   ```

> [!IMPORTANT]
> **本地库优势**：使用此工作流生成的项目会自动包含 `Renderer.ts` (点击穿透修复) 和 `Costume.ts` (分辨率修复) 的底层改进。
