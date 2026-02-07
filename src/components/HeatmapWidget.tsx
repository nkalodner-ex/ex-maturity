import { ChevronRight, MoreHorizontal } from 'lucide-react';
import type { HeatmapData } from '../data/mockHeatmapData';

interface HeatmapWidgetProps {
  data: HeatmapData;
}

export function HeatmapWidget({ data }: HeatmapWidgetProps) {
  const getChangeClass = (change: number): string => {
    if (change > 0) return 'heatmap-change positive';
    if (change < 0) return 'heatmap-change negative';
    return 'heatmap-change neutral';
  };

  const formatChange = (change: number): string => {
    if (change > 0) return `+${change}`;
    return change.toString();
  };

  // Calculate favorability color based on score
  const getFavorabilityClass = (score: number): string => {
    if (score >= 60) return 'favorability high';
    if (score >= 40) return 'favorability medium';
    return 'favorability low';
  };

  return (
    <div className="widget-card">
      <div className="widget-header">
        <h3 className="widget-title">{data.title}</h3>
        <button className="widget-menu-btn">
          <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="heatmap-container">
        <table className="heatmap-table">
          <thead>
            <tr>
              <th className="heatmap-header-label">Response Counts</th>
              <th className="heatmap-header-total">{data.totalResponses.toLocaleString()}</th>
              {data.comparisonGroups.map((group, idx) => (
                <th key={idx} className="heatmap-header-group">
                  {group.responses.toLocaleString()}
                </th>
              ))}
              <th className="heatmap-header-bar"></th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((category, rowIdx) => (
              <tr key={rowIdx} className="heatmap-row">
                <td className="heatmap-category">
                  <ChevronRight size={14} className="heatmap-expand-icon" />
                  {category.name}
                </td>
                <td className="heatmap-score">{category.score}%</td>
                {category.changes.map((change, colIdx) => (
                  <td key={colIdx} className={getChangeClass(change)}>
                    {formatChange(change)}
                  </td>
                ))}
                <td className="heatmap-bar-cell">
                  <div className={getFavorabilityClass(category.score)}>
                    <div
                      className="favorability-fill"
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
