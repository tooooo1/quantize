import { useState, useRef, useEffect } from 'react';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import ExperimentLayout from '../layout/ExperimentLayout';
import { Path, Point } from '../../types';
import { motion } from 'framer-motion';
import { generateRandomPath, getOptimalPath, calculatePoints } from '../../lib/feynman';

const DEFAULT_PATH_COUNT = 10;
const MAX_PATH_COUNT = 50;
const MIN_PATH_COUNT = 5;
const PATH_COUNT_STEP = 5;

const MIN_DEVIATION = 0;
const MAX_DEVIATION = 200;
const DEVIATION_STEP = 5;
const DEFAULT_DEVIATION = 50;

const ANIMATION_FPS = 6;
const PATH_SEGMENTS = 5;
const PATH_INTERPOLATION_FACTOR = 0.3;

export const FeynmanPath = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const pointsRef = useRef<{ startPoint: Point; endPoint: Point }>({
    startPoint: { x: 100, y: 300 },
    endPoint: { x: 700, y: 300 },
  });

  const [pathCount, setPathCount] = useState(DEFAULT_PATH_COUNT);
  const [deviation, setDeviation] = useState(DEFAULT_DEVIATION);
  const [isRunning, setIsRunning] = useState(false);
  const [showOptimal, setShowOptimal] = useState(true);

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const devicePixelRatio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(devicePixelRatio, devicePixelRatio);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }

    pointsRef.current = calculatePoints(rect.width, rect.height);
    return canvas;
  };

  const generatePaths = (): Path[] => {
    const canvas = setupCanvas();
    if (!canvas) return [];

    const { startPoint, endPoint } = pointsRef.current;
    const paths = Array.from({ length: pathCount }, () =>
      generateRandomPath(startPoint, endPoint, PATH_SEGMENTS, deviation)
    );

    draw(paths);
    return paths;
  };

  const draw = (currentPaths: Path[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const { startPoint, endPoint } = pointsRef.current;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, rect.width, rect.height);

    currentPaths.forEach(path => {
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      path.points.slice(1).forEach(point => {
        ctx.lineTo(point.x, point.y);
      });

      const hue = Math.floor(((path.phase * 180) / Math.PI) % 360);
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.3)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    if (showOptimal) {
      const optimalPath = getOptimalPath(startPoint, endPoint);

      ctx.shadowColor = '#0ea5e9';
      ctx.shadowBlur = 15;

      ctx.beginPath();
      ctx.moveTo(optimalPath.points[0].x, optimalPath.points[0].y);
      ctx.lineTo(optimalPath.points[1].x, optimalPath.points[1].y);

      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(startPoint.x, startPoint.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#5eead4';
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const toggleAnimation = () => (isRunning ? stopAnimation() : startAnimation());

  const startAnimation = () => {
    setIsRunning(true);

    let lastTime = 0;
    const interval = 1000 / ANIMATION_FPS;

    let currentPaths = generatePaths();
    let prevPaths = [...currentPaths];

    const animate = (timestamp: number) => {
      if (timestamp - lastTime < interval) {
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      lastTime = timestamp;

      const { startPoint, endPoint } = pointsRef.current;

      const newPaths = Array.from({ length: pathCount }, () =>
        generateRandomPath(startPoint, endPoint, PATH_SEGMENTS, deviation)
      );

      const animatedPaths = newPaths.map((path, i) => {
        if (i < prevPaths.length) {
          const animatedPoints = path.points.map((point, pointIndex) => {
            if (pointIndex < prevPaths[i].points.length) {
              const prevPoint = prevPaths[i].points[pointIndex];
              return {
                x:
                  prevPoint.x * PATH_INTERPOLATION_FACTOR +
                  point.x * (1 - PATH_INTERPOLATION_FACTOR),
                y:
                  prevPoint.y * PATH_INTERPOLATION_FACTOR +
                  point.y * (1 - PATH_INTERPOLATION_FACTOR),
              };
            }
            return point;
          });

          return { ...path, points: animatedPoints };
        }
        return path;
      });

      prevPaths = [...newPaths];
      currentPaths = animatedPaths;

      draw(animatedPaths);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsRunning(false);
    cancelAnimationFrame(animRef.current);
  };

  useEffect(() => {
    startAnimation();

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
      if (isRunning) {
        stopAnimation();
        startAnimation();
      } else {
        generatePaths();
      }
    });

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      stopAnimation();
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      generatePaths();
    }
  }, [deviation, pathCount, showOptimal]);

  const controls = (
    <div className="flex flex-col space-y-8">
      <motion.div
        className="grid grid-cols-1 gap-8 sm:grid-cols-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4 rounded-md bg-[#0f0f0f] p-4">
          <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
            <Label className="text-sm font-medium text-white sm:text-base">경로 수</Label>
            <motion.span
              key={pathCount}
              className="rounded-md bg-[#1a1a1a] px-3 py-1 text-sm text-white"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              {pathCount}
            </motion.span>
          </div>
          <Slider
            value={[pathCount]}
            min={MIN_PATH_COUNT}
            max={MAX_PATH_COUNT}
            step={PATH_COUNT_STEP}
            onValueChange={v => setPathCount(v[0])}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-4 rounded-md bg-[#0f0f0f] p-4">
          <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
            <Label className="text-sm font-medium text-white sm:text-base">무작위성</Label>
            <motion.span
              key={deviation}
              className="rounded-md bg-[#1a1a1a] px-3 py-1 text-sm text-white"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              {deviation}
            </motion.span>
          </div>
          <Slider
            value={[deviation]}
            min={MIN_DEVIATION}
            max={MAX_DEVIATION}
            step={DEVIATION_STEP}
            onValueChange={v => setDeviation(v[0])}
            disabled={isRunning}
          />
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col items-stretch gap-4 rounded-md bg-[#0f0f0f] p-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Checkbox
            id="showOptimal"
            checked={showOptimal}
            onCheckedChange={checked => setShowOptimal(!!checked)}
            className="checkbox size-5"
          />
          <Label htmlFor="showOptimal" className="text-sm text-white">
            최적경로 표시
          </Label>
        </div>

        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={toggleAnimation}
              className="w-full bg-[#0ea5e9] px-6 py-2 text-sm font-medium text-white hover:bg-[#0ea5e9]/90 sm:w-auto"
            >
              {isRunning ? '정지' : '시작'}
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => !isRunning && generatePaths()}
              variant="outline"
              className="w-full border-[#1a1a1a] bg-[#111111] px-6 py-2 text-sm font-medium text-white hover:bg-[#1a1a1a] sm:w-auto"
              disabled={isRunning}
            >
              재생성
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <ExperimentLayout
      title="파인만 경로 적분"
      description="양자역학에서 모든 입자는 동시에 가능한 모든 경로를 탐색합니다."
      controls={controls}
    >
      <motion.div
        className="h-full w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <canvas ref={canvasRef} className="h-full w-full" />
      </motion.div>
    </ExperimentLayout>
  );
};
