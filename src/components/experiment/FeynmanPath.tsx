import { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import ExperimentLayout from '@/components/layout/ExperimentLayout';
import { Path, Point } from '@/types';

const DEFAULT_PATH_COUNT = 50;
const MAX_PATH_COUNT = 500;

/**
 * 위상에 따른 색상 계산
 */
const getPhaseColor = (phase: number) => {
  const hue = (phase * 360) % 360;
  return `hsl(${hue}, 80%, 60%)`;
};

/**
 * HSL 색상을 RGB로 변환
 */
const hslToRgb = (hex: string) => {
  // hsl 문자열에서 숫자만 추출
  const hslRegex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
  const match = hex.match(hslRegex);

  if (!match) return { r: 255, g: 255, b: 255 }; // 기본값

  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;

  // HSL → RGB 변환
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

/**
 * 작용량 계산 (간단한 근사)
 */
const calculateAction = (points: Point[]) => {
  return points.reduce((action, point, i) => {
    if (i === 0) return 0;

    const dx = point.x - points[i - 1].x;
    const dy = point.y - points[i - 1].y;

    // 거리 제곱 (운동에너지 근사)
    return action + dx * dx + dy * dy;
  }, 0);
};

/**
 * 랜덤 경로 생성
 */
const generateRandomPath = (start: Point, end: Point, deviation: number, id: string): Path => {
  const points = [start];
  const midPoints = 5;

  // 중간 포인트 생성
  for (let i = 1; i <= midPoints; i++) {
    const ratio = i / (midPoints + 1);
    const baseX = start.x + (end.x - start.x) * ratio;
    const baseY = start.y + (end.y - start.y) * ratio;

    points.push({
      x: baseX + (Math.random() * 2 - 1) * deviation,
      y: baseY + (Math.random() * 2 - 1) * deviation,
    });
  }

  points.push(end);

  const action = calculateAction(points);
  const phase = action % (2 * Math.PI);

  return { id, points, action, phase };
};

/**
 * 최적 경로 계산 (직선 경로)
 */
const getOptimalPath = (start: Point, end: Point): Path => {
  const points = [start, end];
  const action = calculateAction(points);

  return {
    id: 'optimal',
    points,
    action,
    phase: action % (2 * Math.PI),
  };
};

const FeynmanPath = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  // 상태 관리
  const [paths, setPaths] = useState<Path[]>([]);
  const [pathCount, setPathCount] = useState(DEFAULT_PATH_COUNT);
  const [deviation, setDeviation] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [showOptimal, setShowOptimal] = useState(true);

  // 시작점과 끝점 (고정)
  const startPoint = { x: 100, y: 300 };
  const endPoint = { x: 700, y: 300 };

  // 경로 생성
  const generatePaths = () => {
    const newPaths = Array.from({ length: pathCount }, (_, i) =>
      generateRandomPath(startPoint, endPoint, deviation, `path-${i}`)
    );

    setPaths(newPaths);

    // 경로 생성 후 바로 그리기
    requestAnimationFrame(() => draw(newPaths));
  };

  // 캔버스 그리기
  const draw = (currentPaths = paths) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // 배경 그리기
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 그리드 패턴
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
    ctx.lineWidth = 1;

    // 수직 그리드
    for (let x = 0; x <= canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // 수평 그리드
    for (let y = 0; y <= canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 경로 그리기
    currentPaths.forEach(path => {
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      path.points.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });

      const color = getPhaseColor(path.phase);
      const rgb = hslToRgb(color);
      ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 최적 경로 그리기
    if (showOptimal) {
      const optimalPath = getOptimalPath(startPoint, endPoint);

      // 글로우 효과
      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.moveTo(optimalPath.points[0].x, optimalPath.points[0].y);
      ctx.lineTo(optimalPath.points[1].x, optimalPath.points[1].y);

      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 글로우 효과 제거
      ctx.shadowBlur = 0;
    }

    // 시작점과 끝점 그리기
    // 시작점 (청록색 그라데이션)
    const startGradient = ctx.createRadialGradient(
      startPoint.x,
      startPoint.y,
      0,
      startPoint.x,
      startPoint.y,
      20
    );
    startGradient.addColorStop(0, '#0ea5e9');
    startGradient.addColorStop(1, 'rgba(14, 165, 233, 0)');

    ctx.fillStyle = startGradient;
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0ea5e9';
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // 끝점 (에메랄드 그라데이션)
    const endGradient = ctx.createRadialGradient(
      endPoint.x,
      endPoint.y,
      0,
      endPoint.x,
      endPoint.y,
      20
    );
    endGradient.addColorStop(0, '#14b8a6');
    endGradient.addColorStop(1, 'rgba(20, 184, 166, 0)');

    ctx.fillStyle = endGradient;
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#14b8a6';
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  // 애니메이션 관련 함수
  const toggleAnimation = () => {
    if (isRunning) {
      stopAnimation();
    } else {
      startAnimation();
    }
  };

  const startAnimation = () => {
    setIsRunning(true);

    const animate = () => {
      generatePaths();
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsRunning(false);
    cancelAnimationFrame(animRef.current);
  };

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    generatePaths();

    // 윈도우 리사이즈 시 다시 그리기
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  // 설정이 변경될 때 경로 다시 생성
  useEffect(() => {
    if (!isRunning) {
      generatePaths();
    }
  }, [deviation, pathCount, showOptimal]);

  // UI 컨트롤
  const controls = (
    <div className="flex flex-col gap-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">경로 수</label>
            <span className="text-muted-foreground text-sm">{pathCount}</span>
          </div>
          <Slider
            value={[pathCount]}
            min={10}
            max={MAX_PATH_COUNT}
            step={1}
            onValueChange={v => setPathCount(v[0])}
            className="py-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">무작위성 정도</label>
            <span className="text-muted-foreground text-sm">{deviation}</span>
          </div>
          <Slider
            value={[deviation]}
            min={0}
            max={200}
            step={1}
            onValueChange={v => setDeviation(v[0])}
            className="py-1"
          />
        </div>

        <div className="flex items-center gap-2 rounded-md bg-gray-900/50 p-2">
          <input
            type="checkbox"
            id="showOptimal"
            checked={showOptimal}
            onChange={e => setShowOptimal(e.target.checked)}
            className="focus:ring-opacity-25 h-4 w-4 rounded border-gray-700 text-blue-500 focus:ring-blue-400"
          />
          <label htmlFor="showOptimal" className="text-sm">
            최적 경로 표시
          </label>
        </div>

        <div className="space-y-2">
          <Button
            onClick={toggleAnimation}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:from-blue-600 hover:to-cyan-600"
          >
            {isRunning ? '애니메이션 정지' : '애니메이션 시작'}
          </Button>

          <Button onClick={generatePaths} className="w-full" variant="outline">
            경로 재생성
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <ExperimentLayout
      title="파인만 경로 적분"
      description="양자역학에서 모든 입자는 동시에 가능한 모든 경로를 탐색합니다."
      controls={controls}
    >
      <canvas ref={canvasRef} className="h-full w-full bg-gray-950" />
    </ExperimentLayout>
  );
};

export default FeynmanPath;
