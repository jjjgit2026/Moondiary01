

interface TermExplanationProps {
  term: 'period' | 'predicted' | 'ovulation' | 'ovulation-day';
  onClose: () => void;
}

const termData: Record<string, { title: string; color: string; bgColor: string; description: string }> = {
  'period': {
    title: '月经期',
    color: '#e91e63',
    bgColor: '#fce4ec',
    description: '月经期，是指女性子宫内膜因激素的周期性变化而脱落，出现阴道出血的这个阶段，持续时间平均为4-6天，不过在2-7天都是正常的。'
  },
  'predicted': {
    title: '预测经期',
    color: '#ffab91',
    bgColor: '#fff8f5',
    description: '预测经期是根据您的生理周期记录情况进行智能推算的结果，意味着您在这个阶段来月经的可能性较高。'
  },
  'ovulation': {
    title: '排卵期（易孕期）',
    color: '#ce93d8',
    bgColor: '#fce4ec',
    description: '排卵期，即常说的易孕期，一般包括排卵日的前5天和后4天，连同排卵日在内共10天的时间。'
  },
  'ovulation-day': {
    title: '排卵日',
    color: '#ba68c8',
    bgColor: '#f3e5f5',
    description: '排卵日是成熟的卵泡破裂并排出卵子的那一天。在一般情况下，排卵通常发生在下次月经来潮前的14天左右。'
  }
};

export default function TermExplanation({ term, onClose }: TermExplanationProps) {
  const data = termData[term];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="term-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="term-modal-header">
          <h3>名词解释</h3>
          <button className="close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="cycle-diagram">
          <div className="diagram-bar">
            <div className="bar-section period" style={{ width: '30%' }} />
            <div className="bar-section safe" style={{ width: '25%' }} />
            <div className="bar-section ovulation" style={{ width: '30%' }} />
            <div className="bar-section safe" style={{ width: '15%' }} />
          </div>
          <div className="diagram-labels">
            <span className="label-left">月经期</span>
            <span className="label-center">排卵日</span>
            <span className="label-right">排卵期(易孕期)</span>
          </div>
        </div>

        <div className="term-card" style={{ borderLeftColor: data.color }}>
          <div className="term-title">
            <span className="term-dot" style={{ backgroundColor: data.color }} />
            <span>{data.title}</span>
          </div>
          <p className="term-description">{data.description}</p>
        </div>

        {term === 'period' && (
          <div className="term-card" style={{ borderLeftColor: termData['predicted'].color }}>
            <div className="term-title">
              <span className="term-dot" style={{ backgroundColor: termData['predicted'].color }} />
              <span>{termData['predicted'].title}</span>
            </div>
            <p className="term-description">{termData['predicted'].description}</p>
          </div>
        )}

        {term === 'ovulation-day' && (
          <div className="term-card" style={{ borderLeftColor: termData['ovulation'].color }}>
            <div className="term-title">
              <span className="term-dot" style={{ backgroundColor: termData['ovulation'].color }} />
              <span>{termData['ovulation'].title}</span>
            </div>
            <p className="term-description">{termData['ovulation'].description}</p>
          </div>
        )}

        {term === 'ovulation' && (
          <div className="term-card" style={{ borderLeftColor: termData['ovulation-day'].color }}>
            <div className="term-title">
              <span className="term-dot" style={{ backgroundColor: termData['ovulation-day'].color }} />
              <span>{termData['ovulation-day'].title}</span>
            </div>
            <p className="term-description">{termData['ovulation-day'].description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
