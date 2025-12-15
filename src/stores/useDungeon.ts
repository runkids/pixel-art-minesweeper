import { defineStore } from 'pinia'
import { ref, computed, toRefs } from 'vue'

// Monster types with different difficulties
export interface Monster {
  id: string
  name: string
  emoji: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  exp: number
  gold: number
  isBoss: boolean
  description: string
}

// Treasure types
export interface Treasure {
  id: string
  name: string
  emoji: string
  type: 'gold' | 'potion' | 'skill' | 'equipment' | 'key'
  value: number
  description: string
}

// Player skills
export interface Skill {
  id: string
  name: string
  emoji: string
  description: string
  cooldown: number
  currentCooldown: number
  manaCost: number
  effect: 'scan' | 'shield' | 'bomb' | 'heal' | 'reveal'
  charges?: number
}

// Equipment
export interface Equipment {
  id: string
  name: string
  emoji: string
  slot: 'weapon' | 'armor' | 'accessory'
  attack: number
  defense: number
  special?: string
}

// Monster templates
const MONSTER_TEMPLATES: Omit<Monster, 'id'>[] = [
  { name: 'Slime', emoji: '🟢', hp: 10, maxHp: 10, attack: 2, defense: 0, exp: 5, gold: 3, isBoss: false, description: 'A squishy green monster' },
  { name: 'Bat', emoji: '🦇', hp: 8, maxHp: 8, attack: 3, defense: 0, exp: 6, gold: 4, isBoss: false, description: 'A bat flying in the dark' },
  { name: 'Skeleton', emoji: '💀', hp: 15, maxHp: 15, attack: 4, defense: 1, exp: 10, gold: 8, isBoss: false, description: 'An undead skeleton warrior' },
  { name: 'Goblin', emoji: '👺', hp: 12, maxHp: 12, attack: 5, defense: 1, exp: 8, gold: 10, isBoss: false, description: 'A cunning small monster' },
  { name: 'Ghost', emoji: '👻', hp: 20, maxHp: 20, attack: 6, defense: 2, exp: 15, gold: 12, isBoss: false, description: 'A floating spirit' },
  { name: 'Demon', emoji: '😈', hp: 25, maxHp: 25, attack: 7, defense: 2, exp: 20, gold: 15, isBoss: false, description: 'A demon from the abyss' },
  { name: 'Gargoyle', emoji: '🗿', hp: 30, maxHp: 30, attack: 5, defense: 5, exp: 25, gold: 20, isBoss: false, description: 'A hard stone monster' },
  { name: 'Fire Spirit', emoji: '🔥', hp: 18, maxHp: 18, attack: 8, defense: 1, exp: 18, gold: 14, isBoss: false, description: 'A burning elemental' },
  { name: 'Frost Giant', emoji: '🧊', hp: 35, maxHp: 35, attack: 6, defense: 4, exp: 30, gold: 25, isBoss: false, description: 'A cold giant monster' },
  { name: 'Viper', emoji: '🐍', hp: 14, maxHp: 14, attack: 6, defense: 0, exp: 12, gold: 9, isBoss: false, description: 'A venomous snake' },
]

// Boss templates
const BOSS_TEMPLATES: Omit<Monster, 'id'>[] = [
  { name: 'Dungeon Lord', emoji: '👹', hp: 50, maxHp: 50, attack: 10, defense: 3, exp: 100, gold: 50, isBoss: true, description: 'The powerful ruler of this dungeon' },
  { name: 'Dark Dragon', emoji: '🐉', hp: 80, maxHp: 80, attack: 12, defense: 5, exp: 200, gold: 100, isBoss: true, description: 'A legendary black dragon' },
  { name: 'Death Knight', emoji: '🏇', hp: 60, maxHp: 60, attack: 15, defense: 4, exp: 150, gold: 75, isBoss: true, description: 'An undead knight on a ghost horse' },
  { name: 'Lich King', emoji: '🧙', hp: 70, maxHp: 70, attack: 14, defense: 3, exp: 180, gold: 90, isBoss: true, description: 'A powerful undead mage' },
  { name: 'Cerberus', emoji: '🐕‍🦺', hp: 90, maxHp: 90, attack: 11, defense: 6, exp: 250, gold: 120, isBoss: true, description: 'The three-headed guardian of hell' },
]

