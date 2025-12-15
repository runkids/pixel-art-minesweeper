<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePixelAnimation, type Particle } from '@/composable/usePixelAnimation'

const props = defineProps<{
  containerRef?: HTMLElement | null
}>()

const {
  particles,
  effects,
  isShaking,
  shakeIntensity,
  updateParticles,
  cleanupEffects,
} = usePixelAnimation()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrame: number | null = null
let ctx: CanvasRenderingContext2D | null = null

// Animation loop
const animate = () => {
  if (!ctx || !canvasRef.value) return

  // Clear canvas
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)

  // Draw particles
  particles.value.forEach((particle: Particle) => {
    const alpha = particle.life / particle.maxLife
    ctx!.globalAlpha = alpha
    ctx!.fillStyle = particle.color

    // Pixel art style - draw as small squares
    const size = Math.floor(particle.size * alpha)
    ctx!.fillRect(
      Math.floor(particle.x - size / 2),
      Math.floor(particle.y - size / 2),
      size,
      size
    )
  })

  ctx.globalAlpha = 1

  // Update particles
  updateParticles()
  cleanupEffects()

  // Continue animation if there are particles
  if (particles.value.length > 0 || effects.value.length > 0) {
    animationFrame = requestAnimationFrame(animate)
  } else {
    animationFrame = null
  }
}

// Start animation when particles are added
const startAnimation = () => {
  if (!animationFrame) {
    animationFrame = requestAnimationFrame(animate)
  }
}

// Resize canvas to match container
const resizeCanvas = () => {
  if (!canvasRef.value) return
  const container = props.containerRef || document.body
  canvasRef.value.width = container.clientWidth || window.innerWidth
  canvasRef.value.height = container.clientHeight || window.innerHeight
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  window.removeEventListener('resize', resizeCanvas)
})

// Expose methods for parent components
defineExpose({
  startAnimation,
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="particle-canvas"
    :class="{ 'shake': isShaking }"
    :style="{ '--shake-intensity': `${shakeIntensity}px` }"
  />

  <!-- Effect overlays -->
  <div v-for="effect in effects" :key="effect.id" class="effect-overlay">
    <!-- Explosion flash -->
    <div
      v-if="effect.type === 'explosion'"
      class="explosion-flash"
      :style="{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
      }"
    />

    <!-- Victory sparkles -->
    <div
      v-if="effect.type === 'victory'"
      class="victory-overlay"
    />

    <!-- Level up effect -->
    <div
      v-if="effect.type === 'levelUp'"
      class="level-up-effect"
      :style="{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
      }"
    >
      <span class="level-up-text">LEVEL UP!</span>
    </div>

    <!-- Treasure sparkle -->
    <div
      v-if="effect.type === 'treasure'"
      class="treasure-effect"
      :style="{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
      }"
    />

    <!-- Damage flash -->
    <div
      v-if="effect.type === 'damage'"
      class="damage-flash"
    />

    <!-- Heal effect -->
    <div
      v-if="effect.type === 'heal'"
      class="heal-effect"
      :style="{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
      }"
    >
      <span class="heal-text">+HP</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 100;

  &.shake {
    animation: shake 0.1s linear infinite;
  }
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(var(--shake-intensity), var(--shake-intensity)); }
  50% { transform: translate(calc(var(--shake-intensity) * -1), var(--shake-intensity)); }
  75% { transform: translate(var(--shake-intensity), calc(var(--shake-intensity) * -1)); }
}

.effect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99;
}

.explosion-flash {
  position: absolute;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 200, 0, 0.8) 0%, rgba(255, 100, 0, 0.4) 50%, transparent 70%);
  border-radius: 50%;
  animation: explode 0.5s ease-out forwards;
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(3);
    opacity: 0;
  }
}

.victory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    rgba(255, 215, 0, 0.1) 0%,
    rgba(255, 215, 0, 0.2) 50%,
    rgba(255, 215, 0, 0.1) 100%
  );
  animation: victory-pulse 0.5s ease-in-out infinite alternate;
}

@keyframes victory-pulse {
  0% { opacity: 0.3; }
  100% { opacity: 0.6; }
}

.level-up-effect {
  position: absolute;
  transform: translate(-50%, -50%);
}

.level-up-text {
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
  text-shadow:
    2px 2px 0 #000,
    -2px -2px 0 #000,
    2px -2px 0 #000,
    -2px 2px 0 #000;
  animation: level-up-bounce 1.5s ease-out forwards;
}

@keyframes level-up-bounce {
  0% {
    transform: translateY(0) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
  40% {
    transform: translateY(-10px) scale(1);
  }
  60% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(-50px);
    opacity: 0;
  }
}

.treasure-effect {
  position: absolute;
  width: 40px;
  height: 40px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 215, 0, 0) 70%);
  animation: treasure-sparkle 0.8s ease-out forwards;
}

@keyframes treasure-sparkle {
  0% {
    transform: translate(-50%, -50%) scale(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2) rotate(180deg);
    opacity: 0;
  }
}

.damage-flash {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 0, 0, 0.3);
  animation: damage-blink 0.3s ease-out forwards;
}

@keyframes damage-blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 0; }
}

.heal-effect {
  position: absolute;
  transform: translate(-50%, -50%);
}

.heal-text {
  font-size: 18px;
  font-weight: bold;
  color: #00FF00;
  text-shadow:
    1px 1px 0 #000,
    -1px -1px 0 #000;
  animation: heal-float 0.6s ease-out forwards;
}

@keyframes heal-float {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-30px);
    opacity: 0;
  }
}
</style>
