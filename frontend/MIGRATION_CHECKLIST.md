# i18n Migration Checklist

## Migration Progress Tracker

### ✅ Completed
- [x] Updated i18n configuration to support new translation files
- [x] Created TypeScript type definitions for new i18n structure
- [x] Updated QuoteOfDay component to use new keys
- [x] Verified fallback mechanism works correctly

### 🔄 Next Steps
- [ ] Test QuoteOfDay component in both languages
- [ ] Update remaining components systematically
- [ ] Remove old translation files after full migration
- [ ] Update documentation

## Components to Migrate

### Dashboard Components
- [ ] GoalCard - uses old keys like `progressPage.stats.*`
- [ ] ProgressGoalCard - uses `progressPage.analytics.*`
- [ ] TaskCard - uses `common.delete_button`
- [x] QuoteOfDay - ✅ **COMPLETED** - uses new keys

### Navigation Components
- [ ] LanguageSwitch - uses toast messages
- [ ] Navigation components - use `common.progress`, `common.profile`

### Profile Components
- [ ] ProfilePage - uses `profile.tabs.*`, `content.profile.content.*`

### Auth Components
- [ ] Login/Register forms - use `auth.*` keys

## Key Mappings

| Old Key | New Key | Status |
|---------|---------|--------|
| `dashboard.quotes.daily` | `content.dashboard.dailyQuote` | ✅ |
| `dashboard.quotes.*` | `content.dashboard.quotes.*` | ✅ |
| `common.delete_button` | `actions.delete` | 🔄 |
| `common.save_changes_button` | `actions.save` | 🔄 |
| `progressPage.stats.totalGoals` | `content.progress.stats.totalGoals` | 🔄 |
| `progressPage.analytics.completionRate` | `content.progress.completionRate` | 🔄 |
| `progressPage.analytics.completedOn` | `time.completedOn` | 🔄 |

## Testing Checklist

For each component:
1. [ ] Update to use new keys
2. [ ] Test in English
3. [ ] Test in Chinese
4. [ ] Verify fallback works (remove new key temporarily)
5. [ ] Check console for missing key warnings

## Migration Commands

```bash
# Test individual components
npm run dev

# Manual migration approach:
# 1. Find old keys: grep -r "t('old.key" src/
# 2. Update to new keys using the mappings above
# 3. Test both languages
```

## Files Updated
- `src/i18n.ts` - ✅ Updated with migration utility
- `src/types/i18n.d.ts` - ✅ Type definitions created
- `src/components/dashboard/QuoteOfDay.tsx` - ✅ Updated to new keys
