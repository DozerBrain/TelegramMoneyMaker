export type CardRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'ultimate'

export interface CardData {
  id: number
  rarity: CardRarity
  name: string
  image: string
  dropRate: number
}

export const cards: CardData[] = [
  { id: 1, rarity: 'common', name: 'Common', image: '/cards/common.png', dropRate: 51.2 },
  { id: 2, rarity: 'uncommon', name: 'Uncommon', image: '/cards/uncommon.png', dropRate: 29.3 },
  { id: 3, rarity: 'rare', name: 'Rare', image: '/cards/rare.png', dropRate: 14.6 },
  { id: 4, rarity: 'epic', name: 'Epic', image: '/cards/epic.png', dropRate: 3.6 },
  { id: 5, rarity: 'legendary', name: 'Legendary', image: '/cards/legendary.png', dropRate: 1.0 },
  { id: 6, rarity: 'mythic', name: 'Mythic', image: '/cards/mythic.png', dropRate: 0.07 },
  { id: 7, rarity: 'ultimate', name: 'Ultimate', image: '/cards/ultimate.png', dropRate: 0.005 },
]
