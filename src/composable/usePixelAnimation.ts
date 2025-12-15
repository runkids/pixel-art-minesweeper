import { ref } from 'vue'

export interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  life: number
  maxLife: number
}

export interface AnimationEffect {
  id: number
  type: 'explosion' | 'sparkle' | 'shake' | 'victory' | 'treasure' | 'levelUp' | 'damage' | 'heal'
  x: number
  y: number
  duration: number
  startTime: number
}

// Pixel art color palettes
export const PIXEL_COLORS = {
  explosion: ['#FF4444', '#FF8800', '#FFCC00', '#FF6600', '#FFAA00'],
  sparkle: ['#FFFF00', '#FFFFFF', '#FFD700', '#FFA500'],
  victory: ['#FFD700', '#FFA500', '#FFFF00', '#FFFFFF', '#00FF00'],
  treasure: ['#FFD700', '#C0C0C0', '#B87333', '#E5E4E2'],
  damage: ['#FF0000', '#CC0000', '#990000'],
  heal: ['#00FF00', '#33FF33', '#66FF66', '#00CC00'],
  monster: ['#8B0000', '#4B0082', '#2F4F4F', '#800080'],
}

let particleIdCounter = 0
let effectIdCounter = 0

export function usePixelAnimation() {
  const particles = ref<Particle[]>([])
  const effects = ref<AnimationEffect[]>([])
  const isShaking = ref(false)
  const shakeIntensity = ref(0)

  // Create explosion particles at position
  const createExplosion = (x: number, y: number, count = 12) => {
    const colors = PIXEL_COLORS.explosion
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
      const speed = 2 + Math.random() * 3
      particles.value.push({
        id: particleIdCounter++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.floor(Math.random() * 4),
        life: 30 + Math.floor(Math.random() * 20),
        maxLife: 50,
      })
    }

    // Add screen shake
    triggerShake(5, 200)

    // Add explosion effect
    effects.value.push({
      id: effectIdCounter++,
      type: 'explosion',
      x,
      y,
      duration: 500,
      startTime: Date.now(),
    })
  }

  // Create sparkle effect
  const createSparkle = (x: number, y: number, count = 8) => {
    const colors = PIXEL_COLORS.sparkle
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1 + Math.random() * 2
      particles.value.push({
        id: particleIdCounter++,
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.floor(Math.random() * 3),
        life: 20 + Math.floor(Math.random() * 15),
        maxLife: 35,
      })
    }
  }

  // Create victory celebration
  const createVictoryCelebration = (centerX: number, centerY: number) => {
    const colors = PIXEL_COLORS.victory
    // Create multiple bursts
    for (let burst = 0; burst < 3; burst++) {
      setTimeout(() => {
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2
          const speed = 3 + Math.random() * 4
          particles.value.push({
            id: particleIdCounter++,
            x: centerX + (Math.random() - 0.5) * 100,
            y: centerY + (Math.random() - 0.5) * 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 3 + Math.floor(Math.random() * 5),
            life: 40 + Math.floor(Math.random() * 30),
            maxLife: 70,
          })
        }
      }, burst * 200)
    }

    effects.value.push({
      id: effectIdCounter++,
      type: 'victory',
      x: centerX,
      y: centerY,
      duration: 2000,
      startTime: Date.now(),
    })
  }

  // Create treasure open effect
  const createTreasureEffect = (x: number, y: number) => {
    const colors = PIXEL_COLORS.treasure
    for (let i = 0; i < 15; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI
      const speed = 2 + Math.random() * 3
      particles.value.push({
        id: particleIdCounter++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.floor(Math.random() * 4),
        life: 35 + Math.floor(Math.random() * 20),
        maxLife: 55,
      })
    }

    effects.value.push({
      id: effectIdCounter++,
      type: 'treasure',
      x,
      y,
      duration: 800,
      startTime: Date.now(),
    })
  }

  // Create damage effect
  const createDamageEffect = (x: number, y: number) => {
    const colors = PIXEL_COLORS.damage
    for (let i = 0; i < 6; i++) {
      particles.value.push({
        id: particleIdCounter++,
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 2,
        vy: -2 - Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.floor(Math.random() * 3),
        life: 20 + Math.floor(Math.random() * 10),
        maxLife: 30,
      })
    }

    triggerShake(3, 150)

    effects.value.push({
      id: effectIdCounter++,
      type: 'damage',
      x,
      y,
      duration: 300,
      startTime: Date.now(),
    })
  }

  // Create heal effect
  const createHealEffect = (x: number, y: number) => {
    const colors = PIXEL_COLORS.heal
    for (let i = 0; i < 10; i++) {
      particles.value.push({
        id: particleIdCounter++,
        x: x + (Math.random() - 0.5) * 40,
        y: y + 20,
        vx: (Math.random() - 0.5) * 1,
        vy: -1 - Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.floor(Math.random() * 3),
        life: 30 + Math.floor(Math.random() * 15),
        maxLife: 45,
      })
    }

    effects.value.push({
      id: effectIdCounter++,
      type: 'heal',
      x,
      y,
      duration: 600,
      startTime: Date.now(),
    })
  }

  // Create level up effect
  const createLevelUpEffect = (x: number, y: number) => {
    createSparkle(x, y, 15)
    effects.value.push({
      id: effectIdCounter++,
      type: 'levelUp',
      x,
      y,
      duration: 1500,
      startTime: Date.now(),
    })
  }

  // Trigger screen shake
  const triggerShake = (intensity: number, duration: number) => {
    isShaking.value = true
    shakeIntensity.value = intensity
    setTimeout(() => {
      isShaking.value = false
      shakeIntensity.value = 0
    }, duration)
  }

  // Update particles (call in animation loop)
  const updateParticles = () => {
    particles.value = particles.value
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.1, // gravity
        life: p.life - 1,
      }))
      .filter((p) => p.life > 0)
  }

  // Clean up old effects
  const cleanupEffects = () => {
    const now = Date.now()
    effects.value = effects.value.filter(
      (e) => now - e.startTime < e.duration
    )
  }

  // Clear all animations
  const clearAll = () => {
    particles.value = []
    effects.value = []
    isShaking.value = false
  }

  return {
    particles,
    effects,
    isShaking,
    shakeIntensity,
    createExplosion,
    createSparkle,
    createVictoryCelebration,
    createTreasureEffect,
    createDamageEffect,
    createHealEffect,
    createLevelUpEffect,
    triggerShake,
    updateParticles,
    cleanupEffects,
    clearAll,
  }
}
