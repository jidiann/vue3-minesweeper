<script setup lang='ts'>
import type { BlockState } from '~/type'
import { isDev } from '~/composables'

defineProps<{ block: BlockState }>()

// 字体颜色
const numberColors = [
  'text-transparent',
  'text-gray-500',
  'text-green-500',
  'text-blue-500',
  'text-yellow-500',
  'text-orange-500',
  'text-pink-500',
  'text-teal-500',
  'text-red-500',
]

// 决定块样式
function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.reveoled)
    return 'bg-gray-500/10 hover:bg-gray-500/20'

  return block.mine ? 'bg-red/50 ' : numberColors[block.adjacentMines]
}
</script>

<template>
  <button
    flex="~"
    items-center justify-center
    min-w-10 min-h-10
    border="1 gray-400/10"
    :class="getBlockClass(block)"
  >
    <template v-if="block.flagged">
      <div i-mdi:flag text-red />
    </template>
    <template v-else-if="block.reveoled || isDev">
      <div v-if="block.mine" i-mdi:mine />
      <div v-else font-600>
        {{ block.adjacentMines }}
      </div>
    </template>
  </button>
</template>

<style scoped>

</style>
