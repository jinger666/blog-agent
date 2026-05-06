import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkflowNode {
  id: string;
  type: 'start' | 'llm' | 'tool' | 'condition' | 'loop' | 'memory' | 'end';
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface IWorkflow extends Document {
  id: string;
  userId: string;
  name: string;
  description: string;
  nodes: IWorkflowNode[];
  edges: IWorkflowEdge[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowNodeSchema = new Schema<IWorkflowNode>({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['start', 'llm', 'tool', 'condition', 'loop', 'memory', 'end'],
    required: true,
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  data: { type: Schema.Types.Mixed, required: true },
}, { _id: false });

const WorkflowEdgeSchema = new Schema<IWorkflowEdge>({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true },
  sourceHandle: { type: String },
  targetHandle: { type: String },
}, { _id: false });

const WorkflowSchema = new Schema<IWorkflow>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    nodes: { type: [WorkflowNodeSchema], required: true, default: [] },
    edges: { type: [WorkflowEdgeSchema], required: true, default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
WorkflowSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
