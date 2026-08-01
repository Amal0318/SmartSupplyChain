"""
Production AI Agent — AI Insights & Executive Brief Engine
============================================================
Generates executive briefs, risk warnings, and actionable recommendations
based on aggregated warehouse and production analytics.
Supports both built-in Mock engine and OpenAI GPT integration.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.db.repositories.data_repository import AIReportRepository
from app.services.analytics_service import AnalyticsService

logger = logging.getLogger(__name__)
settings = get_settings()


class AIService:
    """
    AI Agent service for generating supply chain executive insights.
    """

    def __init__(
        self,
        analytics_service: AnalyticsService,
        ai_repo: AIReportRepository,
    ) -> None:
        self._analytics_service = analytics_service
        self._ai_repo = ai_repo

    async def generate_executive_report(self, user_id: str) -> Dict[str, Any]:
        """
        Synthesize warehouse and production metrics and generate an AI report.
        """
        warehouse_data = await self._analytics_service.get_warehouse_analytics()
        production_data = await self._analytics_service.get_production_analytics()

        wh_summary = warehouse_data["summary"]
        prod_summary = production_data["summary"]
        stockout_items = warehouse_data["stockout_risk_items"]
        delay_risks = production_data["delay_risks"]

        if settings.llm_provider.lower() == "openai" and settings.openai_api_key:
            report_content = await self._generate_openai_report(
                wh_summary, prod_summary, stockout_items, delay_risks
            )
        else:
            report_content = self._generate_mock_report(
                wh_summary, prod_summary, stockout_items, delay_risks
            )

        report_doc = {
            "generated_by": user_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "report_title": "Executive Supply Chain & Operations Brief",
            "summary": report_content["summary"],
            "key_metrics": {
                "material_availability_rate": wh_summary["material_availability_rate"],
                "stockout_risk_count": wh_summary["stockout_risk_count"],
                "schedule_adherence_rate": prod_summary["schedule_adherence_rate"],
                "delayed_orders_count": prod_summary["delayed_orders"],
                "total_stock_valuation": wh_summary["total_stock_valuation"],
            },
            "critical_risks": report_content["critical_risks"],
            "recommended_actions": report_content["recommended_actions"],
        }

        saved_report = await self._ai_repo.create(report_doc)
        logger.info(f"AI Executive Brief generated and saved (id={saved_report.get('id')})")
        return saved_report

    async def get_latest_report(self) -> Optional[Dict[str, Any]]:
        """Fetch the most recent AI report, or generate a default one if none exists."""
        report = await self._ai_repo.get_latest()
        if not report:
            # Generate initial mock report automatically
            report = await self.generate_executive_report(user_id="system")
        return report

    def _generate_mock_report(
        self,
        wh_summary: Dict[str, Any],
        prod_summary: Dict[str, Any],
        stockout_items: List[Dict[str, Any]],
        delay_risks: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Rules-based offline mock AI report generator."""
        avail_rate = wh_summary["material_availability_rate"]
        adherence_rate = prod_summary["schedule_adherence_rate"]
        stockout_count = wh_summary["stockout_risk_count"]
        delayed_orders = prod_summary["delayed_orders"]

        # 1. Executive Summary
        if avail_rate >= 90.0 and adherence_rate >= 90.0:
            status_text = "Supply chain operations are running in OPTIMAL condition with healthy safety stock levels and high schedule adherence."
        elif avail_rate >= 75.0 and adherence_rate >= 75.0:
            status_text = "Supply chain operations are MODERATE. Minor material deficits and production schedule bottlenecks detected that require management review."
        else:
            status_text = "Supply chain operations are experiencing CRITICAL RISKS. Material deficits threaten upcoming production schedules."

        summary = (
            f"{status_text} Currently tracking {wh_summary['total_materials_tracked']} materials with an overall availability rate of {avail_rate}%. "
            f"Production schedule adherence stands at {adherence_rate}% across {prod_summary['total_production_orders']} planned orders."
        )

        # 2. Critical Risks
        risks = []
        if stockout_count > 0:
            materials_list = ", ".join([f"{item['material_name']} (Deficit: {item['deficit']} units)" for item in stockout_items[:3]])
            risks.append({
                "severity": "HIGH",
                "category": "Material Shortage",
                "title": f"Stockout Risk Detected for {stockout_count} Material(s)",
                "description": f"The following key materials have fallen below safety reorder points: {materials_list}.",
            })

        if delayed_orders > 0 or len(delay_risks) > 0:
            risks.append({
                "severity": "HIGH" if delayed_orders > 2 else "MEDIUM",
                "category": "Production Bottleneck",
                "title": f"Production Schedule Delays ({delayed_orders} Delayed Order(s))",
                "description": f"Target completion dates are compromised for {len(delay_risks)} order(s) due to equipment constraints or material shortage.",
            })

        if not risks:
            risks.append({
                "severity": "LOW",
                "category": "General",
                "title": "Nominal Operating Status",
                "description": "No critical material shortages or production bottlenecks detected in current snapshot.",
            })

        # 3. Recommended Actions
        actions = []
        if stockout_count > 0:
            actions.append({
                "priority": "P1 - Immediate",
                "department": "Procurement",
                "recommendation": "Issue expedited Purchase Orders (POs) for stockout-risk materials to prevent line stops.",
            })
        if delayed_orders > 0:
            actions.append({
                "priority": "P2 - High",
                "department": "Production Planning",
                "recommendation": "Reassign delayed production orders to alternative available machines with lower utilization.",
            })
        actions.append({
            "priority": "P3 - Standard",
            "department": "Inventory Management",
            "recommendation": "Conduct monthly inventory reorder point calibration based on quarterly demand shifts.",
        })

        return {
            "summary": summary,
            "critical_risks": risks,
            "recommended_actions": actions,
        }

    async def _generate_openai_report(
        self,
        wh_summary: Dict[str, Any],
        prod_summary: Dict[str, Any],
        stockout_items: List[Dict[str, Any]],
        delay_risks: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Generate report using OpenAI GPT SDK."""
        try:
            import openai
            client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
            prompt = f"""
You are an expert AI Supply Chain & Operations Analyst. Analyze the following operational data and produce a structured executive brief in JSON format:
Warehouse Summary: {wh_summary}
Production Summary: {prod_summary}
Stockout Items: {stockout_items[:5]}
Delay Risks: {delay_risks[:5]}

Return JSON with keys:
"summary": string executive overview,
"critical_risks": list of {{"severity": string, "category": string, "title": string, "description": string}},
"recommended_actions": list of {{"priority": string, "department": string, "recommendation": string}}
"""
            response = await client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=settings.openai_max_tokens,
                temperature=settings.openai_temperature,
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as exc:
            logger.error(f"OpenAI API call failed, falling back to mock engine: {exc}")
            return self._generate_mock_report(wh_summary, prod_summary, stockout_items, delay_risks)
