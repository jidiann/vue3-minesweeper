import type { BlockState } from '~/type'

// 方向
const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [-1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
]

export class GamePlay {
  state = ref<BlockState[][]>([]) // 初始化棋盘
  mineGenerated = false // 是否初始化炸弹

  constructor(
    public width: number,
    public height: number,
  ) {
    this.reset()
  }

  // 重置
  reset() {
    this.mineGenerated = false

    this.state.value = Array.from({ length: this.height }, (_, y) =>
      Array.from({ length: this.width },
        (_, x): BlockState => ({
          x,
          y,
          reveoled: false,
          mine: false,
          flagged: false,
          adjacentMines: 0,
        }),
      ),
    )
  }

  // 生成炸弹
  generateMines(initial: BlockState) {
    this.state.value.forEach(row =>
      row.forEach((block) => {
        if (Math.abs(initial.x - block.x) <= 1)
          return
        if (Math.abs(initial.y - block.y) <= 1)
          return
        block.mine = Math.random() < 0.3
      },
      ),
    )
    this.updateNumbers()
  }

  // 自动展开
  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.getSiblings(block)
      .forEach((b) => {
        if (!b.reveoled) {
          b.reveoled = true
          this.expendZero(b)
        }
      })
  }

  // 初始化数字
  updateNumbers() {
    this.state.value.forEach(row =>
      row.forEach((block) => {
        if (block.mine)
          return

        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      },
      ),
    )
  }

  // 获取边界
  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy

      if (x2 < 0 || x2 >= this.height || y2 < 0 || y2 >= this.width)
        return undefined

      return this.state.value[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  // 左键点击事件
  blockClick(block: BlockState) {
    if (block.flagged)
      return

    if (!this.mineGenerated) {
      this.generateMines(block)
      this.mineGenerated = true
    }

    block.reveoled = true

    if (block.mine)
      alert('BOOM!')
    else
      this.checkGameState()

    this.expendZero(block)
  }

  // 插旗
  blockFlag(block: BlockState) {
    if (block.reveoled)
      return

    block.flagged = !block.flagged

    this.checkGameState()
  }

  // 监控游戏状态
  checkGameState() {
    if (!this.mineGenerated)
      return

    const blocks = this.state.value.flat()

    if (blocks.every(block => block.reveoled || block.flagged)) {
      if (blocks.some(block => block.flagged && !block.mine))
        alert('YOU CHEAT!')
      else
        alert('YOU WIN!')
    }
  }
}
