import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WorkflowDocument = Workflow & Document;

@Schema({ _id: false })
export class WorkflowNode {
  @Prop({ required: true })
  id: string;

  @Prop({ 
    required: true, 
    enum: ['start', 'llm', 'tool', 'condition', 'loop', 'memory', 'end'] 
  })
  type: string;

  @Prop({ required: true })
  position: { x: number; y: number };

  @Prop({ type: Object, required: true })
  data: Record<string, any>;
}

export const WorkflowNodeSchema = SchemaFactory.createForClass(WorkflowNode);

@Schema({ _id: false })
export class WorkflowEdge {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  target: string;

  @Prop()
  sourceHandle?: string;

  @Prop()
  targetHandle?: string;
}

export const WorkflowEdgeSchema = SchemaFactory.createForClass(WorkflowEdge);

@Schema({ timestamps: true })
export class Workflow {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ type: [WorkflowNodeSchema], required: true, default: [] })
  nodes: WorkflowNode[];

  @Prop({ type: [WorkflowEdgeSchema], required: true, default: [] })
  edges: WorkflowEdge[];

  @Prop({ default: true })
  isActive: boolean;
}

export const WorkflowSchema = SchemaFactory.createForClass(Workflow);

// Index
WorkflowSchema.index({ userId: 1, createdAt: -1 });
