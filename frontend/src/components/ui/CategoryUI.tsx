import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GoalCategory } from '../../types/goals';
import { getCategoryIconComponent, getCategoryColorClass } from './categoryUtils';
import type { IconProps } from './categoryUtils';

/**
 * A component that renders a header for a category, including its icon and name.
 * Useful for displaying category titles in lists or cards.
 * @param {Object} props - Component props.
 * @param {GoalCategory} props.category - The category to display.
 * @returns {React.ReactElement} The category header component.
 */
export const CategoryHeader: React.FC<{category: GoalCategory}> = ({category}) => {
  const { t } = useTranslation();
  const IconComponent = getCategoryIconComponent(category);
  const colorClass = getCategoryColorClass(category, 'icon');
  return (
    <div className={`flex items-center gap-2 ${getCategoryColorClass(category)}`}>
      <IconComponent size={20} strokeWidth={2} className={colorClass} />
      <span className="text-lg font-semibold">{t(`content.categories.${category.toLowerCase()}`)}</span>
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
export const CategoryIcon: React.FC<{category: GoalCategory} & IconProps> = ({category, size = 20, strokeWidth = 2, ...props}) => {
  const IconComponent = getCategoryIconComponent(category);
  const colorClass = getCategoryColorClass(category, 'icon');
  return <IconComponent size={size} strokeWidth={strokeWidth} className={colorClass} {...props} />;
};

/**
 * Backward compatibility function to get category color.
 * Use getCategoryColorClass for new implementations.
 * @param {GoalCategory} category - The category for which to get the color.
 * @param {ColorType} [type='text'] - The type of color class to retrieve.
 * @returns {string} The Tailwind CSS class for the specified category and type.
 */

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