import React, { useState, useRef, useCallback } from 'react';
import { Card, Button, Space, Drawer, Form, Input, Select, Modal, App } from 'antd';
import { 
  PlusOutlined, 
  SaveOutlined, 
  PlayCircleOutlined,
  DeleteOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ExpandOutlined
} from '@ant-design/icons';

// 节点类型定义
interface WorkflowNode {
  id: string;
  type: 'start' | 'llm' | 'tool' | 'condition' | 'knowledge' | 'code' | 'http' | 'end';
  title: string;
  description: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

interface WorkflowEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

// 节点类型配置
const NODE_TYPES = {
  start: { label: '开始', color: '#52c41a', icon: '▶' },
  llm: { label: 'LLM', color: '#1890ff', icon: '🤖' },
  tool: { label: '工具', color: '#722ed1', icon: '🔧' },
  condition: { label: '条件判断', color: '#faad14', icon: '⚡' },
  knowledge: { label: '知识库', color: '#13c2c2', icon: '📚' },
  code: { label: '代码', color: '#eb2f96', icon: '💻' },
  http: { label: 'HTTP请求', color: '#fa541c', icon: '🌐' },
  end: { label: '结束', color: '#f5222d', icon: '⏹' },
};

const DifyStyleEditor: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [form] = Form.useForm();
  const { message } = App.useApp();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeIdCounter = useRef(0);
  const isDragging = useRef(false);
  const dragNode = useRef<WorkflowNode | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const connecting = useRef<{ sourceId: string; startX: number; startY: number } | null>(null);
  const [tempConnection, setTempConnection] = useState<{ x: number; y: number } | null>(null);

  // 添加节点
  const addNode = (type: keyof typeof NODE_TYPES) => {
    const id = `node-${++nodeIdCounter.current}`;
    const newNode: WorkflowNode = {
      id,
      type,
      title: `${NODE_TYPES[type].label}节点`,
      description: '',
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 150,
      config: {},
    };
    setNodes([...nodes, newNode]);
    message.success(`已添加${NODE_TYPES[type].label}节点`);
  };

