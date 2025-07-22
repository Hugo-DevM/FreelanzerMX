export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  progress: number;
  createdFromContract?: boolean;
  contractId?: string;
  deliverables?: string[];
  notes?: string;
  attachments?: string[];
  tasks?: Task[]; // Ahora opcional, puede venir de la tabla relacional
  amount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  client: string;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  createdFromContract?: boolean;
  contractId?: string;
  deliverables?: string[];
  amount?: number;
}

export interface CreateTaskData {
  id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  estimatedHours?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
}

export interface Contract {
  id: string;
  clientName: string;
  service: string;
  amount: number;
  deliverables: string[];
  startDate: Date;
  endDate: Date;
}
