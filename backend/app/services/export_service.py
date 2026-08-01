"""
Production AI Agent — Report Export Service
============================================
Generates formatted PDF executive reports using ReportLab.
"""

import io
import logging
from datetime import datetime, timezone
from typing import Any, Dict

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

logger = logging.getLogger(__name__)


class ExportService:
    """
    Generates PDF binary streams from executive AI reports and analytics.
    """

    def generate_pdf_report(self, report: Dict[str, Any]) -> bytes:
        """
        Build a PDF report in memory and return PDF bytes.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold",
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#0284c7"),
            fontName="Helvetica-Bold",
        )
        section_style = ParagraphStyle(
            "SectionHeader",
            parent=styles["Heading2"],
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            fontName="Helvetica-Bold",
            spaceBefore=10,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "BodyTextCustom",
            parent=styles["Normal"],
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor("#334155"),
            fontName="Helvetica",
        )

        elements = []

        # Title & Subtitle
        elements.append(Paragraph("Production AI Agent", subtitle_style))
        elements.append(Paragraph(report.get("report_title", "Executive Operations Brief"), title_style))
        elements.append(
            Paragraph(
                f"Generated At: {report.get('generated_at', datetime.now(timezone.utc).isoformat())[:19].replace('T', ' ')} UTC",
                body_style,
            )
        )
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#e2e8f0"), spaceAfter=12))

        # Executive Summary Section
        elements.append(Paragraph("1. Executive Summary", section_style))
        elements.append(Paragraph(report.get("summary", "No summary available."), body_style))
        elements.append(Spacer(1, 12))

        # Key Metrics Table
        elements.append(Paragraph("2. Operational Key Performance Indicators (KPIs)", section_style))
        metrics = report.get("key_metrics", {})
        kpi_data = [
            ["Metric Name", "Value", "Status"],
            [
                "Material Availability Rate",
                f"{metrics.get('material_availability_rate', 0)}%",
                "Healthy" if metrics.get("material_availability_rate", 0) >= 85 else "Action Required",
            ],
            [
                "Stockout Risk Materials",
                str(metrics.get("stockout_risk_count", 0)),
                "OK" if metrics.get("stockout_risk_count", 0) == 0 else "Warning",
            ],
            [
                "Schedule Adherence Rate",
                f"{metrics.get('schedule_adherence_rate', 0)}%",
                "Optimal" if metrics.get("schedule_adherence_rate", 0) >= 85 else "Delayed",
            ],
            [
                "Total Stock Valuation",
                f"${metrics.get('total_stock_valuation', 0):,.2f}",
                "Active Asset",
            ],
        ]

        t_kpi = Table(kpi_data, colWidths=[200, 150, 150])
        t_kpi.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 1), (-1, -1), 8.5),
            ])
        )
        elements.append(t_kpi)
        elements.append(Spacer(1, 14))

        # Critical Risks Section
        elements.append(Paragraph("3. Operational Risk Analysis", section_style))
        risks = report.get("critical_risks", [])
        risk_data = [["Severity", "Category", "Alert Title & Description"]]
        for r in risks:
            p_desc = Paragraph(
                f"<b>{r.get('title', '')}</b><br/>{r.get('description', '')}", body_style
            )
            risk_data.append([r.get("severity", "MEDIUM"), r.get("category", "General"), p_desc])

        t_risk = Table(risk_data, colWidths=[80, 100, 320])
        t_risk.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
            ])
        )
        elements.append(t_risk)
        elements.append(Spacer(1, 14))

        # Recommended Actions Section
        elements.append(Paragraph("4. Recommended Managerial Actions", section_style))
        actions = report.get("recommended_actions", [])
        action_data = [["Priority", "Department", "Action Item"]]
        for a in actions:
            p_act = Paragraph(a.get("recommendation", ""), body_style)
            action_data.append([a.get("priority", "Standard"), a.get("department", "Operations"), p_act])

        t_act = Table(action_data, colWidths=[90, 110, 300])
        t_act.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0284c7")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
            ])
        )
        elements.append(t_act)

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