// Treasure templates
const TREASURE_TEMPLATES: Omit<Treasure, 'id'>[] = [
  { name: 'Gold Bag', emoji: '💰', type: 'gold', value: 20, description: 'Shiny gold coins' },
  { name: 'Gem', emoji: '💎', type: 'gold', value: 50, description: 'A precious gem' },
  { name: 'Health Potion', emoji: '🧪', type: 'potion', value: 3, description: 'Restores 3 HP' },
  { name: 'Large Potion', emoji: '⚗️', type: 'potion', value: 6, description: 'Restores full HP' },
  { name: 'Skill Scroll', emoji: '📜', type: 'skill', value: 1, description: 'Learn a new skill' },
  { name: 'Mystery Key', emoji: '🗝️', type: 'key', value: 1, description: 'Opens treasure chests' },
]

// Skill templates
const SKILL_TEMPLATES: Skill[] = [
  { id: 'scan', name: 'Scan', emoji: '🔍', description: 'Reveal if a cell is safe', cooldown: 3, currentCooldown: 0, manaCost: 1, effect: 'scan', charges: 3 },
  { id: 'shield', name: 'Shield', emoji: '🛡️', description: 'Block next mine damage', cooldown: 5, currentCooldown: 0, manaCost: 2, effect: 'shield' },
  { id: 'bomb', name: 'Bomb', emoji: '💣', description: 'Safely reveal 3x3 area', cooldown: 8, currentCooldown: 0, manaCost: 3, effect: 'bomb', charges: 1 },
  { id: 'heal', name: 'Heal', emoji: '💚', description: 'Restore 2 HP', cooldown: 4, currentCooldown: 0, manaCost: 2, effect: 'heal', charges: 2 },
  { id: 'reveal', name: 'X-Ray', emoji: '👁️', description: 'Show all mines for 3 sec', cooldown: 10, currentCooldown: 0, manaCost: 4, effect: 'reveal' },
]

let idCounter = 0
const generateId = () => `entity_${idCounter++}`

