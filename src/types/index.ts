export type Point = {
  x: number;
  y: number;
};

export type Path = {
  id: string;
  points: Point[];
  phase: number; // 위상
  action: number; // 작용량
};
