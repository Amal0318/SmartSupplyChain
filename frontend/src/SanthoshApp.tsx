import React, { useState } from 'react';
import {
  RoleType,
  NavTab,
  UploadedDataset,
  ProcessingStage,
  ProcurementRecord,
  InventoryRecord,
  ProductionRecord,
  LogisticsRecord,
  AgentSubmission,
  AssignedTask,
  DepartmentRequest,
  DepartmentReportItem,
} from './types/santhosh';
import {
  INITIAL_ROLES,
  INITIAL_AGENT_HEALTH,
  MOCK_PROCUREMENT_DATA,
  MOCK_INVENTORY_DATA,
  MOCK_PRODUCTION_DATA,
  MOCK_LOGISTICS_DATA,
  MOCK_CASCADING_RISKS,
  MOCK_EXECUTIVE_REPORT,
  MOCK_SCHEMA_MAPPINGS,
  MOCK_TASKS,
  MOCK_REQUESTS,
  MOCK_DEPARTMENT_REPORTS,
} from './data/mockData';
import {
  normalizeProcurementRecords,
  normalizeInventoryRecords,
  normalizeProductionRecords,
  normalizeLogisticsRecords,
} from './utils/recordNormalizer';
import { RoleSelection } from './components/RoleSelection';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DataUploadSection } from './components/Upload/DataUploadSection';
import { DataUnderstandingEngine } from './components/Upload/DataUnderstandingEngine';
import { AgentProcessingTimeline } from './components/Upload/AgentProcessingTimeline';
import { ProcurementDashboard } from './components/Dashboards/ProcurementDashboard';
import { InventoryDashboard } from './components/Dashboards/InventoryDashboard';
import { ProductionDashboard } from './components/Dashboards/ProductionDashboard';
import { LogisticsDashboard } from './components/Dashboards/LogisticsDashboard';
import { MasterExecutiveDashboard } from './components/Dashboards/MasterExecutiveDashboard';
import { DepartmentReportRepository } from './components/Reports/DepartmentReportRepository';
import { CreateDepartmentRequestModal } from './components/Department/CreateDepartmentRequestModal';
import { AgentHealthPanel } from './components/Health/AgentHealthPanel';
import { AIInsightsView } from './components/Analytics/AIInsightsView';
import { DomainAnalyticsView } from './components/Analytics/DomainAnalyticsView';
import { RecommendationsView } from './components/Analytics/RecommendationsView';
import { SettingsView } from './components/Settings/SettingsView';
import { TaskManager } from './components/Executive/TaskManager';

