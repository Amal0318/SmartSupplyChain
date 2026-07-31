import {
  RoleType,
  ProcurementRecord,
  InventoryRecord,
  ProductionRecord,
  LogisticsRecord,
} from '../types';

export function normalizeProcurementRecords(rawRecords: any[]): ProcurementRecord[] {
  if (!rawRecords || rawRecords.length === 0) return [];

  return rawRecords.map((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[], defaultVal: any) => {
      const matchKey = keys.find((k) =>
        possibleKeys.some((p) => k.toLowerCase().includes(p.toLowerCase()))
      );
      return matchKey && row[matchKey] !== undefined && row[matchKey] !== ''
        ? row[matchKey]
        : defaultVal;
    };

    const qty = Number(getVal(['qty', 'quantity', 'count', 'amount'], 1000 + idx * 500));
    const price = Number(getVal(['price', 'cost', 'rate', 'unit'], 15.5 + idx * 2.5));
    const leadTime = Number(getVal(['lead', 'days'], 10));
    const risk = Number(getVal(['risk', 'score'], Math.floor(Math.random() * 40 + 15)));

    return {
      vendorId: String(getVal(['vendorid', 'vendor', 'id', 'code'], `VEND-${100 + idx + 1}`)),
      supplierName: String(getVal(['supplier', 'vendor', 'name', 'company'], `Supplier ${idx + 1}`)),
      category: String(getVal(['category', 'type', 'group'], 'General Supply')),
      orderDate: String(getVal(['orderdate', 'date'], '2026-07-20')),
      quantity: isNaN(qty) ? 1000 : qty,
      unitPrice: isNaN(price) ? 12.5 : price,
      leadTimeDays: isNaN(leadTime) ? 10 : leadTime,
      deliveryDate: String(getVal(['delivery', 'eta'], '2026-08-05')),
      riskScore: isNaN(risk) ? 25 : Math.min(100, Math.max(5, risk)),
      onTimeRate: Number(getVal(['ontime', 'rate', 'sla'], 92.5)),
      status: risk > 65 ? 'Delayed' : risk > 80 ? 'Critical' : 'Active',
    };
  });
}

export function normalizeInventoryRecords(rawRecords: any[]): InventoryRecord[] {
  if (!rawRecords || rawRecords.length === 0) return [];

  return rawRecords.map((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[], defaultVal: any) => {
      const matchKey = keys.find((k) =>
        possibleKeys.some((p) => k.toLowerCase().includes(p.toLowerCase()))
      );
      return matchKey && row[matchKey] !== undefined && row[matchKey] !== ''
        ? row[matchKey]
        : defaultVal;
    };

    const stock = Number(getVal(['stock', 'qty', 'quantity', 'level', 'count'], 800 + idx * 300));
    const reorder = Number(getVal(['reorder', 'min', 'point', 'threshold'], 500));
    const cost = Number(getVal(['cost', 'price', 'unit'], 25.0));

    let statusVal: 'Optimal' | 'Low Stock' | 'Overstock' | 'Critical' = 'Optimal';
    if (stock < reorder * 0.4) statusVal = 'Critical';
    else if (stock < reorder) statusVal = 'Low Stock';
    else if (stock > reorder * 4) statusVal = 'Overstock';

    return {
      sku: String(getVal(['sku', 'item', 'id', 'code'], `SKU-${8800 + idx}`)),
      itemName: String(getVal(['name', 'title', 'item', 'product'], `Component Material #${idx + 1}`)),
      category: String(getVal(['category', 'type', 'group'], 'Industrial Material')),
      warehouseLocation: String(getVal(['location', 'warehouse', 'hub', 'depot'], `Central Hub WH-0${(idx % 3) + 1}`)),
      stockLevel: isNaN(stock) ? 1000 : stock,
      reorderPoint: isNaN(reorder) ? 500 : reorder,
      maxCapacity: stock * 2.5,
      unitCost: isNaN(cost) ? 25.0 : cost,
      holdingCost: Math.round(cost * 0.08 * 100) / 100,
      status: statusVal,
    };
  });
}

