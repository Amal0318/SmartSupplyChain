import { jsPDF } from 'jspdf';
import { ExecutiveReport, AgentSubmission, AssignedTask, DepartmentReportItem } from '../types';

/**
 * Generates and downloads a formatted PDF report for the Master Executive Control Tower.
 */
export function exportExecutiveReportToPDF(
  report: ExecutiveReport,
  healthScore: number,
  submissions: AgentSubmission[] = [],
  tasks: AssignedTask[] = []
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper function for adding pages and running headers/footers
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      addHeader();
    }
  };

  const addHeader = () => {
    doc.setFillColor(24, 24, 27); // Zinc 900
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setFillColor(245, 197, 39); // Yellow Accent #F5C527
    doc.rect(0, 36, pageWidth, 4, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('SUPPLY CHAIN AI - MASTER EXECUTIVE CONTROL TOWER REPORT', margin, 24);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, 24, { align: 'right' });

    y = 60;
  };

  const addFooter = (pageNum: number, totalPages: number) => {
    doc.setPage(pageNum);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Confidential - Supply Chain AI Executive Intelligence System  |  Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 20,
      { align: 'center' }
    );
  };

  // Initial Page Header
  addHeader();

  // Document Title Banner
  doc.setFillColor(245, 245, 247);
  doc.roundedRect(margin, y, contentWidth, 60, 8, 8, 'F');
  doc.setDrawColor(220, 220, 225);
  doc.roundedRect(margin, y, contentWidth, 60, 8, 8, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(24, 24, 27);
  doc.text('EXECUTIVE STRATEGIC REPORT', margin + 16, y + 26);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 105);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin + 16, y + 44);

  // Health Score Badge on Right
  doc.setFillColor(24, 24, 27);
  doc.roundedRect(pageWidth - margin - 130, y + 10, 114, 40, 6, 6, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(245, 197, 39);
  doc.text('HEALTH SCORE', pageWidth - margin - 73, y + 23, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${healthScore} / 100`, pageWidth - margin - 73, y + 40, { align: 'center' });

  y += 75;

  // Helper for Section Titles
  const drawSectionTitle = (title: string) => {
    checkPageBreak(35);
    doc.setFillColor(24, 24, 27);
    doc.rect(margin, y, 4, 14, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    doc.text(title.toUpperCase(), margin + 10, y + 11);

    y += 20;
    doc.setDrawColor(230, 230, 235);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  };

  // Section 1: Executive Situation Overview
  drawSectionTitle('1. Executive Situation Overview');

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(50, 50, 55);

  const situationLines = doc.splitTextToSize(report.currentSituation, contentWidth);
  checkPageBreak(situationLines.length * 14 + 10);
  doc.text(situationLines, margin, y);
  y += situationLines.length * 14 + 15;

  // Section 2: Sub-Agent Submissions & Data Feeds
  drawSectionTitle(`2. Received Sub-Agent Data Feeds (${submissions.length})`);

  if (submissions.length === 0) {
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('No manual files submitted. Active live telemetry feeds continuously analyzed.', margin, y);
    y += 20;
  } else {
    submissions.forEach((s) => {
      checkPageBreak(50);
      doc.setFillColor(250, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 42, 6, 6, 'F');
      doc.setDrawColor(230, 230, 235);
      doc.roundedRect(margin, y, contentWidth, 42, 6, 6, 'D');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(24, 24, 27);
      doc.text(`[${s.agentName}] - ${s.fileName}`, margin + 10, y + 16);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 105);
      doc.text(`Records: ${s.recordCount}  |  Risk: ${s.summaryMetrics.riskLevel}  |  Time: ${s.timestamp}`, margin + 10, y + 30);

      y += 48;
    });
  }

  y += 10;

  // Section 3: Critical Issues Identified
  drawSectionTitle('3. Critical Supply Chain Issues');

  report.criticalIssues.forEach((issue, idx) => {
    const issueText = `${idx + 1}. ${issue}`;
    const lines = doc.splitTextToSize(issueText, contentWidth - 15);
    checkPageBreak(lines.length * 13 + 8);

    doc.setFillColor(239, 68, 68); // Red indicator
    doc.circle(margin + 4, y + 4, 3, 'F');

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 45);
    doc.text(lines, margin + 14, y + 7);
    y += lines.length * 13 + 8;
  });

  y += 10;

  // Section 4: Root Cause & Financial Exposure
  drawSectionTitle('4. Root Cause & Financial Impact');

  checkPageBreak(60);
  doc.setFillColor(254, 242, 242); // Rose light
  doc.roundedRect(margin, y, contentWidth, 54, 6, 6, 'F');
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin, y, contentWidth, 54, 6, 6, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(153, 27, 27);
  doc.text('ROOT CAUSE:', margin + 12, y + 18);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(40, 40, 45);
  const rcLines = doc.splitTextToSize(report.rootCause, contentWidth - 120);
  doc.text(rcLines, margin + 95, y + 18);

  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(153, 27, 27);
  doc.text('FINANCIAL EXPOSURE:', margin + 12, y + 38);

  doc.setFont('Helvetica', 'extrabold');
  doc.setTextColor(185, 28, 28);
  doc.text(report.businessImpact, margin + 145, y + 38);

  y += 68;

  // Section 5: Actionable Recommendations
  drawSectionTitle('5. Autonomous Actionable Recommendations');

  report.recommendedActions.forEach((action, idx) => {
    const actionText = `[Action ${idx + 1}] ${action}`;
    const lines = doc.splitTextToSize(actionText, contentWidth - 20);
    checkPageBreak(lines.length * 13 + 10);

    doc.setFillColor(245, 197, 39);
    doc.roundedRect(margin, y, 18, 14, 3, 3, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`${idx + 1}`, margin + 6, y + 10);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 45);
    doc.text(lines, margin + 26, y + 10);

    y += lines.length * 13 + 10;
  });

  // Add Page Numbers to all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    addFooter(i, totalPages);
  }

  // Save PDF
  const filename = `Executive_Supply_Chain_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
