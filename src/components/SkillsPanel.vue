<script setup lang="ts">
import { dungeonStoreToRefs, type Skill } from '@/stores/useDungeon'

const emit = defineEmits<{
  (e: 'useSkill', skill: Skill): void
}>()

const { skills, mana, maxMana } = dungeonStoreToRefs()

const handleSkillClick = (skill: Skill) => {
  if (skill.currentCooldown > 0) return
  if (mana.value < skill.manaCost) return
  if (skill.charges !== undefined && skill.charges <= 0) return

  emit('useSkill', skill)
}

const isSkillDisabled = (skill: Skill) => {
  return skill.currentCooldown > 0 ||
    mana.value < skill.manaCost ||
    (skill.charges !== undefined && skill.charges <= 0)
}
</script>

<template>
  <div class="skills-panel">
    <div class="mana-bar">
      <div class="mana-fill" :style="{ width: `${(mana / maxMana) * 100}%` }"></div>
      <span class="mana-text">MP: {{ mana }}/{{ maxMana }}</span>
    </div>

    <div class="skills-grid">
      <button
        v-for="skill in skills"
        :key="skill.id"
        class="skill-btn nes-btn"
        :class="{
          'is-disabled': isSkillDisabled(skill),
          'is-primary': !isSkillDisabled(skill),
        }"
        :disabled="isSkillDisabled(skill)"
        :title="`${skill.name}: ${skill.description}\nCost: ${skill.manaCost} MP`"
        @click="handleSkillClick(skill)"
      >
        <span class="skill-emoji">{{ skill.emoji }}</span>
        <span class="skill-name">{{ skill.name }}</span>
        <span v-if="skill.currentCooldown > 0" class="cooldown-overlay">
          {{ skill.currentCooldown }}
        </span>
        <span v-if="skill.charges !== undefined" class="skill-charges">
          x{{ skill.charges }}
        </span>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skills-panel {
  @apply flex flex-col gap-2;
}

.mana-bar {
  @apply relative w-full h-5 bg-gray-800 border-2 border-white;
  border-radius: 2px;
}

.mana-fill {
  @apply h-full transition-all duration-300;
  background: linear-gradient(to right, #0066cc, #00aaff);
}

.mana-text {
  @apply absolute inset-0 flex items-center justify-center text-xs text-white;
  text-shadow: 1px 1px 0 #000;
}

.skills-grid {
  @apply flex flex-wrap gap-2 justify-center;
}

.skill-btn {
  @apply relative flex flex-col items-center justify-center;
  @apply w-16 h-16 p-1;
  font-size: 8px;

  &.is-disabled {
    @apply opacity-60;
  }
}

.skill-emoji {
  @apply text-xl mb-1;
}

.skill-name {
  @apply text-[8px] leading-tight;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.cooldown-overlay {
  @apply absolute inset-0 flex items-center justify-center;
  @apply bg-black bg-opacity-70 text-white text-xl font-bold;
}

.skill-charges {
  @apply absolute bottom-0 right-0 text-[10px] bg-yellow-500 text-black px-1;
  border-radius: 2px;
}
</style>
