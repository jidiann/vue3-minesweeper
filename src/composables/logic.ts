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

type GameStatus = 'play' | 'won' | 'lost'

interface GameState {
  mineGenerated: boolean // 是否初始化炸弹
  status: GameStatus // 是否游戏结束
  board: BlockState[][] // 初始化棋盘
  startMS?: number // 开始时间
  endMS?: number // 结束时间
}

export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  get board() {
    return this.state.value?.board
  }

  get blocks() {
    return this.state.value?.board.flat()
  }

  // 重置
  reset(
    width = this.width,
    height = this.height,
    mines = this.mines,
  ) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      mineGenerated: false,
      status: 'play',
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
      startMS: +new Date(),
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  // 生成炸弹
  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]

      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false

      if (block.mine)
        return false

      block.mine = true
      return true
    }

    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        let placed = false
        while (!placed)
          placed = placeRandom()
      })
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
      const x2: number = block.x + dx
      const y2: number = block.y + dy

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
    if (this.state.value.status !== 'play')
      return

    if (block.flagged)
      return

    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }

    block.reveoled = true

    if (block.mine) {
      this.onGameOver('lost')
      this.showAllMines()
      return
    }

    this.expendZero(block)
  }

  // 插旗
  blockFlag(block: BlockState) {
    if (this.state.value.status !== 'play')
      return

    if (block.reveoled)
      return

    block.flagged = !block.flagged
  }

  // 监控游戏状态
  checkGameState() {
    if (!this.state.value.mineGenerated)
      return
    if (this.blocks.every(block => block.reveoled || block.flagged)) {
      if (this.state.value.status !== 'play')
        return
      if (this.blocks.some(block => block.flagged && !block.mine))
        this.onGameOver('lost')
      else
        this.onGameOver('won')
    }
  }

  // 双击自动展开
  autoExpand(block: BlockState) {
    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((a, b) => a + (!b.flagged ? 1 : 0), 0)
    const notRevealed = siblings.reduce((a, b) => a + ((!b.reveoled && !b.flagged) ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.forEach((i) => {
        i.reveoled = true
        if (i.mine)
          this.onGameOver('lost')
      })
    }
    const missingFlags = block.adjacentMines = flags
    if (notRevealed === missingFlags) {
      siblings.forEach((i) => {
        if (!i.reveoled && !i.flagged)
          i.flagged = true
      })
    }
  }

  onGameOver(status: GameStatus) {
    this.state.value.status = status
    this.state.value.endMS = +Date.now()
    if (status === 'lost')
      this.showAllMines()

    setTimeout(() => {
      alert('lost')
    }, 10)
  }
}
