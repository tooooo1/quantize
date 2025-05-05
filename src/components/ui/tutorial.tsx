import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem } from './accordion';

const TERMS = {
  양자역학:
    '미시 세계의 입자와 에너지가 어떻게 행동하는지 설명하는 물리학이에요. 고전역학으로는 설명할 수 없는 현상들을 다뤄요.',
  위상: '입자의 파동 성질이 가지는 진행 상태를 나타내는 각도 값이에요. 위상이 같으면 보강간섭, 다르면 상쇄간섭이 일어나요.',
  간섭: '여러 파동이 만나 서로 더해지거나 상쇄되는 현상이에요. 양자역학의 핵심 원리 중 하나예요.',
  '페르마의 원리':
    '빛은 출발점에서 도착점까지 가장 짧은 시간이 걸리는 경로를 선택한다는 원리예요. 이 단순한 원리가 양자역학에서도 중요해요.',
};

const TUTORIAL_STEPS = [
  {
    title: '양자역학 시각화',
    description:
      '양자역학에서는 빛이나 입자가 한 경로로만 가는 것이 아니라, 가능한 모든 경로로 동시에 이동해요.',
    highlight: ['양자역학'],
  },
  {
    title: '경로와 색상',
    description:
      '화면에 보이는 다양한 색상의 선들은 각각 다른 위상을 가진 경로예요. 이 경로들이 서로 간섭하면서 특정 경로만 남게 돼요.',
    highlight: ['위상', '간섭'],
  },
  {
    title: '최적 경로',
    description:
      '파란색 선은 페르마의 원리에 따른 최단 시간 경로예요. 이 경로가 양자역학적으로 가장 확률이 높은 경로로 관측돼요.',
    highlight: ['페르마의 원리'],
  },
  {
    title: '슬라이더 조작',
    description:
      '하단의 슬라이더로 경로의 수와 무작위성을 조절해 볼 수 있어요. 다양한 설정을 시도해보세요.',
    highlight: [],
  },
  {
    title: '직접 경험해보세요',
    description: '이제 직접 슬라이더를 조절하고 애니메이션을 켜서 양자역학의 세계를 경험해보세요.',
    highlight: ['양자역학'],
  },
];

type TutorialProps = {
  onComplete: () => void;
};

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [expandedTerms, setExpandedTerms] = useState<string[]>([]);

  const currentStep = TUTORIAL_STEPS[step];
  const isLastStep = step === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setStep(step + 1);
      setExpandedTerms([]);
    } else {
      setVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    setVisible(false);
    onComplete();
  };

  const handleTermClick = (term: string) => {
    setExpandedTerms(prev =>
      prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]
    );
  };

  const HighlightedDescription = () => {
    if (!currentStep.highlight.length) {
      return <div className="mt-2 text-left text-[#cccccc]">{currentStep.description}</div>;
    }

    const textParts: React.ReactNode[] = [];
    let remainingText = currentStep.description;
    let key = 0;

    currentStep.highlight.forEach(term => {
      const termIndex = remainingText.indexOf(term);
      if (termIndex !== -1) {
        if (termIndex > 0) {
          textParts.push(<span key={key++}>{remainingText.substring(0, termIndex)}</span>);
        }

        textParts.push(
          <span
            key={key++}
            className="cursor-pointer font-bold text-[#38bdf8] underline"
            onClick={() => handleTermClick(term)}
          >
            {term}
          </span>
        );

        remainingText = remainingText.substring(termIndex + term.length);
      }
    });

    if (remainingText) {
      textParts.push(<span key={key++}>{remainingText}</span>);
    }

    return <div className="mt-2 text-left text-[#cccccc]">{textParts}</div>;
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-11/12 max-w-md rounded-lg bg-[#0a0a0a] p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="mb-4 text-left"
            key={`title-${step}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-[#0ea5e9]">{currentStep.title}</h2>

            <HighlightedDescription />

            {currentStep.highlight.length > 0 && (
              <Accordion
                type="multiple"
                value={expandedTerms}
                onValueChange={setExpandedTerms}
                className="w-full"
              >
                {currentStep.highlight.map(term => (
                  <AccordionItem key={term} value={term} className="overflow-hidden border-none">
                    <AccordionContent className="pt-2 text-xs text-[#aaa]">
                      <span className="font-bold text-[#38bdf8]">{term}: </span>
                      {TERMS[term as keyof typeof TERMS]}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </motion.div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handleSkip} className="text-sm">
              건너뛰기
            </Button>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {TUTORIAL_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'inline-block h-2 w-2 rounded-full',
                      i === step ? 'bg-[#0ea5e9]' : 'bg-[#333333]'
                    )}
                  />
                ))}
              </div>
              <Button onClick={handleNext} className="text-sm">
                {!isLastStep ? '다음' : '시작하기'}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
