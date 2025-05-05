import { Path, Point } from '@/types';

/**
 * 작용량 계산 (S = ∫(T-V)dt)
 * 간단한 모델에서는 거리 제곱에 비례한다고 가정
 */
export const calculateAction = (points: Point[]): number => {
  if (points.length < 2) return 0;

  return points.reduce((total, point, i) => {
    if (i === 0) return 0;

    const dx = point.x - points[i - 1].x;
    const dy = point.y - points[i - 1].y;
    const distanceSquared = dx * dx + dy * dy;

    return total + distanceSquared;
  }, 0);
};

/**
 * 위상 계산 (phase = action / ħ)
 */
export const calculatePhase = (action: number): number => {
  const PLANCK_CONSTANT = 0.5; // 시각적 효과를 위한 스케일링 상수
  return (action / PLANCK_CONSTANT) % (2 * Math.PI);
};

/**
 * 경로의 위상에 따른 컬러 계산
 */
export const getPhaseColor = (phase: number): string => {
  const hue = ((phase * 180) / Math.PI) % 360;
  return `hsl(${hue}, 80%, 60%)`;
};

/**
 * HSL 색상을 RGB로 변환
 */
export const hslToRgb = (hex: string) => {
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
 * 두 경로 간 간섭 계산 (-1:상쇄 ~ 1:보강)
 */
export const calculateInterference = (phase1: number, phase2: number): number => {
  const phaseDifference = Math.abs(phase1 - phase2) % (2 * Math.PI);

  // 위상 차이가 0(또는 2π)에 가까우면 보강 간섭 (+1)
  if (phaseDifference < 0.1 || phaseDifference > 2 * Math.PI - 0.1) return 1;

  // 위상 차이가 π에 가까우면 상쇄 간섭 (-1)
  if (Math.abs(phaseDifference - Math.PI) < 0.1) return -1;

  // 그 외 중간 값
  return Math.cos(phaseDifference);
};

/**
 * 랜덤 경로 생성 함수
 */
export const generateRandomPath = (
  start: Point,
  end: Point,
  segmentCount: number,
  randomFactor: number
): Path => {
  // 시작점으로 경로 배열 초기화
  const points = [start];

  // 중간 포인트 생성
  for (let i = 1; i <= segmentCount; i++) {
    const ratio = i / (segmentCount + 1);
    const baseX = start.x + (end.x - start.x) * ratio;
    const baseY = start.y + (end.y - start.y) * ratio;

    // 무작위 편차 추가
    const offsetX = (Math.random() * 2 - 1) * randomFactor;
    const offsetY = (Math.random() * 2 - 1) * randomFactor;

    points.push({ x: baseX + offsetX, y: baseY + offsetY });
  }

  // 종료점 추가
  points.push(end);

  const action = calculateAction(points);
  const phase = calculatePhase(action);

  // 고유 ID 생성 대신 UUID 로직 사용
  return {
    id: Math.random().toString(36).substring(2, 11),
    points,
    action,
    phase,
  };
};

/**
 * 최적 경로 계산 (직선 경로)
 */
export const getOptimalPath = (start: Point, end: Point): Path => {
  const points = [start, end];
  const action = calculateAction(points);
  const phase = calculatePhase(action);

  return {
    id: 'optimal',
    points,
    action,
    phase,
  };
};

/**
 * 캔버스 그리드 그리기
 */
export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize = 40
) => {
  ctx.strokeStyle = 'var(--color-grid)';
  ctx.lineWidth = 1;

  // 수직 그리드
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 수평 그리드
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

/**
 * 경로 포인트 계산 (화면 크기에 맞게)
 */
export const calculatePoints = (
  canvasWidth: number,
  canvasHeight: number
): { startPoint: Point; endPoint: Point } => {
  const padding = Math.min(canvasWidth * 0.1, 100); // 화면 가장자리로부터의 여백

  return {
    startPoint: { x: padding, y: canvasHeight / 2 },
    endPoint: { x: canvasWidth - padding, y: canvasHeight / 2 },
  };
};