export function normalizeProductionRecords(rawRecords: any[]): ProductionRecord[] {
  if (!rawRecords || rawRecords.length === 0) return [];

  return rawRecords.map((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[], defaultVal: any) => {
      const matchKey = keys.find((k) =>
        possibleKeys.some((p) => k.toLowerCase().includes(p.toLowerCase()))
      );
      return matchKey && row[matchKey] !== undefined && row[matchKey] !== ''
        ? row[matchKey]
        : defaultVal;
    };

    const target = Number(getVal(['target', 'planned', 'goal'], 2000));
    const actual = Number(getVal(['actual', 'output', 'completed', 'produced'], 1850));
    const downtime = Number(getVal(['downtime', 'stoppage', 'delay'], 20));

    const oee = Math.round((actual / (target || 1)) * 100);

    return {
      jobId: String(getVal(['job', 'id', 'workorder'], `JOB-${900 + idx}`)),
      lineName: String(getVal(['line', 'assembly', 'machine'], `Assembly Line ${idx + 1}`)),
      productName: String(getVal(['product', 'name', 'item'], `Assembly Unit Gen-${idx + 1}`)),
      targetOutput: isNaN(target) ? 2000 : target,
      actualOutput: isNaN(actual) ? 1850 : actual,
      downtimeMins: isNaN(downtime) ? 20 : downtime,
      oeePercent: Math.min(100, Math.max(20, isNaN(oee) ? 88 : oee)),
      machineUtilization: Math.min(99, Math.max(30, oee - 5)),
      status: oee < 70 ? 'Bottleneck' : downtime > 60 ? 'Stalled' : 'Running',
    };
  });
}

export function normalizeLogisticsRecords(rawRecords: any[]): LogisticsRecord[] {
  if (!rawRecords || rawRecords.length === 0) return [];

  return rawRecords.map((row, idx) => {
    const keys = Object.keys(row);
    const getVal = (possibleKeys: string[], defaultVal: any) => {
      const matchKey = keys.find((k) =>
        possibleKeys.some((p) => k.toLowerCase().includes(p.toLowerCase()))
      );
      return matchKey && row[matchKey] !== undefined && row[matchKey] !== ''
        ? row[matchKey]
        : defaultVal;
    };

    const delays = Number(getVal(['delay', 'hours', 'lag'], idx % 2 === 0 ? 0 : 18));

    return {
      shipmentId: String(getVal(['tracking', 'shipment', 'id', 'code'], `TRK-${9000 + idx}`)),
      carrier: String(getVal(['carrier', 'partner', 'logistics', 'freight'], `Global Carrier Express`)),
      origin: String(getVal(['origin', 'dispatch', 'from', 'source'], 'Shanghai Port')),
      destination: String(getVal(['destination', 'to', 'hub', 'port'], 'Long Beach Harbor')),
      dispatchDate: String(getVal(['dispatch', 'date', 'shipped'], '2026-07-20')),
      expectedEta: String(getVal(['eta', 'delivery', 'expected'], '2026-07-30')),
      currentStatus: delays > 24 ? 'Customs Hold' : delays > 0 ? 'Delayed' : 'In Transit',
      delayHours: isNaN(delays) ? 0 : delays,
      etaAccuracy: delays > 0 ? 88.5 : 99.2,
    };
  });
}

export interface DomainValidationResult {
  isValid: boolean;
  detectedDomain?: RoleType;
  reason?: string;
  expectedHeaders?: string[];
}

export function validateDatasetForDomain(
  columns: string[],
  rawRecords: any[],
  targetDomain: RoleType
): DomainValidationResult {
  if (targetDomain === 'master') {
    return { isValid: true };
  }

  const allKeys = (columns || []).map((c) => c.toLowerCase());
  if (rawRecords && rawRecords.length > 0 && allKeys.length === 0) {
    Object.keys(rawRecords[0]).forEach((k) => allKeys.push(k.toLowerCase()));
  }

  // Domain signature keywords
  const domainSignatures: Record<Exclude<RoleType, 'master'>, string[]> = {
    procurement: ['vendor', 'supplier', 'po', 'order', 'leadtime', 'unitprice', 'delivery', 'purchaseorder'],
    inventory: ['sku', 'stock', 'warehouse', 'reorder', 'holdingcost', 'unitcost', 'location', 'onhand'],
    production: ['job', 'line', 'oee', 'output', 'downtime', 'targetoutput', 'actualoutput', 'assembly', 'workorder'],
    logistics: ['shipment', 'carrier', 'tracking', 'dispatch', 'origin', 'destination', 'eta', 'transit', 'delay'],
  };

  const domainScores: Record<Exclude<RoleType, 'master'>, number> = {
    procurement: 0,
    inventory: 0,
    production: 0,
    logistics: 0,
  };

  const jointText = allKeys.join(' ');

  (Object.keys(domainSignatures) as Exclude<RoleType, 'master'>[]).forEach((dom) => {
    domainSignatures[dom].forEach((kw) => {
      if (jointText.includes(kw)) {
        domainScores[dom] += 1;
      }
    });
  });

  // Find best matching domain
  let detectedDomain: Exclude<RoleType, 'master'> = targetDomain as Exclude<RoleType, 'master'>;
  let maxScore = -1;

  (Object.keys(domainScores) as Exclude<RoleType, 'master'>[]).forEach((dom) => {
    if (domainScores[dom] > maxScore) {
      maxScore = domainScores[dom];
      detectedDomain = dom;
    }
  });

  const domainNames: Record<RoleType, string> = {
    procurement: 'Procurement AI Agent',
    inventory: 'Inventory AI Agent',
    production: 'Production AI Agent',
    logistics: 'Logistics AI Agent',
    master: 'Master AI Agent',
  };

  const expectedHeadersMap: Record<Exclude<RoleType, 'master'>, string[]> = {
    procurement: ['vendorId / supplierName', 'orderDate', 'quantity', 'unitPrice', 'leadTimeDays', 'deliveryDate'],
    inventory: ['sku / itemName', 'warehouseLocation', 'stockLevel', 'reorderPoint', 'unitCost', 'holdingCost'],
    production: ['jobId', 'lineName', 'productName', 'targetOutput', 'actualOutput', 'downtimeMins', 'oeePercent'],
    logistics: ['shipmentId', 'carrier', 'origin', 'destination', 'dispatchDate', 'expectedEta', 'delayHours'],
  };

  if (maxScore > 0 && detectedDomain !== targetDomain && domainScores[detectedDomain] > domainScores[targetDomain as Exclude<RoleType, 'master'>]) {
    return {
      isValid: false,
      detectedDomain,
      reason: `Validation Error: Dataset rejected! This file contains columns matching the ${domainNames[detectedDomain]} domain. ${domainNames[targetDomain]} accepts ONLY ${targetDomain.toUpperCase()} datasets.`,
      expectedHeaders: expectedHeadersMap[targetDomain as Exclude<RoleType, 'master'>],
    };
  }

  const targetKeywords = domainSignatures[targetDomain as Exclude<RoleType, 'master'>];
  const hasTargetMatch = targetKeywords.some((kw) => jointText.includes(kw));

  if (!hasTargetMatch && allKeys.length > 0) {
    return {
      isValid: false,
      detectedDomain,
      reason: `Validation Error: Unrecognized dataset schema. The columns in this file do not match the required ${targetDomain.toUpperCase()} schema for ${domainNames[targetDomain]}.`,
      expectedHeaders: expectedHeadersMap[targetDomain as Exclude<RoleType, 'master'>],
    };
  }

  return { isValid: true };
}

