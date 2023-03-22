export interface BlockState {
  x: number // x轴坐标
  y: number // y轴坐标
  reveoled: boolean // 是否打开
  mine: boolean // 是否地雷
  flagged: boolean // 是否添加旗帜
  adjacentMines: number // 周围8格地雷数
}
