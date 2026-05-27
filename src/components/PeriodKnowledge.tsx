import { useState } from 'react';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  expanded?: boolean;
}

interface KnowledgeSection {
  title: string;
  icon: string;
  items: KnowledgeItem[];
}

const knowledgeData: KnowledgeSection[] = [
  {
    title: '月经的形成',
    icon: '🌸',
    items: [
      {
        id: '1',
        title: '什么是月经？',
        content: '月经是指女性子宫内膜周期性脱落出血的生理现象。它是生殖系统成熟的标志之一，也是身体准备怀孕的信号。正常的月经周期通常为21-35天，经期持续2-7天。'
      },
      {
        id: '2',
        title: '月经是怎么形成的？',
        content: '在激素的作用下，子宫内膜会周期性增厚，为可能的怀孕做准备。如果没有怀孕，增厚的内膜就会脱落、出血，形成月经。这个过程由下丘脑-垂体-卵巢轴调控。'
      },
      {
        id: '3',
        title: '月经周期是怎么回事？',
        content: '从这次月经来的第一天到下次月经来的前一天，称为一个月经周期。正常的周期通常是21到35天。周期可分为月经期、卵泡期、排卵期和黄体期四个阶段。'
      },
      {
        id: '4',
        title: '经血是什么颜色？',
        content: '正常的经血颜色为暗红色或鲜红色，可能含有少量血块。如果经血呈粉红色、褐色或黑色，可能与出血量或速度有关。如果持续异常颜色，建议咨询医生。'
      }
    ]
  },
  {
    title: '经期注意事项',
    icon: '💖',
    items: [
      {
        id: '5',
        title: '如何选择卫生巾？',
        content: '应选择正规品牌、无荧光剂的卫生巾。根据经血量选择合适的型号：量多时用夜用或加长型，量少时用日用或护垫。也可以尝试卫生棉条或月经杯。'
      },
      {
        id: '6',
        title: '卫生巾多久换一次？',
        content: '无论量多少，建议每2-4小时更换一次卫生巾，最长不超过6小时。这可以保持干爽，预防细菌滋生，减少异味和感染风险。'
      },
      {
        id: '7',
        title: '经期可以洗头洗澡吗？',
        content: '可以的！经期洗头洗澡是完全正常的。建议用温水，洗完后及时吹干头发，避免着凉。洗澡建议选择淋浴，避免盆浴或泡澡。'
      },
      {
        id: '8',
        title: '经期饮食要注意什么？',
        content: '建议多吃富含铁、蛋白质和维生素的食物，如瘦肉、鸡蛋、牛奶、豆制品等。避免生冷、辛辣的食物。可以适当喝些红糖姜茶或热水。'
      },
      {
        id: '9',
        title: '经期可以运动吗？',
        content: '可以进行适度的运动，如散步、瑜伽等轻度活动。适度运动有助于缓解痛经和改善情绪。但要避免剧烈运动，如跑步、游泳等。'
      },
      {
        id: '10',
        title: '经期如何缓解不适？',
        content: '可以尝试以下方法缓解经期不适：喝热水或红糖姜茶、用热水袋敷肚子、适度休息、做一些舒缓的拉伸。保持心情愉快也很重要。'
      }
    ]
  },
  {
    title: '初潮相关知识',
    icon: '🎉',
    items: [
      {
        id: '11',
        title: '什么是初潮？',
        content: '初潮就是第一次来月经，是女孩进入青春期的重要标志。通常发生在12-14岁左右，但早到10岁或晚到16岁都属于正常范围。'
      },
      {
        id: '12',
        title: '初潮来了怎么办？',
        content: '首先不要慌张，这是身体发育的正常现象。告诉妈妈或信任的女性长辈，她们会帮助你准备好卫生巾，并告诉你如何使用。保持冷静，这说明你长大了！'
      },
      {
        id: '13',
        title: '初潮前有什么征兆？',
        content: '乳房发育、身高快速增长、出现白带等，都是初潮即将到来的信号。当出现褐色分泌物或少量出血时，可能就是初潮要来了。'
      },
      {
        id: '14',
        title: '初潮后周期不规律正常吗？',
        content: '非常正常！初潮后的1-2年内，月经周期不规律是很常见的，因为身体的内分泌系统还在建立和调整中。随着身体逐渐成熟，周期会变得规律。'
      },
      {
        id: '15',
        title: '初潮来了意味着什么？',
        content: '初潮标志着你进入了青春期，身体正在发育成为一个成熟的女性。这是一个自然而美好的过程，说明你的身体很健康。'
      }
    ]
  },
  {
    title: '异常情况判断',
    icon: '⚠️',
    items: [
      {
        id: '16',
        title: '哪些情况需要告诉妈妈？',
        content: '如果出现以下情况，一定要告诉妈妈：1. 月经周期小于21天或大于35天，持续超过半年；2. 经期超过7天还没干净；3. 经血过多，每小时都需要换卫生巾；4. 严重的痛经，影响正常生活；5. 非经期出血。'
      },
      {
        id: '17',
        title: '痛经怎么办？',
        content: '轻微的痛经是正常的。可以尝试：喝热水或红糖姜茶、用热水袋敷肚子、适度休息、做一些舒缓的拉伸。如果痛经非常严重，一定要告诉妈妈，可能需要看医生。'
      },
      {
        id: '18',
        title: '什么时候需要去看医生？',
        content: '如果出现以下情况，建议去看妇科医生：1. 16岁还没来月经；2. 月经周期长期不规律超过1年；3. 严重痛经无法忍受；4. 经血过多或经期过长；5. 非经期不规则出血；6. 伴有剧烈腹痛、头晕、乏力等症状。'
      },
      {
        id: '19',
        title: '哪些情况可以先观察？',
        content: '以下情况通常是正常的，可以先观察：1. 初潮后1-2年内周期不规律；2. 轻微的腰酸腹胀；3. 经期偶尔提前或推后几天；4. 少量的褐色分泌物；5. 轻微的情绪波动。'
      },
      {
        id: '20',
        title: '月经突然不来了怎么办？',
        content: '如果月经突然停止，首先不要慌张。可能的原因包括压力、体重变化、运动过度等。如果停经超过3个月，或者伴有其他不适，建议告诉妈妈并咨询医生。'
      }
    ]
  },
  {
    title: '青春期生理变化',
    icon: '🌟',
    items: [
      {
        id: '21',
        title: '青春期身体会有哪些变化？',
        content: '除了月经，青春期身体还会发生很多变化：1. 身高和体重快速增长；2. 乳房发育；3. 阴毛和腋毛生长；4. 体型变得更加曲线优美；5. 汗腺分泌增多。这些都是正常的生理发育过程。'
      },
      {
        id: '22',
        title: '如何正确看待身体变化？',
        content: '身体的这些变化是成长的标志，说明你正在从女孩成长为少女。要坦然接受自己的身体变化，不要害羞或自卑。每个女孩的发育节奏都不同，这都是正常的。'
      },
      {
        id: '23',
        title: '如何做好青春期卫生？',
        content: '青春期要特别注意个人卫生：1. 每天用温水清洗外阴；2. 勤换内裤，保持干爽；3. 月经期间勤换卫生巾；4. 避免使用刺激性的洗液；5. 洗澡时尽量选择淋浴。'
      },
      {
        id: '24',
        title: '乳房发育需要注意什么？',
        content: '乳房发育是青春期的正常现象。要选择合适的内衣，避免过紧或过松。注意乳房卫生，如果出现疼痛、红肿等异常情况，要及时告诉妈妈。'
      },
      {
        id: '25',
        title: '青春期情绪波动正常吗？',
        content: '非常正常！青春期激素水平变化较大，情绪波动是常见现象。要学会调节情绪，可以和家人朋友沟通，做一些自己喜欢的事情来缓解压力。'
      }
    ]
  },
  {
    title: '健康生活建议',
    icon: '🌼',
    items: [
      {
        id: '26',
        title: '如何保持月经规律？',
        content: '保持健康的生活方式有助于维持规律的月经：1. 保持均衡饮食；2. 保证充足睡眠；3. 适度运动；4. 学会管理压力；5. 避免过度节食或暴饮暴食。'
      },
      {
        id: '27',
        title: '月经期间如何管理情绪？',
        content: '月经期间情绪波动是正常的，可以尝试：1. 做一些放松的活动；2. 和朋友家人聊天；3. 听舒缓的音乐；4. 保持积极的心态；5. 给自己一些独处的时间。'
      },
      {
        id: '28',
        title: '如何正确使用卫生巾？',
        content: '使用卫生巾时要注意：1. 洗手后再打开包装；2. 及时更换，避免长时间不换；3. 更换后将用过的卫生巾包好再丢弃；4. 选择适合自己的型号；5. 注意卫生巾的保质期。'
      },
      {
        id: '29',
        title: '月经会影响学习和生活吗？',
        content: '正常情况下，月经不会影响学习和生活。但每个人的体质不同，可能会有轻微不适。做好准备，保持良好心态，完全可以正常学习和生活。'
      },
      {
        id: '30',
        title: '月经期间可以游泳或上体育课吗？',
        content: '月经期间可以上体育课，但建议避免剧烈运动。如果需要游泳，可以使用卫生棉条或月经杯。如果身体不适，可以向老师说明情况。'
      }
    ]
  }
];

interface PeriodKnowledgeProps {
  onBack: () => void;
}

export default function PeriodKnowledge({ onBack }: PeriodKnowledgeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleBack = () => {
    onBack();
  };

  return (
    <div className="knowledge-page">
      <div className="knowledge-header">
        <button className="back-btn" onClick={handleBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1>月经小知识</h1>
        <div className="placeholder" />
      </div>

      <div className="knowledge-content">
        {knowledgeData.map((section) => (
          <div key={section.title} className="knowledge-section">
            <div className="section-header">
              <span className="section-icon">{section.icon}</span>
              <h2 className="section-title">{section.title}</h2>
            </div>
            <div className="section-items">
              {section.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`knowledge-item ${expandedItems.has(item.id) ? 'expanded' : ''}`}
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="item-header">
                    <span className="item-title">{item.title}</span>
                    <svg 
                      className={`expand-icon ${expandedItems.has(item.id) ? 'rotated' : ''}`} 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <path d="M6 9h12M12 15l-6-6 6-6" />
                    </svg>
                  </div>
                  {expandedItems.has(item.id) && (
                    <div className="item-content">
                      {item.content.split('；').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="knowledge-footer">
        <p>关爱自己，从了解开始 💖</p>
      </div>
    </div>
  );
}
