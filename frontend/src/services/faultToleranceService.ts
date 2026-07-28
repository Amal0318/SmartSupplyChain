import api from './api';

export interface AgentHealthLog {
  id: string;
  agent_name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  circuit_state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  heartbeat_timestamp: string;
  latency_ms: number;
  failure_count: number;
  last_error?: string;
  created_at: string;
}

export interface AgentHealthOverview {
  total_agents: number;
  healthy_agents_count: number;
  degraded_agents_count: number;
  down_agents_count: number;
  overall_circuit_status: string;
  health_logs: AgentHealthLog[];
}

export const faultToleranceService = {
  getOverview: async (): Promise<AgentHealthOverview> => {
    const response = await api.get<AgentHealthOverview>('/fault-tolerance/agent-health/overview');
    return response.data;
  },

  resetCircuit: async (agent_name: string): Promise<any> => {
    const response = await api.post(`/fault-tolerance/agent-health/reset/${agent_name}`);
    return response.data;
  },
};