  // 开始拖拽节点
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    if (e.button === 0) { // 左键
      isDragging.current = true;
      dragNode.current = node;
      dragStart.current = {
        x: e.clientX - node.x,
        y: e.clientY - node.y,
      };
    }
  };

  // 开始连接
  const handleOutputMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      connecting.current = {
        sourceId: nodeId,
        startX: (e.clientX - rect.left - offset.x) / scale,
        startY: (e.clientY - rect.top - offset.y) / scale,
      };
    }
  };

  // 完成连接
  const handleInputMouseUp = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (connecting.current && connecting.current.sourceId !== targetId) {
      // 检查是否已存在相同连接
      const exists = edges.some(
        edge => edge.sourceId === connecting.current!.sourceId && edge.targetId === targetId
      );
      
      if (!exists) {
        const newEdge: WorkflowEdge = {
          id: `edge-${Date.now()}`,
          sourceId: connecting.current.sourceId,
          targetId,
        };
        setEdges([...edges, newEdge]);
        message.success('连接已创建');
      }
    }
    connecting.current = null;
    setTempConnection(null);
  };

  // 鼠标移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;

    // 处理节点拖拽
    if (isDragging.current && dragNode.current) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      
      setNodes(nodes.map(n => 
        n.id === dragNode.current!.id ? { ...n, x: newX, y: newY } : n
      ));
    }

    // 处理临时连接线
    if (connecting.current) {
      setTempConnection({ x: mouseX, y: mouseY });
    }
  }, [nodes, scale, offset]);

  // 鼠标释放
  const handleMouseUp = () => {
    isDragging.current = false;
    dragNode.current = null;
    connecting.current = null;
    setTempConnection(null);
  };

  // 画布点击
  const handleCanvasClick = () => {
    setSelectedNode(null);
    connecting.current = null;
    setTempConnection(null);
  };

  // 选择节点
  const handleNodeClick = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    setSelectedNode(node);
    form.setFieldsValue({
      title: node.title,
      description: node.description,
      type: node.type,
    });
    setIsDrawerVisible(true);
  };

  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    Modal.confirm({
      title: '删除节点',
      content: '确定要删除这个节点吗？相关的连接也会被删除。',
      onOk: () => {
        setNodes(nodes.filter(n => n.id !== nodeId));
        setEdges(edges.filter(e => e.sourceId !== nodeId && e.targetId !== nodeId));
        setSelectedNode(null);
        message.success('节点已删除');
      },
    });
  };

  // 删除连接
  const handleDeleteEdge = (edgeId: string) => {
    setEdges(edges.filter(e => e.id !== edgeId));
    message.success('连接已删除');
  };

  // 保存节点配置
  const handleSaveNode = async () => {
    try {
      const values = await form.validateFields();
      if (selectedNode) {
        setNodes(nodes.map(n => 
          n.id === selectedNode.id 
            ? { ...n, title: values.title, description: values.description }
            : n
        ));
        message.success('节点已更新');
        setIsDrawerVisible(false);
      }
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 保存工作流
  const handleSaveWorkflow = () => {
    const workflow = {
      nodes,
      edges,
      name: '我的工作流',
      createdAt: new Date(),
    };
    localStorage.setItem('workflow', JSON.stringify(workflow));
    message.success('工作流已保存到本地存储');
  };

  // 加载工作流
  const handleLoadWorkflow = () => {
    const saved = localStorage.getItem('workflow');
    if (saved) {
      try {
        const workflow = JSON.parse(saved);
        setNodes(workflow.nodes || []);
        setEdges(workflow.edges || []);
        message.success('工作流已加载');
      } catch (error) {
        message.error('加载失败');
      }
    } else {
      message.warning('没有保存的工作流');
    }
  };

  // 执行工作流
  const handleExecute = () => {
    if (nodes.length === 0) {
      message.warning('请先添加节点');
      return;
    }
    message.info('工作流将提交到Dify后端执行（需要配置API）');
    console.log('执行工作流:', { nodes, edges });
  };

  // 缩放控制
  const handleZoomIn = () => setScale(Math.min(scale + 0.1, 2));
  const handleZoomOut = () => setScale(Math.max(scale - 0.1, 0.3));
  const handleFitScreen = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // 渲染SVG连接线
  const renderEdges = () => {
    return edges.map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.sourceId);
      const targetNode = nodes.find(n => n.id === edge.targetId);
      
      if (!sourceNode || !targetNode) return null;
      
      const x1 = sourceNode.x + 180; // 节点宽度
      const y1 = sourceNode.y + 40;  // 节点高度的一半
      const x2 = targetNode.x;
      const y2 = targetNode.y + 40;
      
      const midX = (x1 + x2) / 2;
      
      return (
        <g key={edge.id}>
          <path
            d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
            stroke="#999"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          {/* 删除按钮 */}
          <circle
            cx={(x1 + x2) / 2}
            cy={(y1 + y2) / 2}
            r="8"
            fill="white"
            stroke="#ff4d4f"
            strokeWidth="1"
            style={{ cursor: 'pointer' }}
            onClick={() => handleDeleteEdge(edge.id)}
          />
          <text
            x={(x1 + x2) / 2}
            y={(y1 + y2) / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ff4d4f"
            fontSize="12"
            style={{ pointerEvents: 'none' }}
          >
            ×
          </text>
        </g>
      );
    });
  };

  // 渲染临时连接线
  const renderTempConnection = () => {
    if (!connecting.current || !tempConnection) return null;
    
    const sourceNode = nodes.find(n => n.id === connecting.current!.sourceId);
    if (!sourceNode) return null;
    
    const x1 = sourceNode.x + 180;
    const y1 = sourceNode.y + 40;
    const x2 = tempConnection.x;
    const y2 = tempConnection.y;
    const midX = (x1 + x2) / 2;
    
    return (
      <path
        d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
        stroke="#1890ff"
        strokeWidth="2"
        strokeDasharray="5,5"
        fill="none"
      />
    );
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Dify风格工作流编辑器</h1>
        <Space>
          <Button onClick={handleZoomOut} icon={<ZoomOutOutlined />} title="缩小" />
          <span>{Math.round(scale * 100)}%</span>
          <Button onClick={handleZoomIn} icon={<ZoomInOutlined />} title="放大" />
          <Button onClick={handleFitScreen} icon={<ExpandOutlined />} title="适应屏幕" />
          <Button onClick={handleLoadWorkflow}>加载</Button>
          <Button onClick={handleSaveWorkflow} icon={<SaveOutlined />}>
            保存
          </Button>
          <Button type="primary" onClick={handleExecute} icon={<PlayCircleOutlined />}>
            执行
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', height: '100%', gap: 16 }}>
        {/* 左侧节点面板 */}
        <Card style={{ width: 220, padding: 0 }}>
          <div style={{ padding: 16 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>节点类型</h3>
            <Space direction="vertical" style={{ width: '100%' }}>
              {Object.entries(NODE_TYPES).map(([type, config]) => (
                <Button
                  key={type}
                  block
                  onClick={() => addNode(type as keyof typeof NODE_TYPES)}
                  icon={<PlusOutlined />}
                  style={{
                    background: config.color,
                    color: 'white',
                    border: 'none',
                    textAlign: 'left',
                    paddingLeft: 12,
                    height: 'auto',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{config.icon}</span>
                    <span style={{ fontWeight: 'bold' }}>{config.label}</span>
                  </div>
                </Button>
              ))}
            </Space>

            <div style={{ marginTop: 24, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <p style={{ fontSize: 12, margin: 0, color: '#666', lineHeight: 1.8 }}>
                💡 <strong>使用说明：</strong><br/>
                • 点击按钮添加节点<br/>
                • 拖拽节点调整位置<br/>
                • 从右侧绿点拖到左侧蓝点连接<br/>
                • 点击节点编辑配置<br/>
                • 点击连线上的×删除连接
              </p>
            </div>
          </div>
        </Card>

        {/* 画布区域 */}
        <Card style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            style={{
              width: '100%',
              height: '100%',
              background: '#fafafa',
              backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              position: 'relative',
              overflow: 'hidden',
              cursor: isDragging.current ? 'grabbing' : 'grab',
            }}
          >
            <div style={{ 
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, 
              transformOrigin: '0 0',
              width: '100%',
              height: '100%',
            }}>
              {/* SVG连接线层 */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#999" />
                  </marker>
                </defs>
                {renderEdges()}
                {renderTempConnection()}
              </svg>

              {/* 渲染节点 */}
              {nodes.map(node => {
                const nodeConfig = NODE_TYPES[node.type];
                const isSelected = selectedNode?.id === node.id;
                
                return (
                  <div
                    key={node.id}
                    onMouseDown={(e) => handleNodeMouseDown(e, node)}
                    onClick={(e) => handleNodeClick(e, node)}
                    style={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: 180,
                      background: 'white',
                      border: `2px solid ${isSelected ? '#1890ff' : nodeConfig.color}`,
                      borderRadius: 8,
                      boxShadow: isSelected 
                        ? '0 0 0 3px rgba(24,144,255,0.2), 0 4px 12px rgba(0,0,0,0.15)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      cursor: 'move',
                      zIndex: 2,
                      userSelect: 'none',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {/* 节点头部 */}
                    <div style={{
                      background: nodeConfig.color,
                      color: 'white',
                      padding: '10px 12px',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <span style={{ fontSize: 18 }}>{nodeConfig.icon}</span>
                      <span style={{ fontWeight: 'bold', fontSize: 14 }}>{node.title}</span>
                    </div>
                    
                    {/* 节点内容 */}
                    <div style={{ padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, color: '#666', minHeight: 20 }}>
                        {node.description || '点击编辑'}
                      </div>
                    </div>

                    {/* 输入连接点（左侧蓝色） */}
                    <div
                      onMouseUp={(e) => handleInputMouseUp(e, node.id)}
                      style={{
                        position: 'absolute',
                        left: -8,
                        top: 36,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#1890ff',
                        border: '3px solid white',
                        cursor: 'crosshair',
                        zIndex: 3,
                        boxShadow: '0 0 0 2px #1890ff',
                      }}
                      title="输入点"
                    />

                    {/* 输出连接点（右侧绿色） */}
                    <div
                      onMouseDown={(e) => handleOutputMouseDown(e, node.id)}
                      style={{
                        position: 'absolute',
                        right: -8,
                        top: 36,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        background: '#52c41a',
                        border: '3px solid white',
                        cursor: 'crosshair',
                        zIndex: 3,
                        boxShadow: '0 0 0 2px #52c41a',
                      }}
                      title="输出点（拖拽以连接）"
                    />

                    {/* 删除按钮 */}
                    {isSelected && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: -12,
                          right: -12,
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: 'white',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      />
                    )}
                  </div>
                );
              })}

              {/* 空状态提示 */}
              {nodes.length === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: '#999',
                  pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.3 }}>📋</div>
                  <p style={{ fontSize: 18, margin: '0 0 8px 0' }}>点击左侧按钮添加节点</p>
                  <p style={{ fontSize: 14, margin: 0, opacity: 0.7 }}>构建您的AI工作流</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 节点配置抽屉 */}
      <Drawer
        title="节点配置"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={400}
      >
        {selectedNode && (
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="节点名称"
              rules={[{ required: true, message: '请输入节点名称' }]}
            >
              <Input placeholder="输入节点名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
            >
              <Input.TextArea rows={3} placeholder="描述此节点的功能" />
            </Form.Item>

            <Form.Item
              name="type"
              label="节点类型"
            >
              <Select disabled>
                {Object.entries(NODE_TYPES).map(([type, config]) => (
                  <Select.Option key={type} value={type}>
                    {config.icon} {config.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <div style={{ 
              padding: 12, 
              background: '#f5f5f5', 
              borderRadius: 4,
              marginBottom: 16
            }}>
              <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
                <strong>节点ID:</strong> {selectedNode.id}<br/>
                <strong>位置:</strong> ({Math.round(selectedNode.x)}, {Math.round(selectedNode.y)})
              </p>
            </div>

            <Form.Item>
              <Button type="primary" onClick={handleSaveNode} block>
                保存配置
              </Button>
            </Form.Item>
          </Form>
        )}
      </Drawer>
    </div>
  );
};

export default DifyStyleEditor;
