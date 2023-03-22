import type { BlockState } from '~/type'

// 方向
const directions = [
  [1, 1],
  [1, 0],
  [0, 1],
  [0, -1],
  [-1, 0],
  [1, -1],
  [-1, 1],
  [-1, -1],
]

interface GameState {
  mineGenerated: boolean // 是否初始化炸弹
  gameState: 'play' | 'win' | 'lost' // 是否游戏结束
  board: BlockState[][] // 初始化棋盘
}

export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(
    public width: number,
    public height: number,
  ) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  // 重置
  reset(borderSize?: number) {
    if (borderSize) {
      this.width = borderSize
      this.height = borderSize
    }
    this.state.value = {
      mineGenerated: false,
      gameState: 'play',
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width },
          (_, x): BlockState => ({
            x,
            y,
            reveoled: false,
            mine: false,
            flagged: false,
            adjacentMines: 0,
          }),
        )),
    }
  }

  // 生成炸弹
  generateMines(initial: BlockState) {
    this.board.forEach(row =>
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
    this.board.forEach(row =>
      row.forEach((block) => {
        if (block.mine)
          return

        this.getSiblings(block)
          .forEach((b) => {
            if (b.mine)
              block.adjacentMines += 1
          })
      }),
    )
  }

  // 获取边界
  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy

      if (x2 < 0 || x2 >= this.height || y2 < 0 || y2 >= this.width)
        return undefined

      return this.board[y2][x2]
    })
      .filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.board.flat().forEach((i) => {
      if (i.mine)
        i.reveoled = true
    })
  }

  // 左键点击事件
  blockClick(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return

    if (block.flagged)
      return

    if (!this.state.value.mineGenerated) {
      this.generateMines(block)
      this.state.value.mineGenerated = true
    }

    block.reveoled = true

    if (block.mine) {
      this.state.value.gameState = 'lost'
      this.showAllMines()
      return
    }
    else { this.checkGameState() }

    this.expendZero(block)
  }

  // 插旗
  blockFlag(block: BlockState) {
    if (this.state.value.gameState !== 'play')
      return

    if (block.reveoled)
      return

    block.flagged = !block.flagged

    this.checkGameState()
  }

  // 监控游戏状态
  checkGameState() {
    if (!this.state.value.mineGenerated)
      return
    const blocks = this.board.flat()

    if (blocks.every(block => block.reveoled || block.flagged)) {
      if (this.state.value.gameState !== 'play')
        return
      if (blocks.some(block => block.flagged && !block.mine)) {
        this.state.value.gameState = 'lost'
        this.showAllMines()
        alert('lost')
      }
      else {
        this.state.value.gameState = 'win'
        alert('win')
      }
    }
  }
}
