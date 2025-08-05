import type { GoalCategory } from '../../types/goals';
import { Heart, Briefcase, User, Home } from 'lucide-react';

/**
 * A mapping of category names to their respective color classes for consistent styling.
 * Each category has multiple color variants for different UI elements (text, background, icon, primary).
 * This ensures visual consistency across the application.
 */
export const categoryColors = {
  Health: {
    text: 'text-[var(--category-health)]',
    bg: 'bg-[color-mix(in_srgb,var(--category-health)_10%,transparent)]',
    icon: 'text-[var(--category-health)]',
    primary: 'text-[var(--category-health)]',
    primaryBg: 'bg-[var(--category-health)]'
  },
  Work: {
    text: 'text-[var(--category-work)]',
    bg: 'bg-[color-mix(in_srgb,var(--category-work)_10%,transparent)]',
    icon: 'text-[var(--category-work)]',
    primary: 'text-[var(--category-work)]',
    primaryBg: 'bg-[var(--category-work)]'
  },
  Personal: {
    text: 'text-[var(--category-personal)]',
    bg: 'bg-[color-mix(in_srgb,var(--category-personal)_10%,transparent)]',
    icon: 'text-[var(--category-personal)]',
    primary: 'text-[var(--category-personal)]',
    primaryBg: 'bg-[var(--category-personal)]'
  },
  Family: {
    text: 'text-[var(--category-family)]',
    bg: 'bg-[color-mix(in_srgb,var(--category-family)_10%,transparent)]',
    icon: 'text-[var(--category-family)]',
    primary: 'text-[var(--category-family)]',
    primaryBg: 'bg-[var(--category-family)]'
  }
} as const;

/**
 * Type for selecting the color variant to apply.
 * Can be 'text', 'bg', 'icon', or 'primary' for different styling purposes.
 */
export type ColorType = keyof typeof categoryColors['Health'];

/**
 * Props for customizing icon appearance.
 * @typedef {Object} IconProps
 * @property {number} [size] - Optional size of the icon (default: 20).
 * @property {number} [strokeWidth] - Optional stroke width of the icon (default: 2).
 */
export type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
};

/**
 * Returns the icon component type for the specified category.
 * The icon can be customized with size and stroke width when rendered.
 * @param {GoalCategory} category - The category for which to get the icon component.
 * @returns {React.ComponentType<IconProps>} The icon component type for the specified category.
 */
export const getCategoryIconComponent = (category: GoalCategory) => {
  switch (category) {
    case 'Health':
      return Heart;
    case 'Work':
      return Briefcase;
    case 'Personal':
      return User;
    case 'Family':
      return Home;
    default:
      return Briefcase;
  }
};

/**
 * Retrieves the Tailwind CSS class for a specific category and color type.
 * Useful for styling elements based on category themes.
 * @param {GoalCategory} category - The category for which to get the color class.
 * @param {ColorType} [type='text'] - The type of color class to retrieve (text, bg, icon, primary).
 * @returns {string} The Tailwind CSS class for the specified category and type.
 */
export const getCategoryColorClass = (
  category: GoalCategory,
  type: ColorType = 'text'
) => {
  const colors = categoryColors[category] || categoryColors.Work;
  return colors[type];
};

/**
 * Retrieves the border variant name for the Card component based on the category.
 * This is used to set the border color of cards according to the category theme.
 * @param {GoalCategory} category - The category for which to get the border variant.
 * @returns {string} The border variant name for the Card component.
 */
export const getCategoryBorderVariant = (category: GoalCategory): 'family' | 'work' | 'personal' | 'health' | 'default' => {
  const categoryBorderMap: Record<GoalCategory, 'family' | 'work' | 'personal' | 'health'> = {
    Family: 'family',
    Work: 'work',
    Personal: 'personal',
    Health: 'health',
  };
  return categoryBorderMap[category] || 'default';
};

/**
 * Backward compatibility function to get category color.
 * Use getCategoryColorClass for new implementations.
 * @param {GoalCategory} category - The category for which to get the color.
 * @param {ColorType} [type='text'] - The type of color class to retrieve.
 * @returns {string} The Tailwind CSS class for the specified category and type.
 */
export const getCategoryColor = (category: GoalCategory, type: ColorType = 'text') => {
  return getCategoryColorClass(category, type);
};