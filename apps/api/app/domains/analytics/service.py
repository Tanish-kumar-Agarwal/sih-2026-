from typing import List, Dict, Any

class AnalyticsService:
    async def get_macro_trends(self) -> Dict[str, Any]:
        return {
            "total_students_enrolled": 18450,
            "total_verified_competencies": 62300,
            "active_opportunities_count": 420,
            "average_match_accuracy": 91.8,
            "fastest_growing_competencies": [
                {"name": "Graph Neural Networks & Neo4j", "growth_percent": 142.5},
                {"name": "FastAPI & Async Python", "growth_percent": 98.4},
                {"name": "Kubernetes & Cloud Infrastructure", "growth_percent": 84.1},
                {"name": "Next.js 14 & React Server Components", "growth_percent": 76.0}
            ],
            "hiring_success_rate_by_match_tier": [
                {"tier": "90% - 100% Match", "hire_conversion_rate": 88.4},
                {"tier": "75% - 89% Match", "hire_conversion_rate": 64.2},
                {"tier": "Below 75% Match", "hire_conversion_rate": 22.0}
            ]
        }

analytics_service = AnalyticsService()
