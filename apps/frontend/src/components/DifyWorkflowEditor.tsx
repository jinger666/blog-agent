/**
 * Dify风格可视化工作流编辑器
 * 基于ReactFlow实现专业的拖拽、连接功能
 * 左侧面板可拖拽节点到画布
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Handle,
  Position,
  NodeProps,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, Button, Space, message, Drawer, Form, Input, Select, Modal, Tooltip, Popconfirm } from 'antd';
import { 
  SaveOutlined, 
  PlayCircleOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UndoOutlined,
  RedoOutlined,
  SearchOutlined,
  PlusOutlined,
  SettingOutlined
} from '@ant-design/icons';



// 自定义节点类型 - Dify风格，显示输入输出配置
const StartNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '280px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 8, height: 8, border: '2px solid #fff' }} />
      
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '6px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '14px'
        }}>
          C
        </div>
        <strong style={{ fontSize: '15px', color: '#1f2937' }}>{data.label || '开始'}</strong>
      </div>

      {/* 输入变量 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: '8px',
        background: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>输入</span>
        <span style={{ 
          fontSize: '12px', 
          color: '#6b7280',
          background: '#fff',
          padding: '2px 8px',
          borderRadius: '4px',
          border: '1px solid #e5e7eb'
        }}>
          str.<strong style={{ color: '#3b82f6' }}>input</strong>
        </span>
      </div>
    </div>
  );
};

const LLMNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '320px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 8, height: 8, border: '2px solid #fff' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 8, height: 8, border: '2px solid #fff' }} />
      
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '6px', 
            background: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '14px'
          }}>
            🤖
          </div>
          <strong style={{ fontSize: '15px', color: '#1f2937' }}>{data.label || '大模型'}</strong>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', color: '#9ca3af', cursor: 'pointer' }}>▶</span>
          <span style={{ fontSize: '16px', color: '#9ca3af', cursor: 'pointer' }}>•••</span>
        </div>
      </div>

      {/* 配置项 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 输入 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>输入</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#f59e0b',
            background: '#fef3c7',
            padding: '3px 10px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontSize: '10px' }}>ⓘ</span>
            input
          </span>
        </div>

        {/* 输出 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>输出</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            background: '#f3f4f6',
            padding: '3px 10px',
            borderRadius: '4px'
          }}>
            str.<strong style={{ color: '#3b82f6' }}>output</strong>
          </span>
        </div>

        {/* 模型 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>模型</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ fontSize: '14px' }}>🔵</span>
            豆包·1.8·深度思考
          </span>
        </div>

        {/* 技能 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>技能</span>
          <span style={{ fontSize: '12px', color: '#d1d5db' }}>未配置技能</span>
        </div>
      </div>
    </div>
  );
};

const ToolNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '300px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 8, height: 8, border: '2px solid #fff' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 8, height: 8, border: '2px solid #fff' }} />
      
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '6px', 
          background: '#8b5cf6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '14px'
        }}>
          🔧
        </div>
        <strong style={{ fontSize: '15px', color: '#1f2937' }}>{data.label || '工具'}</strong>
      </div>

      {/* 配置项 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>输入</span>
          <span style={{ fontSize: '12px', color: '#d1d5db' }}>未配置输入</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>输出</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            background: '#f3f4f6',
            padding: '3px 10px',
            borderRadius: '4px'
          }}>
            str.output
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>工具</span>
          <span style={{ fontSize: '12px', color: '#d1d5db' }}>未选择工具</span>
        </div>
      </div>
    </div>
  );
};

const ConditionNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '300px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 8, height: 8, border: '2px solid #fff' }} />
      <Handle type="source" position={Position.Right} id="true" style={{ background: '#10b981', width: 8, height: 8, border: '2px solid #fff', top: '30%' }} />
      <Handle type="source" position={Position.Right} id="false" style={{ background: '#ef4444', width: 8, height: 8, border: '2px solid #fff', top: '70%' }} />
      
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '6px', 
          background: '#f59e0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '14px'
        }}>
          ⚡
        </div>
        <strong style={{ fontSize: '15px', color: '#1f2937' }}>{data.label || '条件判断'}</strong>
      </div>

      {/* 配置项 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>条件</span>
          <span style={{ fontSize: '12px', color: '#d1d5db' }}>未配置条件</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '40px' }}>分支</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ 
              fontSize: '11px', 
              color: '#10b981',
              background: '#d1fae5',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>True</span>
            <span style={{ 
              fontSize: '11px', 
              color: '#ef4444',
              background: '#fee2e2',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>False</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EndNode = ({ data }: NodeProps) => {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '280px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 8, height: 8, border: '2px solid #fff' }} />
      
      {/* 头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ 
          width: '24px', 
          height: '24px', 
          borderRadius: '6px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '14px'
        }}>
          →
        </div>
        <strong style={{ fontSize: '15px', color: '#1f2937' }}>{data.label || '结束'}</strong>
      </div>

      {/* 输出配置 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '50px' }}>输出</span>
          <span style={{ 
            fontSize: '12px', 
            color: '#f59e0b',
            background: '#fef3c7',
            padding: '3px 10px',
            borderRadius: '4px'
          }}>
            str.<strong style={{ color: '#3b82f6' }}>output</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#9ca3af', width: '50px' }}>输出类型</span>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>返回变量</span>
        </div>
      </div>
    </div>
  );
};

// 注册自定义节点类型
const nodeTypes = {
  start: StartNode,
  llm: LLMNode,
  tool: ToolNode,
  condition: ConditionNode,
  end: EndNode,
};

// 节点类型配置 - 扩展版，按类别分组
const NODE_CATEGORIES = [
  {
    name: 'AI 能力',
    nodes: [
      { type: 'llm', label: '大模型', icon: '🤖', color: '#1f2937', description: '调用大语言模型处理文本' },
    ]
  },
  {
    name: '输入&输出',
    nodes: [
      { type: 'start', label: '输入', icon: 'C', color: '#6366f1', description: '工作流的起点' },
      { type: 'end', label: '输出', icon: '→', color: '#6366f1', description: '工作流的终点' },
    ]
  },
  {
    name: '业务逻辑',
    nodes: [
      { type: 'code', label: '代码', icon: '</>', color: '#14b8a6', description: '执行自定义代码' },
      { type: 'tool', label: '工具', icon: '🔧', color: '#722ed1', description: '调用外部工具或API' },
      { type: 'condition', label: '选择器', icon: 'IF', color: '#14b8a6', description: '根据条件分支执行' },
    ]
  },
  {
    name: '流程控制',
    nodes: [
      { type: 'loop', label: '循环', icon: '↻', color: '#14b8a6', description: '循环执行' },
      { type: 'batch', label: '批处理', icon: '⚙', color: '#14b8a6', description: '批量处理数据' },
    ]
  },
  {
    name: '数据库',
    nodes: [
      { type: 'db_query', label: '查询数据', icon: '📊', color: '#f97316', description: '查询数据库' },
      { type: 'db_insert', label: '新增数据', icon: '➕', color: '#f97316', description: '插入数据' },
      { type: 'db_update', label: '更新数据', icon: '✏️', color: '#f97316', description: '更新数据' },
      { type: 'db_delete', label: '删除数据', icon: '❌', color: '#f97316', description: '删除数据' },
    ]
  },
  {
    name: '知识库&数据',
    nodes: [
      { type: 'knowledge_write', label: '知识库写入', icon: '📝', color: '#f97316', description: '写入知识库' },
      { type: 'knowledge_search', label: '知识库检索', icon: '🔍', color: '#f97316', description: '检索知识库' },
    ]
  },
];

// 保留旧的配置用于兼容
const NODE_TYPE_CONFIG = NODE_CATEGORIES.flatMap(cat => cat.nodes);

// 添加节点面板 - Dify风格弹出面板
interface AddNodePanelProps {
  visible: boolean;
  onClose: () => void;
  onAddNode: (nodeType: string) => void;
}

const AddNodePanel: React.FC<AddNodePanelProps> = ({ visible, onClose, onAddNode }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!visible) return null;

  // 过滤节点
  const filteredCategories = NODE_CATEGORIES.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(node => 
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.nodes.length > 0);

  return (
    <>
      {/* 遮罩层 */}
      <div 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          zIndex: 999 
        }}
        onClick={onClose}
      />
      
      {/* 面板 */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        maxHeight: '450px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* 搜索框 */}
        <div style={{ 
          padding: '16px 20px', 
          borderBottom: '1px solid #f3f4f6' 
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#f9fafb',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
          }}>
            <SearchOutlined style={{ fontSize: '16px', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="搜索节点、插件、工作流"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                outline: 'none',
                color: '#1f2937',
              }}
            />
          </div>
        </div>

        {/* 节点列表 */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px 20px' 
        }}>
          {filteredCategories.map((category, catIndex) => (
            <div key={category.name} style={{ marginBottom: catIndex < filteredCategories.length - 1 ? '16px' : '0' }}>
              {/* 分类标题 */}
              <div style={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                color: '#6b7280',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {category.name}
              </div>

              {/* 节点网格 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
              }}>
                {category.nodes.map((node) => (
                  <div
                    key={node.type}
                    onClick={() => {
                      onAddNode(node.type);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    {/* 图标 */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: node.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '14px',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {node.icon}
                    </div>
                    {/* 标签 */}
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#374151',
                      fontWeight: 500,
                    }}>
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// 工作流编辑器主组件
const WorkflowCanvas: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  // 初始化节点状态：默认包含开始和结束节点
  const initialNodes: Node[] = [];
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isAddNodePanelVisible, setIsAddNodePanelVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Undo/Redo 历史记录
  const [history, setHistory] = useState<Array<{ nodes: Node[], edges: Edge[] }>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // 初始化状态标记
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化开始和结束节点
  useEffect(() => {
    // 只在首次加载时执行
    if (!isInitialized) {
      const timer = setTimeout(() => {
        const wrapper = reactFlowWrapper.current;
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          const startX = rect.width * 0.2;
          const endX = rect.width * 0.8;
          const centerY = rect.height / 2;

          const startPosition = screenToFlowPosition({ x: startX, y: centerY });
          const endPosition = screenToFlowPosition({ x: endX, y: centerY });

          const startNode: Node = {
            id: 'node-start',
            type: 'start',
            position: startPosition,
            data: {
              label: '开始',
              inputVarName: 'input',
              inputVarType: 'String',
              description: '工作流的起点',
            },
          };

          const endNode: Node = {
            id: 'node-end',
            type: 'end',
            position: endPosition,
            data: {
              label: '结束',
              outputVarName: 'output',
              outputType: 'return_variable',
              description: '工作流的终点',
            },
          };

          const initialNodes = [startNode, endNode];
          setNodes(initialNodes);
          setHistory([{ nodes: initialNodes, edges: [] }]);
          setHistoryIndex(0);
          setIsInitialized(true);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);


  // 保存历史状态（用于撤销/重做）
  const saveToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    const newState = { nodes: [...newNodes], edges: [...newEdges] };
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      // 限制历史记录数量为50步
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // 撤销功能
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setHistoryIndex(historyIndex - 1);
      message.success('已撤销');
    } else if (historyIndex === 0) {
      // 回到初始状态（开始和结束节点）
      const wrapper = reactFlowWrapper.current;
      if (wrapper) {
        const rect = wrapper.getBoundingClientRect();
        const startX = rect.width * 0.2;
        const endX = rect.width * 0.8;
        const centerY = rect.height / 2;

        const startPosition = screenToFlowPosition({ x: startX, y: centerY });
        const endPosition = screenToFlowPosition({ x: endX, y: centerY });

        const initialNodes: Node[] = [
          {
            id: 'node-start',
            type: 'start',
            position: startPosition,
            data: {
              label: '开始',
              inputVarName: 'input',
              inputVarType: 'String',
              description: '工作流的起点',
            },
          },
          {
            id: 'node-end',
            type: 'end',
            position: endPosition,
            data: {
              label: '结束',
              outputVarName: 'output',
              outputType: 'return_variable',
              description: '工作流的终点',
            },
          },
        ];
        setNodes(initialNodes);
        setEdges([]);
        setHistoryIndex(0);
        message.success('已撤销到初始状态');
      }
    }
  }, [history, historyIndex, setNodes, setEdges, screenToFlowPosition]);

  // 重做功能
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryIndex(historyIndex + 1);
      message.success('已重做');
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // 处理拖放
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const config = NODE_TYPE_CONFIG.find(c => c.type === type);
      if (!config) return;

      // 根据节点类型设置默认配置
      const defaultData: any = { 
        label: config.label,
        description: '',
      };

      // 开始节点默认配置
      if (type === 'start') {
        defaultData.inputVarName = 'input';
        defaultData.inputVarType = 'String';
      }
      // 大模型节点默认配置
      else if (type === 'llm') {
        defaultData.model = 'doubao-1.8-pro';
        defaultData.prompt = '请根据以下输入生成内容：{{input}}';
        defaultData.temperature = 0.7;
        defaultData.maxTokens = 2048;
        defaultData.inputVarName = '{{node_1.output}}';
        defaultData.outputVarName = 'output';
      }
      // 结束节点默认配置
      else if (type === 'end') {
        defaultData.outputVarName = '{{llm_node.output}}';
        defaultData.outputType = 'return_variable';
      }
      // 工具节点默认配置
      else if (type === 'tool') {
        defaultData.toolName = undefined;
        defaultData.toolParams = '{}';
      }
      // 条件节点默认配置
      else if (type === 'condition') {
        defaultData.conditionVar = '{{node.output}}';
        defaultData.conditionOperator = 'equals';
        defaultData.conditionValue = 'true';
      }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type,
        position,
        data: defaultData,
      };

      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        saveToHistory(newNodes, edges);
        return newNodes;
      });
      message.success(`已添加${config.label}节点`);
    },
    [screenToFlowPosition, setNodes, edges, saveToHistory]
  );

  // 处理从面板添加节点
  const handleAddNodeFromPanel = useCallback(
    (nodeType: string) => {
      const config = NODE_TYPE_CONFIG.find(c => c.type === nodeType);
      if (!config) return;

      // 获取画布中心位置
      const wrapper = reactFlowWrapper.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const position = screenToFlowPosition({
        x: centerX,
        y: centerY,
      });

      // 根据节点类型设置默认配置
      const defaultData: any = { 
        label: config.label,
        description: '',
      };

      // 开始节点默认配置
      if (nodeType === 'start') {
        defaultData.inputVarName = 'input';
        defaultData.inputVarType = 'String';
      }
      // 大模型节点默认配置
      else if (nodeType === 'llm') {
        defaultData.model = 'doubao-1.8-pro';
        defaultData.prompt = '请根据以下输入生成内容：{{input}}';
        defaultData.temperature = 0.7;
        defaultData.maxTokens = 2048;
        defaultData.inputVarName = '{{node_1.output}}';
        defaultData.outputVarName = 'output';
      }
      // 结束节点默认配置
      else if (nodeType === 'end') {
        defaultData.outputVarName = '{{llm_node.output}}';
        defaultData.outputType = 'return_variable';
      }
      // 工具节点默认配置
      else if (nodeType === 'tool') {
        defaultData.toolName = undefined;
        defaultData.toolParams = '{}';
      }
      // 条件节点默认配置
      else if (nodeType === 'condition') {
        defaultData.conditionVar = '{{node.output}}';
        defaultData.conditionOperator = 'equals';
        defaultData.conditionValue = 'true';
      }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position,
        data: defaultData,
      };

      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        saveToHistory(newNodes, edges);
        return newNodes;
      });
      message.success(`已添加${config.label}节点`);
    },
    [screenToFlowPosition, setNodes, edges, saveToHistory]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // 连接节点
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const newEdges = addEdge({ 
          ...params, 
          animated: true,
          style: { stroke: '#999', strokeWidth: 2 }
        }, eds);
        saveToHistory(nodes, newEdges);
        return newEdges;
      });
    },
    [setEdges, nodes, saveToHistory]
  );

  // 节点变化（移动、删除等）
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const newNodes = applyNodeChanges(changes, nds);
      // 只在删除时保存历史
      if (changes.some(change => change.type === 'remove')) {
        saveToHistory(newNodes, edges);
      }
      return newNodes;
    });
  }, [setNodes, edges, saveToHistory]);

  // 连线变化（删除等）
  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const newEdges = applyEdgeChanges(changes, eds);
      // 只在删除时保存历史
      if (changes.some(change => change.type === 'remove')) {
        saveToHistory(nodes, newEdges);
      }
      return newEdges;
    });
  }, [setEdges, nodes, saveToHistory]);

  // 节点点击
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedEdge(null);
    setSelectedNode(node);
    
    // 加载节点的所有配置字段
    const formValues: any = {
      label: node.data.label,
      description: node.data.description || '',
      type: node.type,
    };

    // 根据节点类型加载特定字段
    if (node.type === 'start') {
      formValues.inputVarName = node.data.inputVarName || 'input';
      formValues.inputVarType = node.data.inputVarType || 'String';
    } else if (node.type === 'llm') {
      formValues.model = node.data.model || 'doubao-1.8-pro';
      formValues.prompt = node.data.prompt || '';
      formValues.temperature = node.data.temperature || 0.7;
      formValues.maxTokens = node.data.maxTokens || 2048;
      formValues.inputVarName = node.data.inputVarName || '';
      formValues.outputVarName = node.data.outputVarName || 'output';
    } else if (node.type === 'end') {
      formValues.outputVarName = node.data.outputVarName || '';
      formValues.outputType = node.data.outputType || 'return_variable';
    } else if (node.type === 'tool') {
      formValues.toolName = node.data.toolName;
      formValues.toolParams = node.data.toolParams || '{}';
    } else if (node.type === 'condition') {
      formValues.conditionVar = node.data.conditionVar || '';
      formValues.conditionOperator = node.data.conditionOperator || 'equals';
      formValues.conditionValue = node.data.conditionValue || '';
    }

    form.setFieldsValue(formValues);
    setIsDrawerVisible(true);
  }, [form]);

  // 连线点击
  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedNode(null);
    setSelectedEdge(edge);
    setIsDrawerVisible(false);
  }, []);

  // 画布点击（取消选择）
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setIsDrawerVisible(false);
  }, []);

  // 删除节点
  const handleDeleteNode = (nodeId: string) => {
    Modal.confirm({
      title: '删除节点',
      content: '确定要删除这个节点吗？',
      onOk: () => {
        setNodes((nds) => {
          const newNodes = nds.filter((n) => n.id !== nodeId);
          setEdges((eds) => {
            const newEdges = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
            saveToHistory(newNodes, newEdges);
            return newEdges;
          });
          return newNodes;
        });
        setSelectedNode(null);
        setIsDrawerVisible(false);
        message.success('节点已删除');
      },
    });
  };

  // 删除连线
  const handleDeleteEdge = (edgeId: string) => {
    setEdges((eds) => {
      const newEdges = eds.filter((e) => e.id !== edgeId);
      saveToHistory(nodes, newEdges);
      return newEdges;
    });
    setSelectedEdge(null);
    message.success('连线已删除');
  };

  // 保存节点配置
  const handleSaveNode = async () => {
    try {
      const values = await form.validateFields();
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === selectedNode.id) {
              return {
                ...node,
                data: { ...node.data, ...values },
              };
            }
            return node;
          })
        );
        message.success('节点配置已保存');
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
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('dify-workflow', JSON.stringify(workflow));
    message.success('工作流已保存');
  };

  // 加载工作流
  const handleLoadWorkflow = () => {
    const saved = localStorage.getItem('dify-workflow');
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
    message.info('工作流将提交到后端执行');
    console.log('执行工作流:', { nodes, edges });
  };

  // 清空画布
  const handleClear = () => {
    Modal.confirm({
      title: '清空画布',
      content: '确定要清空所有节点和连接吗？将恢复到初始的开始和结束节点。',
      onOk: () => {
        const wrapper = reactFlowWrapper.current;
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect();
          const startX = rect.width * 0.2;
          const endX = rect.width * 0.8;
          const centerY = rect.height / 2;

          const startPosition = screenToFlowPosition({ x: startX, y: centerY });
          const endPosition = screenToFlowPosition({ x: endX, y: centerY });

          const initialNodes: Node[] = [
            {
              id: 'node-start',
              type: 'start',
              position: startPosition,
              data: {
                label: '开始',
                inputVarName: 'input',
                inputVarType: 'String',
                description: '工作流的起点',
              },
            },
            {
              id: 'node-end',
              type: 'end',
              position: endPosition,
              data: {
                label: '结束',
                outputVarName: 'output',
                outputType: 'return_variable',
                description: '工作流的终点',
              },
            },
          ];
          setNodes(initialNodes);
          setEdges([]);
          setSelectedNode(null);
          setHistory([{ nodes: initialNodes, edges: [] }]);
          setHistoryIndex(0);
          message.success('画布已重置为初始状态');
        }
      },
    });
  };



  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z 撤销
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        handleUndo();
      }
      // Ctrl+Y 重做
      if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
        event.preventDefault();
        handleRedo();
      }
      // Delete 或 Backspace 删除选中的节点或连线
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // 如果正在输入框中，不处理
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
          return;
        }
        
        if (selectedEdge) {
          handleDeleteEdge(selectedEdge.id);
        } else if (selectedNode) {
          handleDeleteNode(selectedNode.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedNode, selectedEdge]);

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* 画布区域 */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
            selectNodesOnDrag={false}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap 
              nodeStrokeColor={(n) => {
                const config = NODE_TYPE_CONFIG.find(c => c.type === n.type);
                return config?.color || '#1890ff';
              }}
              nodeColor={(n) => {
                const config = NODE_TYPE_CONFIG.find(c => c.type === n.type);
                return config?.color + '20' || '#e6f7ff';
              }}
            />
          </ReactFlow>
        </div>

        {/* 连线删除提示 */}
        {selectedEdge && (
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            background: '#fff',
            padding: '8px 16px',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{ fontSize: '13px', color: '#666' }}>已选中连线</span>
            <Popconfirm
              title="确定要删除这条连线吗？"
              onConfirm={() => handleDeleteEdge(selectedEdge.id)}
              okText="删除"
              cancelText="取消"
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                删除连线
              </Button>
            </Popconfirm>
          </div>
        )}
      </div>

      {/* 节点配置抽屉 */}
      <Drawer
        title="节点配置"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
        width={480}
      >
        {selectedNode && (
          <>
            <Form form={form} layout="vertical">
              {/* 所有节点都有的通用字段 */}
              <Form.Item
                name="label"
                label="节点名称"
                rules={[{ required: true, message: '请输入节点名称' }]}
              >
                <Input placeholder="输入节点名称" />
              </Form.Item>

              {/* 开始节点配置 */}
              {selectedNode.type === 'start' && (
                <>
                  <Form.Item
                    name="inputVarName"
                    label="输入变量名"
                    tooltip="定义工作流的输入变量名称"
                  >
                    <Input placeholder="例如：input, query, text" />
                  </Form.Item>
                  <Form.Item
                    name="inputVarType"
                    label="变量类型"
                  >
                    <Select defaultValue="String">
                      <Select.Option value="String">String (字符串)</Select.Option>
                      <Select.Option value="Number">Number (数字)</Select.Option>
                      <Select.Option value="Boolean">Boolean (布尔)</Select.Option>
                      <Select.Option value="Object">Object (对象)</Select.Option>
                      <Select.Option value="Array">Array (数组)</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="节点描述"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="描述此节点的功能" 
                    />
                  </Form.Item>
                </>
              )}

              {/* 大模型节点配置 */}
              {selectedNode.type === 'llm' && (
                <>
                  <Form.Item
                    name="model"
                    label="模型选择"
                    rules={[{ required: true, message: '请选择模型' }]}
                  >
                    <Select placeholder="选择大语言模型">
                      <Select.Option value="doubao-1.8-pro">🔵 豆包·1.8·深度思考</Select.Option>
                      <Select.Option value="gpt-4o">🚀 GPT-4o</Select.Option>
                      <Select.Option value="gpt-4">💎 GPT-4</Select.Option>
                      <Select.Option value="gpt-3.5-turbo">⚡ GPT-3.5 Turbo</Select.Option>
                      <Select.Option value="claude-3-opus">🌟 Claude-3 Opus</Select.Option>
                      <Select.Option value="claude-3-sonnet">✨ Claude-3 Sonnet</Select.Option>
                      <Select.Option value="qwen-max">🔷 通义千问 Max</Select.Option>
                      <Select.Option value="ernie-bot-4">🟡 文心一言 4.0</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="prompt"
                    label="提示词 (Prompt)"
                    rules={[{ required: true, message: '请输入提示词' }]}
                  >
                    <Input.TextArea 
                      rows={6} 
                      placeholder="输入提示词，例如：\n请根据以下输入生成内容：{{input}}" 
                    />
                  </Form.Item>

                  <Form.Item
                    name="temperature"
                    label="Temperature (创造性)"
                    tooltip="值越高输出越随机，越低输出越确定性"
                  >
                    <Input type="number" min="0" max="2" step="0.1" defaultValue="0.7" />
                  </Form.Item>

                  <Form.Item
                    name="maxTokens"
                    label="最大 Token 数"
                  >
                    <Input type="number" min="1" max="8192" defaultValue="2048" />
                  </Form.Item>

                  <Form.Item
                    name="inputVarName"
                    label="输入变量"
                    tooltip="引用上游节点的输出变量"
                  >
                    <Input placeholder="例如：{{node_1.output}}" />
                  </Form.Item>

                  <Form.Item
                    name="outputVarName"
                    label="输出变量名"
                  >
                    <Input placeholder="例如：output" defaultValue="output" />
                  </Form.Item>
                </>
              )}

              {/* 结束节点配置 */}
              {selectedNode.type === 'end' && (
                <>
                  <Form.Item
                    name="outputVarName"
                    label="输出变量"
                    rules={[{ required: true, message: '请指定输出变量' }]}
                    tooltip="选择要输出的变量"
                  >
                    <Input placeholder="例如：{{llm_node.output}}" />
                  </Form.Item>
                  <Form.Item
                    name="outputType"
                    label="输出类型"
                  >
                    <Select defaultValue="return_variable">
                      <Select.Option value="return_variable">返回变量</Select.Option>
                      <Select.Option value="json">JSON 格式</Select.Option>
                      <Select.Option value="text">纯文本</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="description"
                    label="节点描述"
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="描述此节点的功能" 
                    />
                  </Form.Item>
                </>
              )}

              {/* 工具节点配置 */}
              {selectedNode.type === 'tool' && (
                <>
                  <Form.Item
                    name="toolName"
                    label="选择工具"
                    rules={[{ required: true, message: '请选择工具' }]}
                  >
                    <Select placeholder="选择要调用的工具">
                      <Select.Option value="web_search">🔍 网络搜索</Select.Option>
                      <Select.Option value="calculator">🧮 计算器</Select.Option>
                      <Select.Option value="weather">🌤️ 天气查询</Select.Option>
                      <Select.Option value="translation">🌐 翻译</Select.Option>
                      <Select.Option value="code_executor">💻 代码执行器</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="toolParams"
                    label="工具参数"
                  >
                    <Input.TextArea 
                      rows={4} 
                      placeholder="输入工具参数 (JSON 格式)" 
                    />
                  </Form.Item>
                </>
              )}

              {/* 条件节点配置 */}
              {selectedNode.type === 'condition' && (
                <>
                  <Form.Item
                    name="conditionVar"
                    label="条件变量"
                    rules={[{ required: true, message: '请指定条件变量' }]}
                  >
                    <Input placeholder="例如：{{node.output}}" />
                  </Form.Item>

                  <Form.Item
                    name="conditionOperator"
                    label="运算符"
                  >
                    <Select defaultValue="equals">
                      <Select.Option value="equals">等于 (==)</Select.Option>
                      <Select.Option value="not_equals">不等于 (!=)</Select.Option>
                      <Select.Option value="contains">包含 (contains)</Select.Option>
                      <Select.Option value="greater_than">大于 (&gt;)</Select.Option>
                      <Select.Option value="less_than">小于 (&lt;)</Select.Option>
                      <Select.Option value="regex">正则匹配 (regex)</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="conditionValue"
                    label="条件值"
                    rules={[{ required: true, message: '请输入条件值' }]}
                  >
                    <Input placeholder="例如：true, success" />
                  </Form.Item>
                </>
              )}

              {/* 节点类型 (只读) */}
              <Form.Item
                name="type"
                label="节点类型"
              >
                <Select disabled>
                  {NODE_TYPE_CONFIG.map((config) => (
                    <Select.Option key={config.type} value={config.type}>
                      {config.icon} {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>

            <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: '16px' }}>
              <Button danger onClick={() => handleDeleteNode(selectedNode.id)} icon={<DeleteOutlined />}>
                删除节点
              </Button>
              <Button type="primary" onClick={handleSaveNode}>
                保存配置
              </Button>
            </Space>
          </>
        )}
      </Drawer>

      {/* 底部工具栏 - Dify风格 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: '#fff',
        padding: '8px 12px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        {/* 撤销/重做 */}
        <Tooltip title="撤销 (Ctrl+Z)">
          <Button 
            size="small" 
            onClick={handleUndo}
            disabled={historyIndex < 0}
            icon={<UndoOutlined />}
            style={{ background: 'transparent', border: 'none' }}
          />
        </Tooltip>
        <Tooltip title="重做 (Ctrl+Y)">
          <Button 
            size="small" 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            icon={<RedoOutlined />}
            style={{ background: 'transparent', border: 'none' }}
          />
        </Tooltip>
        
        <div style={{ width: 1, height: 24, background: '#e5e7eb' }} />
        
        {/* 保存/加载 */}
        <Tooltip title="保存工作流">
          <Button 
            size="small" 
            onClick={handleSaveWorkflow}
            icon={<SaveOutlined />}
            style={{ background: 'transparent', border: 'none' }}
          />
        </Tooltip>
        <Tooltip title="加载工作流">
          <Button 
            size="small" 
            onClick={handleLoadWorkflow}
            icon={<AppstoreOutlined />}
            style={{ background: 'transparent', border: 'none' }}
          />
        </Tooltip>
        
        <div style={{ width: 1, height: 24, background: '#e5e7eb' }} />
        
        {/* 添加节点按钮 */}
        <Button 
          type="primary"
          onClick={() => setIsAddNodePanelVisible(true)}
          icon={<PlusOutlined />}
          style={{
            background: '#f0f0ff',
            border: '1px solid #d4d4ff',
            color: '#6366f1',
            fontWeight: 500,
            borderRadius: '8px',
            paddingLeft: '16px',
            paddingRight: '16px',
          }}
        >
          添加节点
        </Button>
        
        <div style={{ width: 1, height: 24, background: '#e5e7eb' }} />
        
        {/* 设置按钮 */}
        <Tooltip title="设置">
          <Button size="small" style={{ background: 'transparent', border: 'none', fontSize: '18px' }}>
            ⚙️
          </Button>
        </Tooltip>
        
        {/* 执行按钮 */}
        <Button 
          type="primary"
          onClick={handleExecute}
          icon={<PlayCircleOutlined />}
          style={{
            background: '#16a34a',
            border: 'none',
            fontWeight: 500,
            borderRadius: '8px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          试运行
        </Button>
      </div>

      {/* 添加节点面板 */}
      <AddNodePanel 
        visible={isAddNodePanelVisible}
        onClose={() => setIsAddNodePanelVisible(false)}
        onAddNode={handleAddNodeFromPanel}
      />
    </div>
  );
};

// 主组件
const DifyWorkflowEditor: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
};

export default DifyWorkflowEditor;
