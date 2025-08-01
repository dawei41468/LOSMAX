import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GoalCategory } from '../../types/goals';
import { Heart, Briefcase, User } from 'lucide-react';

/**
 * Props for customizing icon appearance.
 * @typedef {Object} IconProps
 * @property {number} [size] - Optional size of the icon (default: 20).
 * @property {number} [strokeWidth] - Optional stroke width of the icon (default: 2).
 */
type IconProps = {
  size?: number;
  strokeWidth?: number;
};

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
type ColorType = keyof typeof categoryColors['Health'];

/**
 * Returns a React element representing an icon for the specified category.
 * The icon can be customized with size and stroke width.
 * @param {GoalCategory} category - The category for which to get the icon.
 * @param {IconProps} [props] - Optional props to customize icon appearance.
 * @returns {React.ReactElement} The icon component for the specified category.
 */
export const getCategoryIcon = (
  category: GoalCategory,
  { size = 20, strokeWidth = 2 }: IconProps = {}
) => {
  const colors = categoryColors[category] || categoryColors.Work;
  const iconProps = {
    size,
    strokeWidth,
    className: colors.icon
  };

  switch (category) {
    case 'Health':
      return <Heart {...iconProps} />;
    case 'Work':
      return <Briefcase {...iconProps} />;
    case 'Personal':
      return <User {...iconProps} />;
    default:
      return <Briefcase {...iconProps} />;
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
 * A component that renders a header for a category, including its icon and name.
 * Useful for displaying category titles in lists or cards.
 * @param {Object} props - Component props.
 * @param {GoalCategory} props.category - The category to display.
 * @returns {React.ReactElement} The category header component.
 */
export const CategoryHeader: React.FC<{category: GoalCategory}> = ({category}) => {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center gap-2 ${getCategoryColorClass(category)}`}>
      {getCategoryIcon(category)}
      <span className="text-lg font-semibold">{t(`common.categories.${category.toLowerCase()}`)}</span>
    </div>
  );
};

/**
 * A component that renders just the icon for a category.
 * Useful for compact displays where only the icon is needed.
 * @param {Object} props - Component props.
 * @param {GoalCategory} props.category - The category for which to render the icon.
 * @param {IconProps} [props] - Optional props to customize icon appearance.
 * @returns {React.ReactElement} The category icon component.
 */
export const CategoryIcon: React.FC<{category: GoalCategory} & IconProps> = ({category, ...props}) => {
  return getCategoryIcon(category, props);
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

/**
 * USAGE GUIDE:
 * 
 * The CategoryUI module provides components and utility functions to display
 * category-specific icons and colors in a consistent manner across the application.
 * 
 * 1. CategoryIcon Component:
 *    - Use this component when you need to display just the icon for a category.
 *    - Example: <CategoryIcon category="Health" size={24} strokeWidth={1.5} />
 *    - Props:
 *      - category: The category name (Health, Work, Personal, Family)
 *      - size: Optional icon size in pixels
 *      - strokeWidth: Optional icon stroke width
 * 
 * 2. CategoryHeader Component:
 *    - Use this component when you need a header with both icon and category name.
 *    - Example: <CategoryHeader category="Work" />
 *    - Props:
 *      - category: The category name (Health, Work, Personal, Family)
 * 
 * 3. getCategoryIcon Function:
 *    - Use this utility function when you need to get the icon element directly for custom rendering.
 *    - Example: const icon = getCategoryIcon('Personal', { size: 18 });
 *    - Parameters:
 *      - category: The category name
 *      - options: Object with optional size and strokeWidth
 * 
 * 4. getCategoryColorClass Function:
 *    - Use this utility to get Tailwind CSS classes for styling elements based on category.
 *    - Example: const textClass = getCategoryColorClass('Health', 'text');
 *    - Parameters:
 *      - category: The category name
 *      - type: The style type ('text', 'bg', 'icon', or 'primary')
 * 
 * 5. getCategoryColor Function:
 *    - Legacy function for backward compatibility. Use getCategoryColorClass for new code.
 * 
 * Integration Example:
 * import { CategoryHeader, CategoryIcon, getCategoryColorClass } from './CategoryUI';
 * 
 * function GoalCard({ goal }) {
 *   return (
 *     <div className={`p-4 rounded-lg ${getCategoryColorClass(goal.category, 'bg')}`}>
 *       <CategoryHeader category={goal.category} />
 *       <p>{goal.title}</p>
 *       <CategoryIcon category={goal.category} size={16} />
 *     </div>
 *   );
 * }
 */