export const useDungeon = defineStore('dungeon', () => {
  // Dungeon state
  const floor = ref(1)
  const maxFloorReached = ref(1)
  const gold = ref(0)
  const exp = ref(0)
  const level = ref(1)
  const expToNextLevel = computed(() => level.value * 50)

  // Player combat stats
  const playerAttack = ref(5)
  const playerDefense = ref(2)
  const mana = ref(10)
  const maxMana = ref(10)

  // Equipped items
  const equipment = ref<{ weapon?: Equipment; armor?: Equipment; accessory?: Equipment }>({})

  // Skills
  const skills = ref<Skill[]>([
    { ...SKILL_TEMPLATES[0] }, // Start with scan skill
  ])

  // Current combat state
  const currentMonster = ref<Monster | null>(null)
  const isCombatActive = ref(false)
  const combatLog = ref<string[]>([])

  // Shield status
  const hasShield = ref(false)

  // Temporary effects
  const minesRevealed = ref(false)
  const revealTimer = ref<number | null>(null)

  // Inventory
  const keys = ref(0)
  const potions = ref(0)

  // Computed stats with equipment
  const totalAttack = computed(() => {
    let total = playerAttack.value
    if (equipment.value.weapon) total += equipment.value.weapon.attack
    if (equipment.value.accessory) total += equipment.value.accessory.attack
    return total
  })

  const totalDefense = computed(() => {
    let total = playerDefense.value
    if (equipment.value.armor) total += equipment.value.armor.defense
    if (equipment.value.accessory) total += equipment.value.accessory.defense
    return total
  })

  // Generate random monster based on floor
  const generateMonster = (forceElite = false): Monster => {
    const isBossFloor = floor.value % 5 === 0

    if (isBossFloor || forceElite) {
      const bossIndex = Math.min(Math.floor(floor.value / 5) - 1, BOSS_TEMPLATES.length - 1)
      const template = BOSS_TEMPLATES[Math.max(0, bossIndex)]
      const floorMultiplier = 1 + (floor.value - 1) * 0.1
      return {
        ...template,
        id: generateId(),
        hp: Math.floor(template.hp * floorMultiplier),
        maxHp: Math.floor(template.maxHp * floorMultiplier),
        attack: Math.floor(template.attack * floorMultiplier),
        exp: Math.floor(template.exp * floorMultiplier),
        gold: Math.floor(template.gold * floorMultiplier),
      }
    }

    // Regular monster, difficulty scales with floor
    const maxMonsterIndex = Math.min(Math.floor(floor.value / 2), MONSTER_TEMPLATES.length - 1)
    const minMonsterIndex = Math.max(0, maxMonsterIndex - 3)
    const monsterIndex = minMonsterIndex + Math.floor(Math.random() * (maxMonsterIndex - minMonsterIndex + 1))
    const template = MONSTER_TEMPLATES[monsterIndex]
    const floorMultiplier = 1 + (floor.value - 1) * 0.05

    return {
      ...template,
      id: generateId(),
      hp: Math.floor(template.hp * floorMultiplier),
      maxHp: Math.floor(template.maxHp * floorMultiplier),
      attack: Math.floor(template.attack * floorMultiplier),
      exp: Math.floor(template.exp * floorMultiplier),
      gold: Math.floor(template.gold * floorMultiplier),
    }
  }

  // Generate treasure
  const generateTreasure = (): Treasure => {
    const roll = Math.random()
    let template: typeof TREASURE_TEMPLATES[0]

    if (roll < 0.4) {
      template = TREASURE_TEMPLATES[0] // Gold bag
    } else if (roll < 0.6) {
      template = TREASURE_TEMPLATES[1] // Gem
    } else if (roll < 0.8) {
      template = TREASURE_TEMPLATES[2] // Health potion
    } else if (roll < 0.9) {
      template = TREASURE_TEMPLATES[3] // Large health potion
    } else {
      template = TREASURE_TEMPLATES[5] // Key
    }

    return {
      ...template,
      id: generateId(),
      value: Math.floor(template.value * (1 + (floor.value - 1) * 0.1)),
    }
  }

  // Start combat with monster
  const startCombat = (monster?: Monster) => {
    currentMonster.value = monster || generateMonster()
    isCombatActive.value = true
    combatLog.value = [`Encountered ${currentMonster.value.emoji} ${currentMonster.value.name}!`]
  }

  // Player attacks monster
  const attackMonster = (): { damage: number; killed: boolean; rewards?: { exp: number; gold: number } } => {
    if (!currentMonster.value) return { damage: 0, killed: false }

    const damage = Math.max(1, totalAttack.value - currentMonster.value.defense)
    currentMonster.value.hp -= damage
    combatLog.value.push(`You dealt ${damage} damage!`)

    if (currentMonster.value.hp <= 0) {
      const rewards = {
        exp: currentMonster.value.exp,
        gold: currentMonster.value.gold,
      }
      combatLog.value.push(`Defeated ${currentMonster.value.name}! Got ${rewards.exp} EXP and ${rewards.gold} Gold`)

      gold.value += rewards.gold
      exp.value += rewards.exp

      // Check level up
      while (exp.value >= expToNextLevel.value) {
        exp.value -= expToNextLevel.value
        levelUp()
      }

      isCombatActive.value = false
      currentMonster.value = null
      return { damage, killed: true, rewards }
    }

    return { damage, killed: false }
  }

  // Monster attacks player (returns damage dealt)
  const monsterAttack = (): number => {
    if (!currentMonster.value) return 0

    // Check shield
    if (hasShield.value) {
      hasShield.value = false
      combatLog.value.push(`Shield blocked the attack!`)
      return 0
    }

    const damage = Math.max(1, currentMonster.value.attack - totalDefense.value)
    combatLog.value.push(`${currentMonster.value.emoji} dealt ${damage} damage to you!`)
    return damage
  }

  // Level up
  const levelUp = () => {
    level.value++
    playerAttack.value += 2
    playerDefense.value += 1
    maxMana.value += 2
    mana.value = maxMana.value
    combatLog.value.push(`Level Up! Now Lv.${level.value}`)
  }

  // Use skill
  const useSkill = (skillId: string): boolean => {
    const skill = skills.value.find(s => s.id === skillId)
    if (!skill) return false
    if (skill.currentCooldown > 0) return false
    if (mana.value < skill.manaCost) return false
    if (skill.charges !== undefined && skill.charges <= 0) return false

    mana.value -= skill.manaCost
    skill.currentCooldown = skill.cooldown
    if (skill.charges !== undefined) skill.charges--

    return true
  }

  // Reduce skill cooldowns (call after each action)
  const reduceCooldowns = () => {
    skills.value.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--
      }
    })
  }

  // Activate shield
  const activateShield = () => {
    hasShield.value = true
  }

  // Reveal mines temporarily
  const revealMinesTemporarily = (duration: number) => {
    minesRevealed.value = true
    if (revealTimer.value) clearTimeout(revealTimer.value)
    revealTimer.value = window.setTimeout(() => {
      minesRevealed.value = false
      revealTimer.value = null
    }, duration)
  }

  // Advance to next floor
  const nextFloor = () => {
    floor.value++
    if (floor.value > maxFloorReached.value) {
      maxFloorReached.value = floor.value
    }
    // Restore some mana
    mana.value = Math.min(maxMana.value, mana.value + 3)
    // Reduce all cooldowns
    reduceCooldowns()
  }

  // Collect treasure
  const collectTreasure = (treasure: Treasure) => {
    switch (treasure.type) {
      case 'gold':
        gold.value += treasure.value
        break
      case 'potion':
        potions.value += 1
        break
      case 'key':
        keys.value += 1
        break
    }
  }

  // Use potion
  const usePotion = (): number => {
    if (potions.value <= 0) return 0
    potions.value--
    return 3 // Heal amount
  }

  // Learn new skill
  const learnSkill = (skillId: string) => {
    const template = SKILL_TEMPLATES.find(s => s.id === skillId)
    if (template && !skills.value.find(s => s.id === skillId)) {
      skills.value.push({ ...template })
    }
  }

  // Recharge skill charges
  const rechargeSkill = (skillId: string, amount: number) => {
    const skill = skills.value.find(s => s.id === skillId)
    if (skill && skill.charges !== undefined) {
      skill.charges += amount
    }
  }

  // Reset dungeon (new game)
  const reset = () => {
    floor.value = 1
    gold.value = 0
    exp.value = 0
    level.value = 1
    playerAttack.value = 5
    playerDefense.value = 2
    mana.value = 10
    maxMana.value = 10
    equipment.value = {}
    skills.value = [{ ...SKILL_TEMPLATES[0] }]
    currentMonster.value = null
    isCombatActive.value = false
    combatLog.value = []
    hasShield.value = false
    minesRevealed.value = false
    keys.value = 0
    potions.value = 0
    if (revealTimer.value) {
      clearTimeout(revealTimer.value)
      revealTimer.value = null
    }
  }

  return {
    // State
    floor,
    maxFloorReached,
    gold,
    exp,
    level,
    expToNextLevel,
    playerAttack,
    playerDefense,
    mana,
    maxMana,
    totalAttack,
    totalDefense,
    equipment,
    skills,
    currentMonster,
    isCombatActive,
    combatLog,
    hasShield,
    minesRevealed,
    keys,
    potions,

    // Actions
    generateMonster,
    generateTreasure,
    startCombat,
    attackMonster,
    monsterAttack,
    useSkill,
    reduceCooldowns,
    activateShield,
    revealMinesTemporarily,
    nextFloor,
    collectTreasure,
    usePotion,
    learnSkill,
    rechargeSkill,
    reset,
  }
})

export const dungeonStoreToRefs = () => toRefs(useDungeon())