export function createSubmissionFromDataset(
  domain: RoleType,
  fileName: string,
  rawRecords: any[],
  columns: string[]
) {
  const agentNames: Record<RoleType, string> = {
    procurement: 'Procurement AI Agent',
    inventory: 'Inventory AI Agent',
    production: 'Production AI Agent',
    logistics: 'Logistics AI Agent',
    master: 'Master AI Agent',
  };

  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
  let highlight = `Successfully parsed ${rawRecords.length} records.`;

  if (domain === 'procurement') {
    const records = normalizeProcurementRecords(rawRecords);
    const highRiskCount = records.filter((r) => r.riskScore > 60).length;
    riskLevel = highRiskCount > 2 ? 'High' : highRiskCount > 0 ? 'Medium' : 'Low';
    highlight = `Parsed ${records.length} POs. ${highRiskCount} vendor risk alerts detected.`;
  } else if (domain === 'inventory') {
    const records = normalizeInventoryRecords(rawRecords);
    const lowStockCount = records.filter((r) => r.status === 'Low Stock' || r.status === 'Critical').length;
    riskLevel = lowStockCount > 2 ? 'High' : lowStockCount > 0 ? 'Medium' : 'Low';
    highlight = `Parsed ${records.length} SKUs. ${lowStockCount} safety stock depletion alerts.`;
  } else if (domain === 'production') {
    const records = normalizeProductionRecords(rawRecords);
    const bottlenecks = records.filter((r) => r.status === 'Bottleneck' || r.status === 'Stalled').length;
    riskLevel = bottlenecks > 1 ? 'High' : bottlenecks > 0 ? 'Medium' : 'Low';
    highlight = `Parsed ${records.length} jobs. ${bottlenecks} line bottlenecks evaluated.`;
  } else if (domain === 'logistics') {
    const records = normalizeLogisticsRecords(rawRecords);
    const delayed = records.filter((r) => r.delayHours > 0).length;
    riskLevel = delayed > 2 ? 'High' : delayed > 0 ? 'Medium' : 'Low';
    highlight = `Parsed ${records.length} shipments. ${delayed} in-transit delays tracked.`;
  }

  return {
    id: `SUB-${Date.now()}`,
    agentId: domain,
    agentName: agentNames[domain] || 'Domain Agent',
    timestamp: new Date().toLocaleTimeString(),
    fileName,
    recordCount: rawRecords.length,
    previewRecords: rawRecords.slice(0, 10),
    columns: columns && columns.length > 0 ? columns : Object.keys(rawRecords[0] || {}),
    summaryMetrics: {
      totalVolume: `${rawRecords.length} Records`,
      riskLevel,
      keyHighlight: highlight,
    },
    status: 'Received' as const,
  };
}
