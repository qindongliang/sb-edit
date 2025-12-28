---
description: 将 Sprunki/Incredibox 模组转换为带对齐布局的 Leopard 项目
---

此工作流专为 Sprunki/Incredibox 系列模组设计，默认启用 `--sprunki-mode` 对齐网格布局。

### 参数说明
- **SB3_PATH**: `.sb3` 文件的绝对路径
- **OUTPUT_DIR**: 转换后项目的保存父目录（默认 `/tmp`）

---

### 执行步骤

// turbo
1. **执行转换（Sprunki 模式）**
   ```shell
   CONF_OUTPUT_DIR="${OUTPUT_DIR:-/tmp}"
   PROJECT_NAME=$(basename "<SB3_PATH>" .sb3 | tr ' .' '_' | sed 's/__*/_/g; s/_*$//')
   TARGET_PATH="$CONF_OUTPUT_DIR/sb3_leopard/$PROJECT_NAME"

   if [ -n "$TARGET_PATH" ] && [ -d "$TARGET_PATH" ]; then
     rm -rf "$TARGET_PATH"
   fi

   node lib/cli/index.js \
     -i "<SB3_PATH>" \
     -o "$TARGET_PATH" \
     -ot leopard \
     --leopard-local-path /Users/qindongliang/project/web/leopard \
     --sprunki-mode
   ```

---

### 预览运行
```shell
cd "$TARGET_PATH"
npx vite
```

> [!TIP]
> **Sprunki 模式**：启用对齐网格布局，为后续全身角色展示奠定基础。
