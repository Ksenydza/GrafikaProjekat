import type { RGBA } from '../../shared/types';

// Numeric const-object mirrors an enum but emits no runtime IIFE,
// satisfying the project's `erasableSyntaxOnly` TypeScript option.
export const MaterialType = {
  Empty:    0,
  Sand:     1,
  Water:    2,
  Concrete: 3,
  Acid:     4,
  WeakAcid: 5,
} as const;

export type MaterialType = (typeof MaterialType)[keyof typeof MaterialType];

export interface MaterialDefinition {
  id:                  MaterialType;
  name:                string;
  displayName:         string;
  color:               RGBA;
  isStatic:            boolean;
  isLiquid:            boolean;
  density:             number;
  erodesConcretePower: number;
}

export const MATERIAL_DEFINITIONS: Record<MaterialType, MaterialDefinition> = {
  [MaterialType.Empty]: {
    id:                  MaterialType.Empty,
    name:                'empty',
    displayName:         'Empty',
    color:               [0, 0, 0, 0],
    isStatic:            false,
    isLiquid:            false,
    density:             0,
    erodesConcretePower: 0,
  },
  [MaterialType.Sand]: {
    id:                  MaterialType.Sand,
    name:                'sand',
    displayName:         'Sand',
    color:               [194, 178, 128, 255],
    isStatic:            false,
    isLiquid:            false,
    density:             1.5,
    erodesConcretePower: 0,
  },
  [MaterialType.Water]: {
    id:                  MaterialType.Water,
    name:                'water',
    displayName:         'Water',
    color:               [64, 128, 230, 200],
    isStatic:            false,
    isLiquid:            true,
    density:             1.0,
    erodesConcretePower: 0,
  },
  [MaterialType.Concrete]: {
    id:                  MaterialType.Concrete,
    name:                'concrete',
    displayName:         'Concrete',
    color:               [140, 140, 148, 255],
    isStatic:            true,
    isLiquid:            false,
    density:             3.0,
    erodesConcretePower: 0,
  },
  [MaterialType.Acid]: {
    id:                  MaterialType.Acid,
    name:                'acid',
    displayName:         'Acid',
    color:               [57, 255, 20, 220],
    isStatic:            false,
    isLiquid:            true,
    density:             0.8,
    erodesConcretePower: 1.0,
  },
  [MaterialType.WeakAcid]: {
    id:                  MaterialType.WeakAcid,
    name:                'weakAcid',
    displayName:         'Weak Acid',
    color:               [160, 255, 120, 180],
    isStatic:            false,
    isLiquid:            true,
    density:             0.9,
    erodesConcretePower: 0.1,
  },
};

export function getMaterial(type: MaterialType): MaterialDefinition {
  return MATERIAL_DEFINITIONS[type];
}
