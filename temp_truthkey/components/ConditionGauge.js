"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionGauge = void 0;
const react_2 = __importStar(require("react"));
const d3 = __importStar(require("d3"));
const types_2 = require("../types");
const ConditionGauge = ({ inspection }) => {
    const svgRef = (0, react_2.useRef)(null);
    (0, react_2.useEffect)(() => {
        if (!inspection || !svgRef.current)
            return;
        // Calculate score
        const items = inspection.items;
        if (items.length === 0)
            return;
        const weights = {
            [types_2.ConditionRating.GOOD]: 100,
            [types_2.ConditionRating.FAIR]: 75,
            [types_2.ConditionRating.POOR]: 40,
            [types_2.ConditionRating.CRITICAL]: 0,
            [types_2.ConditionRating.NOT_INSPECTED]: 0
        };
        const inspectedItems = items.filter(i => i.rating !== types_2.ConditionRating.NOT_INSPECTED);
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
        const colorScale = d3.scaleLinear()
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
            .attr("d", arc);
        // Foreground Arc
        const angleScale = d3.scaleLinear()
            .domain([0, 100])
            .range([-Math.PI * 0.75, Math.PI * 0.75]);
        g.append("path")
            .datum({ endAngle: angleScale(avgScore) })
            .style("fill", colorScale(avgScore))
            .attr("d", arc)
            .transition()
            .duration(1000)
            .attrTween("d", function (d) {
            const i = d3.interpolate(d.startAngle || -Math.PI * 0.75, d.endAngle);
            return function (t) {
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
    if (!inspection)
        return <div className="text-xs text-slate-400">No Data</div>;
    return <svg ref={svgRef}/>;
};
exports.ConditionGauge = ConditionGauge;