export default function App() {
  const [currentRole, setCurrentRole] = useState<RoleType | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Application Data States
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [agentHealthList, setAgentHealthList] = useState(INITIAL_AGENT_HEALTH);
  const [procurementRecords, setProcurementRecords] = useState<ProcurementRecord[]>(MOCK_PROCUREMENT_DATA);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(MOCK_INVENTORY_DATA);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(MOCK_PRODUCTION_DATA);
  const [logisticsRecords, setLogisticsRecords] = useState<LogisticsRecord[]>(MOCK_LOGISTICS_DATA);

  // Executive & Cross-Department Management States
  const [cascadingRisks, setCascadingRisks] = useState(MOCK_CASCADING_RISKS);
  const [executiveReport, setExecutiveReport] = useState(MOCK_EXECUTIVE_REPORT);
  const [tasks, setTasks] = useState<AssignedTask[]>(MOCK_TASKS);
  const [requests, setRequests] = useState<DepartmentRequest[]>(MOCK_REQUESTS);
  const [departmentReports, setDepartmentReports] = useState<DepartmentReportItem[]>(MOCK_DEPARTMENT_REPORTS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [agentSubmissions, setAgentSubmissions] = useState<AgentSubmission[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Upload & Understanding States
  const [uploadedDataset, setUploadedDataset] = useState<UploadedDataset | null>(null);
  const [processingStages, setProcessingStages] = useState<ProcessingStage[]>([
    { id: 1, label: 'Data Received', description: 'Business file parsed and record schema structured.', status: 'completed', timestamp: '10:44:10' },
    { id: 2, label: 'Schema Understanding Completed', description: 'AI Engine mapped original headers to standard supply chain fields.', status: 'completed', timestamp: '10:44:15' },
    { id: 3, label: 'Business Validation Completed', description: 'Data integrity checks passed (0 null records, 100% valid types).', status: 'completed', timestamp: '10:44:20' },
    { id: 4, label: 'Agent Analysis Started', description: 'Domain AI Agent scanning records for anomaly & SLA variances.', status: 'completed', timestamp: '10:44:25' },
    { id: 5, label: 'Risk Detection Completed', description: 'Cross-department lead time & bottleneck risks evaluated.', status: 'completed', timestamp: '10:44:30' },
    { id: 6, label: 'Recommendations Generated', description: 'Autonomous mitigation strategies published to Control Tower.', status: 'completed', timestamp: '10:44:35' },
  ]);

  const currentRoleConfig = roles.find((r) => r.id === (currentRole || 'master')) || roles[0];

  // Role Selection Handler
  const handleSelectRole = (roleId: RoleType) => {
    setCurrentRole(roleId);
    setActiveTab('dashboard');
  };

  // Sync Refresh Handler
  const handleRefreshData = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setRoles((prev) =>
        prev.map((r) => (r.id === currentRole ? { ...r, lastSync: 'Just now' } : r))
      );
    }, 1000);
  };

  // Sample Data Loader
  const handleLoadSampleData = (domain: RoleType) => {
    let mockCols: string[] = [];
    let recordsToUse: any[] = [];

    if (domain === 'procurement') {
      mockCols = ['Vendor ID', 'Supplier Name', 'Category', 'Order Date', 'Qty', 'Unit Price', 'Delivery Date'];
      recordsToUse = MOCK_PROCUREMENT_DATA;
    } else if (domain === 'inventory') {
      mockCols = ['Item SKU', 'Product Title', 'Location', 'Stock Qty', 'Reorder Point', 'Unit Cost'];
      recordsToUse = MOCK_INVENTORY_DATA;
    } else if (domain === 'production') {
      mockCols = ['Job ID', 'Assembly Line', 'Target Output', 'Actual Output', 'Downtime Mins'];
      recordsToUse = MOCK_PRODUCTION_DATA;
    } else {
      mockCols = ['Tracking ID', 'Logistics Partner', 'Origin Port', 'Destination Port', 'Expected ETA'];
      recordsToUse = MOCK_LOGISTICS_DATA;
    }

    const newDataset: UploadedDataset = {
      fileName: `sample_${domain}_dataset.xlsx`,
      fileSize: '45.2 KB',
      uploadTime: new Date().toLocaleTimeString(),
      domain: domain,
      columns: mockCols,
      mappings: MOCK_SCHEMA_MAPPINGS[domain] || MOCK_SCHEMA_MAPPINGS['procurement'],
      records: recordsToUse,
    };

    setUploadedDataset(newDataset);
    setActiveTab('upload');
  };

  // Dataset Upload Handler with Dynamic Dashboard Refresh
  const handleDatasetUploaded = (dataset: UploadedDataset) => {
    setUploadedDataset(dataset);

    // Dynamic replacement: Replace department's active dataset state so dashboard charts/KPIs/tables auto-refresh
    if (dataset.domain === 'procurement') {
      setProcurementRecords(normalizeProcurementRecords(dataset.records));
    } else if (dataset.domain === 'inventory') {
      setInventoryRecords(normalizeInventoryRecords(dataset.records));
    } else if (dataset.domain === 'production') {
      setProductionRecords(normalizeProductionRecords(dataset.records));
    } else if (dataset.domain === 'logistics') {
      setLogisticsRecords(normalizeLogisticsRecords(dataset.records));
    } else if (dataset.domain === 'master') {
      // Intelligently distribute and route records based on table columns/schema
      const firstRecKeys = Object.keys(dataset.records[0] || {}).map(k => k.toLowerCase());
      if (firstRecKeys.some(k => k.includes('sku') || k.includes('item') || k.includes('stock') || k.includes('capacity'))) {
        setInventoryRecords(normalizeInventoryRecords(dataset.records));
      } else if (firstRecKeys.some(k => k.includes('vendor') || k.includes('supplier') || k.includes('spend') || k.includes('price'))) {
        setProcurementRecords(normalizeProcurementRecords(dataset.records));
      } else if (firstRecKeys.some(k => k.includes('job') || k.includes('line') || k.includes('output') || k.includes('oee') || k.includes('downtime'))) {
        setProductionRecords(normalizeProductionRecords(dataset.records));
      } else if (firstRecKeys.some(k => k.includes('tracking') || k.includes('carrier') || k.includes('shipment') || k.includes('eta') || k.includes('port') || k.includes('route'))) {
        setLogisticsRecords(normalizeLogisticsRecords(dataset.records));
      } else {
        // Fallback: If unknown, put into logistics
        setLogisticsRecords(normalizeLogisticsRecords(dataset.records));
      }
    }
  };

  // Send to Master Agent Handler
  const handleSendToMaster = (datasetToSend?: UploadedDataset | null, roleForDispatch?: RoleType) => {
    const targetDomain = roleForDispatch || datasetToSend?.domain || currentRole || 'procurement';
    const targetRoleConfig = roles.find((r) => r.id === targetDomain) || roles[0];

    let recordsToPreview: any[] = [];
    if (datasetToSend && datasetToSend.records && datasetToSend.records.length > 0) {
      recordsToPreview = datasetToSend.records;
    } else if (targetDomain === 'procurement') {
      recordsToPreview = procurementRecords;
    } else if (targetDomain === 'inventory') {
      recordsToPreview = inventoryRecords;
    } else if (targetDomain === 'production') {
      recordsToPreview = productionRecords;
    } else {
      recordsToPreview = logisticsRecords;
    }

    const newSubmission: AgentSubmission = {
      id: `sub-${Date.now()}`,
      agentId: targetDomain,
      agentName: targetRoleConfig.agentName,
      timestamp: new Date().toLocaleTimeString(),
      fileName: datasetToSend ? datasetToSend.fileName : `active_${targetDomain}_telemetry.csv`,
      recordCount: recordsToPreview.length,
      columns: datasetToSend ? datasetToSend.columns : Object.keys(recordsToPreview[0] || {}),
      previewRecords: recordsToPreview.slice(0, 10),
      summaryMetrics: {
        totalVolume: `${recordsToPreview.length} items`,
        riskLevel: targetDomain === 'inventory' ? 'High' : targetDomain === 'production' ? 'Medium' : 'Low',
        keyHighlight: `Verified ${recordsToPreview.length} records from ${targetRoleConfig.agentName}. Dispatched with cross-agent correlation flags.`,
      },
      status: 'Received',
    };

    setAgentSubmissions((prev) => [newSubmission, ...prev]);

    // Update executive report dynamically to reflect newly received sub-agent data
    setExecutiveReport((prev) => ({
      ...prev,
      currentSituation: `Master AI Control Tower synchronized ${recordsToPreview.length} live records directly from ${targetRoleConfig.agentName}. Multi-department neural verification complete.`,
      criticalIssues: [
        `Received live submission from ${targetRoleConfig.agentName} (${recordsToPreview.length} records evaluated).`,
        ...prev.criticalIssues.slice(0, 2),
      ],
    }));
  };

  // Task Management Handlers
  const handleAddTask = (newTask: Omit<AssignedTask, 'id' | 'createdAt'>) => {
    const task: AssignedTask = {
      ...newTask,
      id: `TSK-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toLocaleDateString(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, status: AssignedTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Department Request Handlers
  const handleCreateRequest = (reqData: Omit<DepartmentRequest, 'id' | 'timestamp' | 'status'>) => {
    const newReq: DepartmentRequest = {
      ...reqData,
      id: `REQ-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'Pending',
    };
    setRequests((prev) => [newReq, ...prev]);
  };

  const handleUpdateRequestStatus = (requestId: string, status: 'Approved' | 'Rejected') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
  };

  // Action Handlers
  const handleTriggerReorder = (id: string) => {
    if (currentRole === 'procurement') {
      setProcurementRecords((prev) =>
        prev.map((item) =>
          item.vendorId === id ? { ...item, status: 'Active', riskScore: Math.max(item.riskScore - 25, 10) } : item
        )
      );
    } else if (currentRole === 'inventory') {
      setInventoryRecords((prev) =>
        prev.map((item) =>
          item.sku === id ? { ...item, stockLevel: item.stockLevel + 1500, status: 'Optimal' } : item
        )
      );
    }
  };

  const handleResolveBottleneck = (jobId: string) => {
    setProductionRecords((prev) =>
      prev.map((item) =>
        item.jobId === jobId
          ? {
              ...item,
              status: 'Running',
              actualOutput: item.targetOutput,
              oeePercent: 95,
              downtimeMins: 0,
            }
          : item
      )
    );
  };

  const handleRerouteShipment = (shipmentId: string) => {
    setLogisticsRecords((prev) =>
      prev.map((item) =>
        item.shipmentId === shipmentId
          ? {
              ...item,
              currentStatus: 'In Transit',
              delayHours: 0,
              expectedEta: 'On Schedule (Optimized)',
            }
          : item
      )
    );
  };

  // Fault Tolerance Handlers
  const handleSimulateFault = (roleId: RoleType) => {
    setAgentHealthList((prev) =>
      prev.map((a) =>
        a.id === roleId
          ? {
              ...a,
              status: 'Warning',
              failureCount: a.failureCount + 1,
              responseTimeMs: a.responseTimeMs + 280,
              recoveryStatus: 'Warning - High Memory Queue Detected',
              logs: [
                `${new Date().toLocaleTimeString()} [${roleId}] Simulated queue overflow fault triggered.`,
                ...a.logs,
              ],
            }
          : a
      )
    );

    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, status: 'Warning' } : r))
    );
  };

  const handleSimulateHeal = (roleId: RoleType) => {
    setAgentHealthList((prev) =>
      prev.map((a) =>
        a.id === roleId
          ? {
              ...a,
              status: 'Active',
              responseTimeMs: Math.max(a.responseTimeMs - 220, 90),
              recoveryStatus: 'Healthy - Autonomous Self-Heal Complete',
              logs: [
                `${new Date().toLocaleTimeString()} [${roleId}] Auto-heal memory buffer reset applied successfully.`,
                ...a.logs,
              ],
            }
          : a
      )
    );

    setRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, status: 'Active' } : r))
    );
  };

  // If no role selected, render Role Selection Landing
  if (!currentRole) {
    return <RoleSelection roles={roles} onSelectRole={handleSelectRole} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-zinc-900 flex flex-col font-sans selection:bg-[#F5C527] selection:text-black">
      <div className="flex-1 flex min-w-0 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          roleName={currentRoleConfig.roleName}
          agentName={currentRoleConfig.agentName}
          onSwitchRole={() => setCurrentRole(null)}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto dot-grid pb-12 bg-[#F5F5F7]">
          {/* Top Header */}
          <Header
            currentRoleConfig={currentRoleConfig}
            allRoles={roles}
            onSelectRole={handleSelectRole}
            onRefreshData={handleRefreshData}
            isSyncing={isSyncing}
          />

          {/* Tab Content Area */}
          <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* DASHBOARD TAB */}
            {activeTab === 'dashboard' && (
              <>
                {currentRole === 'procurement' && (
                  <ProcurementDashboard
                    records={procurementRecords}
                    tasks={tasks}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onTriggerReorder={handleTriggerReorder}
                    onSendToMaster={(role) => handleSendToMaster(null, role)}
                    onRequestClick={() => setIsRequestModalOpen(true)}
                    onDatasetUploaded={handleDatasetUploaded}
                  />
                )}
                {currentRole === 'inventory' && (
                  <InventoryDashboard
                    records={inventoryRecords}
                    tasks={tasks}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onTriggerReorder={handleTriggerReorder}
                    onSendToMaster={(role) => handleSendToMaster(null, role)}
                    onRequestClick={() => setIsRequestModalOpen(true)}
                    onDatasetUploaded={handleDatasetUploaded}
                  />
                )}
                {currentRole === 'production' && (
                  <ProductionDashboard
                    records={productionRecords}
                    tasks={tasks}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onSendToMaster={(role) => handleSendToMaster(null, role)}
                    onResolveBottleneck={handleResolveBottleneck}
                    onRequestClick={() => setIsRequestModalOpen(true)}
                    onDatasetUploaded={handleDatasetUploaded}
                  />
                )}
                {currentRole === 'logistics' && (
                  <LogisticsDashboard
                    records={logisticsRecords}
                    tasks={tasks}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onSendToMaster={(role) => handleSendToMaster(null, role)}
                    onRerouteShipment={handleRerouteShipment}
                    onRequestClick={() => setIsRequestModalOpen(true)}
                    onDatasetUploaded={handleDatasetUploaded}
                  />
                )}
                {currentRole === 'master' && (
                  <MasterExecutiveDashboard
                    healthScore={92.4}
                    agentHealthList={agentHealthList}
                    cascadingRisks={cascadingRisks}
                    executiveReport={executiveReport}
                    agentSubmissions={agentSubmissions}
                    tasks={tasks}
                    requests={requests}
                    departmentReports={departmentReports}
                    onAddTask={handleAddTask}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onDeleteTask={handleDeleteTask}
                    onUpdateRequestStatus={handleUpdateRequestStatus}
                    onRefreshReport={() =>
                      setExecutiveReport({ ...MOCK_EXECUTIVE_REPORT })
                    }
                    onDatasetUploaded={handleDatasetUploaded}
                  />
                )}
              </>
            )}

            {/* TASKS TAB (STANDALONE VIEW) */}
            {activeTab === 'tasks' && (
              <TaskManager
                currentRole={currentRole}
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {/* UPLOAD TAB (Available for sub-agents, hidden from Executive) */}
            {activeTab === 'upload' && currentRole !== 'master' && (
              <div>
                <DataUploadSection
                  currentDomain={currentRole}
                  onDatasetUploaded={handleDatasetUploaded}
                  onLoadSampleData={handleLoadSampleData}
                />

                {uploadedDataset && (
                  <>
                    <DataUnderstandingEngine
                      dataset={uploadedDataset}
                      onSendToMaster={handleSendToMaster}
                    />
                    <AgentProcessingTimeline stages={processingStages} />
                  </>
                )}
              </div>
            )}

            {/* INSIGHTS TAB */}
            {activeTab === 'insights' && (
              <AIInsightsView currentRoleConfig={currentRoleConfig} />
            )}

            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && (
              <DomainAnalyticsView
                currentRoleConfig={currentRoleConfig}
                procurementRecords={procurementRecords}
                inventoryRecords={inventoryRecords}
                productionRecords={productionRecords}
                logisticsRecords={logisticsRecords}
              />
            )}

            {/* RECOMMENDATIONS TAB */}
            {activeTab === 'recommendations' && (
              <RecommendationsView currentRoleConfig={currentRoleConfig} />
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <DepartmentReportRepository
                reports={departmentReports}
                activeRole={currentRole}
              />
            )}

            {/* AGENT HEALTH TAB */}
            {activeTab === 'health' && (
              <AgentHealthPanel
                agents={agentHealthList}
                onSimulateFault={handleSimulateFault}
                onSimulateHeal={handleSimulateHeal}
              />
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Department Request Modal */}
      {isRequestModalOpen && currentRole && (
        <CreateDepartmentRequestModal
          currentRole={currentRole}
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmitRequest={handleCreateRequest}
        />
      )}

      {/* System Status Footer Bar */}
      <footer className="fixed bottom-0 left-0 w-full h-8 bg-[#18181B] border-t border-zinc-800 px-6 flex items-center justify-between z-50 text-[10px] font-mono tracking-tight text-zinc-400 backdrop-blur-md">
        <div className="flex items-center space-x-4 uppercase">
          <span>Agent Core 2.1.0-STABLE</span>
          <span>•</span>
          <span>Memory: 14.2GB / 64GB</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">Threat Level: Low</span>
        </div>
        <div className="flex items-center space-x-4 uppercase">
          <span>Recovery Status: 100%</span>
          <span>•</span>
          <span>API Latency: 14ms</span>
          <span>•</span>
          <span className="text-[#F5C527] font-bold">Ready to Deploy</span>
        </div>
      </footer>
    </div>
  );
}
