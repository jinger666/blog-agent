# Dify工作流集成指南

## 概述

本平台已成功集成Dify API，允许您直接调用和执行Dify平台上创建的AI工作流。

## 配置步骤

### 1. 获取Dify API密钥

#### 方式一：使用Dify云端服务
1. 访问 https://cloud.dify.ai
2. 注册并登录账号
3. 创建或打开一个工作流应用
4. 点击左侧菜单「访问API」
5. 点击右上角「API秘钥」创建密钥
6. 复制API密钥（格式：`app-xxxxx`）

#### 方式二：使用自托管Dify
1. 部署Dify到本地或服务器
2. 登录Dify管理界面
3. 创建或打开工作流应用
4. 获取API密钥

### 2. 配置环境变量

编辑 `backend/.env` 文件：

```env
# Dify配置
DIFY_API_URL=https://api.dify.ai/v1        # Dify云端或使用您的自托管URL
DIFY_API_KEY=app-xxx-your-actual-key-here   # 替换为您的API密钥
DIFY_WORKFLOW_ID=                           # 可选：设置默认工作流ID
```

### 3. 重启后端服务

```bash
cd backend
npm run dev
```

## 使用方法

### 前端使用 - 可视化编排器

1. 登录平台后，点击左侧菜单「工作流」
2. 在「🎨 可视化编排」标签页中：
   - **添加节点**：点击左侧面板的节点类型按钮（开始、LLM、工具、条件判断等）
   - **拖拽节点**：鼠标拖动节点到画布任意位置
   - **连接节点**：从节点的绿色输出点（右侧）拖拽到另一个节点的蓝色输入点（左侧）
   - **编辑配置**：点击节点打开右侧配置面板，修改名称和描述
   - **删除节点**：选中节点后点击右上角的红色删除按钮
   - **删除连接**：点击连线中间的×按钮
   - **缩放画布**：使用顶部工具栏的放大/缩小/适应屏幕按钮
   - **保存工作流**：点击「保存」按钮保存到本地存储
   - **加载工作流**：点击「加载」按钮恢复之前保存的工作流
   - **执行工作流**：点击「执行」按钮提交到Dify后端
3. 切换到「⚡ 快速执行」标签页可以直接通过JSON输入执行工作流
4. 切换到「📊 执行历史」标签页查看执行记录

### API调用示例

#### 执行工作流

```bash
curl -X POST http://localhost:3000/api/workflows/dify/execute \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": {
      "query": "你好",
      "temperature": 0.7
    },
    "userId": "user123",
    "responseMode": "blocking"
  }'
```

#### 查询执行状态

```bash
curl http://localhost:3000/api/workflows/dify/status/{task_id}
```

#### 停止工作流

```bash
curl -X POST http://localhost:3000/api/workflows/dify/stop/{task_id} \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123"
  }'
```

## API端点列表

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/workflows/dify/execute` | POST | 执行工作流 |
| `/api/workflows/dify/status/:taskId` | GET | 查询执行状态 |
| `/api/workflows/dify/stop/:taskId` | POST | 停止工作流 |
| `/api/workflows/dify/info` | GET | 获取应用信息 |
| `/api/workflows/dify/parameters` | GET | 获取应用参数 |
| `/api/workflows/dify/upload` | POST | 上传文件 |
| `/api/workflows/dify/health` | GET | 健康检查 |

## 输入参数格式

工作流输入必须是有效的JSON对象，键名需与Dify工作流中定义的变量名匹配：

```json
{
  "query": "用户输入的问题",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    "workflow_run_id": "wfr_xxxxx",
    "task_id": "task_xxxxx",
    "data": {
      "outputs": {
        "result": "工作流输出结果"
      },
      "status": "succeeded",
      "elapsed_time": 1.23,
      "total_tokens": 150,
      "created_at": 1234567890
    }
  },
  "message": "Dify workflow executed successfully"
}
```

### 错误响应

```json
{
  "error": {
    "message": "错误信息",
    "code": 400
  }
}
```

## 常见问题

### 1. 认证失败
- 检查DIFY_API_KEY是否正确
- 确保API密钥没有过期
- 验证DIFY_API_URL是否正确

### 2. 工作流执行失败
- 检查工作流ID是否正确
- 确认输入参数格式符合工作流要求
- 查看Dify平台的工作流日志

### 3. 超时错误
- 工作流执行时间可能较长
- 当前超时设置为60秒
- 对于长时间任务，建议使用streaming模式

## 高级功能

### 流式响应

设置 `responseMode` 为 `streaming` 可以获取实时输出：

```json
{
  "inputs": { "query": "你好" },
  "responseMode": "streaming",
  "userId": "user123"
}
```

### 文件上传

对于需要文件输入的工作流：

```bash
curl -X POST http://localhost:3000/api/workflows/dify/upload \
  -F "file=@document.pdf" \
  -F "userId=user123"
```

然后在执行工作流时使用返回的文件ID：

```json
{
  "inputs": {
    "upload": {
      "type": "document",
      "transfer_method": "local_file",
      "upload_file_id": "file_xxxxx"
    }
  }
}
```

## 相关链接

- [Dify官方文档](https://docs.dify.ai)
- [Dify API文档](https://docs.dify.ai/en/advanced/api)
- [Dify云端平台](https://cloud.dify.ai)
- [Dify GitHub](https://github.com/langgenius/dify)

## 技术支持

如有问题，请查看：
1. 后端日志：`backend/logs/app.log`
2. Dify平台的工作流执行日志
3. 浏览器开发者工具的控制台
