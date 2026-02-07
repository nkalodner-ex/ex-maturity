import {
  X,
  BarChart3,
  PieChart,
  Table2,
  Grid3X3,
  Users,
  TrendingUp,
  ListOrdered,
  FileText,
  Lightbulb,
  LayoutGrid,
  ClipboardList,
  Type,
  Image,
  Cloud,
  Clock,
  FileSpreadsheet,
  Radio,
  Target,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface WidgetOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  disabled?: boolean;
  isTextIQ?: boolean;
}

interface WidgetCategory {
  name: string;
  widgets: WidgetOption[];
}

interface AddWidgetModalProps {
  onClose: () => void;
  onSetupTextIQ: () => void;
}

const widgetCategories: WidgetCategory[] = [
  {
    name: 'Charts',
    widgets: [
      { id: 'bar', name: 'Bar Chart', icon: <BarChart3 size={18} /> },
      { id: 'bubble', name: 'Bubble Chart', icon: <Target size={18} /> },
      { id: 'textiq-bubble', name: 'Text iQ Bubble Chart', icon: <Target size={18} />, disabled: true, isTextIQ: true },
      { id: 'donut', name: 'Donut / Pie', icon: <PieChart size={18} /> },
    ],
  },
  {
    name: 'Table',
    widgets: [
      { id: 'table', name: 'Table', icon: <Table2 size={18} /> },
      { id: 'heatmap', name: 'Heat Map', icon: <Grid3X3 size={18} /> },
      { id: 'demographic', name: 'Demographic Breakout', icon: <Users size={18} /> },
    ],
  },
  {
    name: 'Analysis',
    widgets: [
      { id: 'key-drivers', name: 'Key Drivers', icon: <TrendingUp size={18} /> },
      { id: 'scorecard', name: 'Scorecard', icon: <ListOrdered size={18} /> },
      { id: 'question-list', name: 'Question List', icon: <FileText size={18} /> },
      { id: 'engagement-headlines', name: 'Engagement Headlines', icon: <FileText size={18} /> },
      { id: 'textiq-table', name: 'Text iQ Table', icon: <Table2 size={18} />, disabled: true, isTextIQ: true },
      { id: 'focus-areas', name: 'Focus Areas', icon: <Lightbulb size={18} /> },
      { id: 'comparison', name: 'Comparison', icon: <LayoutGrid size={18} /> },
    ],
  },
  {
    name: 'Action Planning',
    widgets: [
      { id: 'action-plan', name: 'Action Plan Item Summary', icon: <ClipboardList size={18} /> },
    ],
  },
  {
    name: 'Static Content',
    widgets: [
      { id: 'rich-text', name: 'Rich Text Editor', icon: <Type size={18} /> },
      { id: 'image', name: 'Image', icon: <Image size={18} /> },
    ],
  },
  {
    name: 'Other',
    widgets: [
      { id: 'word-cloud', name: 'New Word Cloud', icon: <Cloud size={18} />, disabled: true, isTextIQ: true },
      { id: 'participation', name: 'Participation Summary', icon: <Clock size={18} /> },
      { id: 'response-rate', name: 'Response Rate Table', icon: <FileSpreadsheet size={18} /> },
      { id: 'response-ticker', name: 'Response Ticker', icon: <Radio size={18} /> },
      { id: 'engagement-summary', name: 'Engagement Summary', icon: <Target size={18} /> },
    ],
  },
];

export function AddWidgetModal({ onClose, onSetupTextIQ }: AddWidgetModalProps) {
  const hasDisabledTextIQ = widgetCategories.some(cat =>
    cat.widgets.some(w => w.disabled && w.isTextIQ)
  );

  return (
    <div className="xm-modal-overlay" onClick={onClose}>
      <div className="widget-modal" onClick={e => e.stopPropagation()}>
        <div className="widget-modal-header">
          <h2>Add Widget</h2>
          <button className="xm-nudge-dismiss" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* XM Advisor Nudge for Text iQ */}
        {hasDisabledTextIQ && (
          <div className="xm-nudge modal-nudge">
            <div className="xm-nudge-header">
              <div className="xm-advisor-badge">
                <Sparkles size={14} />
                <span>XM Advisor</span>
              </div>
              <span className="xm-advisor-subtitle">Recommendation</span>
            </div>
            <div className="xm-nudge-body">
              <div className="xm-nudge-icon warning">
                <AlertCircle size={18} />
              </div>
              <div className="xm-nudge-content">
                <span className="xm-nudge-text">
                  <strong>Text iQ widgets are unavailable.</strong> We'll guide you through a quick setup
                  to unlock word clouds, text analysis tables, and sentiment charts for your open-ended responses.
                </span>
                <button className="xm-nudge-cta" onClick={onSetupTextIQ}>
                  Start Guided Setup
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="widget-modal-content">
          {widgetCategories.map((category) => (
            <div key={category.name} className="widget-category">
              <div className="widget-category-name">{category.name}</div>
              <div className="widget-category-items">
                {category.widgets.map((widget) => (
                  <button
                    key={widget.id}
                    className={`widget-option ${widget.disabled ? 'disabled' : ''}`}
                    disabled={widget.disabled}
                    title={widget.disabled ? 'Text iQ not configured' : undefined}
                  >
                    <span className="widget-option-icon">{widget.icon}</span>
                    <span className="widget-option-name">{widget.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="widget-modal-footer">
          <button className="xm-btn xm-btn-primary">
            + Add widget
          </button>
          <button className="xm-btn xm-btn-secondary">
            + Add divider
          </button>
          <button className="xm-btn xm-btn-secondary">
            + Add group
          </button>
        </div>
      </div>
    </div>
  );
}
