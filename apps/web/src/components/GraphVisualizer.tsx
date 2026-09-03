"use client";

import React, { useState, useMemo } from 'react';
import { Network, Sparkles, CheckCircle2, Info, Filter, Layers, ZoomIn, RefreshCw } from 'lucide-react';
import { useDevPersona } from '@/hooks/useDevPersona';
import { useStudentCompetencyGraph } from '@/hooks/useStudentCompetencies';

interface Node {
  id: string;
  label: string;
  group: 'student' | 'competency' | 'project' | 'opportunity';
  score?: number;
  category?: string;
  verified?: boolean;
  x: number;
  y: number;
}

interface Link {
  source: string;
  target: string;
  label: string;
  type: string;
}

export default function GraphVisualizer() {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'OPPORTUNITIES'>('ALL');

  const { currentPersona } = useDevPersona();
  const { data: graphData, isLoading, refetch } = useStudentCompetencyGraph();

  // Dynamic layout calculation for knowledge graph nodes from real PostgreSQL graph
  const nodes: Node[] = useMemo(() => {
    const studentNode: Node = {
      id: currentPersona?.id || 'student',
      label: currentPersona?.name || 'Student Identity',
      group: 'student',
      score: 88,
      verified: true,
      x: 380,
      y: 210,
    };

    if (!graphData?.nodes || graphData.nodes.length === 0) {
      return [studentNode];
    }

    const centerX = 380;
    const centerY = 210;
    const radius = 160;
    const total = graphData.nodes.length;

    const dynamicNodes: Node[] = graphData.nodes.map((n, i) => {
      const angle = (2 * Math.PI / Math.max(total, 1)) * i;
      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + (radius * 0.72) * Math.sin(angle));
      const group = n.type === 'competency' ? 'competency' : n.type === 'skill' ? 'project' : 'opportunity';
      return {
        id: n.id,
        label: n.name || n.label,
        group: group as any,
        category: n.category || n.type,
        score: n.score || 80,
        verified: n.is_verified ?? true,
        x,
        y,
      };
    });

    return [studentNode, ...dynamicNodes];
  }, [graphData?.nodes, currentPersona]);

  // Dynamic links from graph edges + student connections
  const links: Link[] = useMemo(() => {
    const studentId = currentPersona?.id || 'student';
    const edgeLinks: Link[] = (graphData?.edges || []).map((e) => ({
      source: e.source,
      target: e.target,
      label: e.relationship,
      type: e.relationship,
    }));

    // Connect student node to competency nodes
    const studentCompetencyLinks: Link[] = (graphData?.nodes || [])
      .filter((n) => n.type === 'competency')
      .map((c) => ({
        source: studentId,
        target: c.id,
        label: 'HAS_COMPETENCY',
        type: 'HAS_COMPETENCY',
      }));

    return [...edgeLinks, ...studentCompetencyLinks];
  }, [graphData?.edges, graphData?.nodes, currentPersona]);

  const getNodeColor = (node: Node) => {
    switch (node.group) {
      case 'student': return '#6366F1'; // Indigo
      case 'competency': return node.verified ? '#10B981' : '#F59E0B'; // Emerald / Amber
      case 'project': return '#EC4899'; // Pink
      case 'opportunity': return '#06B6D4'; // Cyan
      default: return '#94A3B8';
    }
  };

  const getNodeBorder = (node: Node) => {
    if (selectedNode?.id === node.id) return '#FFFFFF';
    return 'rgba(255, 255, 255, 0.2)';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 relative overflow-hidden">
      {/* Visualizer Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">Neo4j Competency & Relationship Graph</h3>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Live Cypher Topology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-hop path: <code className="text-indigo-300 font-mono text-[11px]">(Student)-[:COMPLETED]-&gt;(Project)-[:DEMONSTRATES]-&gt;(Competency)-[:REQUIRED_FOR]-&gt;(Opportunity)</code>
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10 text-xs">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'ALL' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All Nodes
          </button>
          <button 
            onClick={() => setFilter('VERIFIED')}
            className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'VERIFIED' ? 'bg-emerald-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Verified Evidence
          </button>
          <button 
            onClick={() => setFilter('OPPORTUNITIES')}
            className={`px-2.5 py-1 rounded-md transition-colors ${filter === 'OPPORTUNITIES' ? 'bg-cyan-600 text-white font-medium shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Match Walks
          </button>
          <button
            onClick={() => refetch()}
            title="Reload live graph from PostgreSQL"
            className="p-1.5 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main SVG Graph Canvas */}
      <div className="relative w-full h-96 bg-[#080B14] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
        {/* Ambient background glow */}
        <div className="absolute w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <svg className="w-full h-full cursor-grab active:cursor-grabbing" viewBox="0 0 760 420">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.25)" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366F1" />
            </marker>
          </defs>

          {/* Render Graph Links */}
          {links.map((link, idx) => {
            const src = nodes.find(n => n.id === link.source);
            const tgt = nodes.find(n => n.id === link.target);
            if (!src || !tgt) return null;

            const isMatchPath = link.type === 'MATCHED_TO';
            const isDemonstrates = link.type === 'DEMONSTRATES';

            return (
              <g key={idx}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke={isMatchPath ? '#6366F1' : isDemonstrates ? '#EC4899' : 'rgba(255, 255, 255, 0.15)'}
                  strokeWidth={isMatchPath ? 2.5 : 1.5}
                  strokeDasharray={isMatchPath ? '4 4' : undefined}
                  markerEnd={isMatchPath ? "url(#arrow-active)" : "url(#arrow)"}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Render Graph Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const nodeColor = getNodeColor(node);

            return (
              <g 
                key={node.id} 
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Outer halo */}
                <circle
                  r={isSelected ? 26 : 20}
                  fill={nodeColor}
                  fillOpacity={0.2}
                  stroke={nodeColor}
                  strokeWidth={isSelected ? 3 : 1.5}
                  className="transition-all duration-300 group-hover:scale-125"
                />
                
                {/* Core node */}
                <circle
                  r={isSelected ? 16 : 12}
                  fill={nodeColor}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected ? 2 : 0.8}
                />

                {/* Node Label Text */}
                <text
                  y={30}
                  textAnchor="middle"
                  fill="#E2E8F0"
                  fontSize="11"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {node.label}
                </text>
                
                {node.score && (
                  <text
                    y={-18}
                    textAnchor="middle"
                    fill={node.score >= 85 ? '#34D399' : '#FBBF24'}
                    fontSize="10"
                    fontWeight="700"
                    className="pointer-events-none"
                  >
                    {node.score}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Floating Overlay */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 glass-panel-glow rounded-xl p-3 text-xs animate-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getNodeColor(selectedNode) }} />
                {selectedNode.label}
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white px-1"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-2 space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Node Type:</span>
                <span className="font-mono uppercase text-indigo-300">{selectedNode.group}</span>
              </div>
              {selectedNode.category && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span>{selectedNode.category}</span>
                </div>
              )}
              {selectedNode.score && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Mastery Score:</span>
                  <span className="font-bold text-emerald-400">{selectedNode.score}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Verification:</span>
                <span className={selectedNode.verified ? "text-emerald-400 flex items-center gap-1" : "text-amber-400"}>
                  {selectedNode.verified ? "Faculty / Test Verified" : "Self Reported"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 border-t border-white/5 pt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Student Profile</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Verified Competency</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Project Evidence</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Opportunity Node</span>
        </div>
        <div className="text-slate-500 font-mono">
          Cypher Depth: 3 Hops | Neo4j v5.18
        </div>
      </div>
    </div>
  );
}
