import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ConditionRating, Inspection } from '../types';

interface ConditionGaugeProps {
  inspection?: Inspection;
}

export const ConditionGauge: React.FC<ConditionGaugeProps> = ({ inspection }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!inspection || !svgRef.current) return;

    // Calculate score
    const items = inspection.items;
    if (items.length === 0) return;

    const weights: Record<ConditionRating, number> = {
      [ConditionRating.GOOD]: 100,
      [ConditionRating.FAIR]: 75,
      [ConditionRating.POOR]: 40,
      [ConditionRating.CRITICAL]: 0,
      [ConditionRating.NOT_INSPECTED]: 0
    };

    const inspectedItems = items.filter(i => i.rating !== ConditionRating.NOT_INSPECTED);
    const totalScore = inspectedItems.reduce((acc, item) => acc + weights[item.rating], 0);
    const avgScore = inspectedItems.length ? totalScore / inspectedItems.length : 0;

    // D3 Render
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 120;
    const height = 120;
    const margin = 10;
    const radius = Math.min(width, height) / 2 - margin;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Scale for color
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["#ef4444", "#f59e0b", "#10b981"]);

    // Arc generator
    const arc = d3.arc()
      .innerRadius(radius - 10)
      .outerRadius(radius)
      .startAngle(-Math.PI * 0.75); // Start at 225 degrees

    // Background Arc
    g.append("path")
      .datum({ endAngle: Math.PI * 0.75 })
      .style("fill", "#e2e8f0")
      .attr("d", arc as any);

    // Foreground Arc
    const angleScale = d3.scaleLinear()
      .domain([0, 100])
      .range([-Math.PI * 0.75, Math.PI * 0.75]);

    g.append("path")
      .datum({ endAngle: angleScale(avgScore) })
      .style("fill", colorScale(avgScore))
      .attr("d", arc as any)
      .transition()
      .duration(1000)
      .attrTween("d", function(d: any) {
         const i = d3.interpolate(d.startAngle || -Math.PI * 0.75, d.endAngle);
         return function(t: number) {
             d.endAngle = i(t);
             return arc(d) || "";
         };
      });

    // Text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .style("font-size", "20px")
      .style("font-weight", "bold")
      .style("fill", "#334155")
      .text(Math.round(avgScore));

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.6em")
      .style("font-size", "10px")
      .style("fill", "#64748b")
      .text("Condition");

  }, [inspection]);

  if (!inspection) return <div className="text-xs text-slate-400">No Data</div>;

  return <svg ref={svgRef} />;
};
