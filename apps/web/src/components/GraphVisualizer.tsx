"use client";

import React, { useState } from 'react';
import { Network, Sparkles, CheckCircle2, Info, Filter, Layers, ZoomIn, RefreshCw } from 'lucide-react';

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

  // Interactive coordinate map for knowledge graph nodes
  const nodes: Node[] = [
    { id: 's_aarav', label: 'Aarav Sharma', group: 'student', score: 89.4, x: 380, y: 220 },
    { id: 'c_py', label: 'Python', group: 'competency', category: 'Core Technical', score: 92, verified: true, x: 220, y: 130 },
    { id: 'c_fastapi', label: 'FastAPI Backend', group: 'competency', category: 'Core Technical', score: 85, verified: true, x: 190, y: 250 },
    { id: 'c_react', label: 'React / Next.js', group: 'competency', category: 'Core Technical', score: 88, verified: true, x: 270, y: 340 },
    { id: 'c_neo4j', label: 'Neo4j Graph DB', group: 'competency', category: 'Architectural', score: 78, verified: false, x: 490, y: 350 },
    { id: 'c_ml', label: 'Applied ML', group: 'competency', category: 'Applied Domain', score: 84, verified: true, x: 530, y: 130 },
    { id: 'p_skillsetu', label: 'Project: SkillSetu', group: 'project', verified: true, x: 110, y: 360 },
    { id: 'o_fullstack', label: 'AI Platform Intern', group: 'opportunity', score: 91.5, x: 580, y: 240 },
  ];

  const links: Link[] = [
    { source: 's_aarav', target: 'c_py', label: 'HAS_COMPETENCY (92%)', type: 'HAS_COMPETENCY' },
    { source: 's_aarav', target: 'c_fastapi', label: 'HAS_COMPETENCY (85%)', type: 'HAS_COMPETENCY' },
    { source: 's_aarav', target: 'c_react', label: 'HAS_COMPETENCY (88%)', type: 'HAS_COMPETENCY' },
    { source: 's_aarav', target: 'c_neo4j', label: 'HAS_COMPETENCY (78%)', type: 'HAS_COMPETENCY' },
    { source: 's_aarav', target: 'c_ml', label: 'HAS_COMPETENCY (84%)', type: 'HAS_COMPETENCY' },
    { source: 's_aarav', target: 'p_skillsetu', label: 'COMPLETED', type: 'COMPLETED' },
    { source: 'p_skillsetu', target: 'c_fastapi', label: 'DEMONSTRATES', type: 'DEMONSTRATES' },
    { source: 'p_skillsetu', target: 'c_react', label: 'DEMONSTRATES', type: 'DEMONSTRATES' },
    { source: 'p_skillsetu', target: 'c_neo4j', label: 'DEMONSTRATES', type: 'DEMONSTRATES' },
    { source: 'c_fastapi', target: 'o_fullstack', label: 'REQUIRED_FOR', type: 'REQUIRED_FOR' },
    { source: 'c_react', target: 'o_fullstack', label: 'REQUIRED_FOR', type: 'REQUIRED_FOR' },
    { source: 's_aarav', target: 'o_fullstack', label: 'MATCHED_TO (91.5%)', type: 'MATCHED_TO' }
  ];

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
