# Animal Actions Page - Developer Guide

## Quick Reference

### File Location
```
apps/web/src/app/[locale]/(app)/animals/[id]/page.tsx
```

### Route Pattern
```
/[locale]/animals/[id]
```
Example: `/en/animals/cm2abc123` or `/ar/animals/cm2abc123`

---

## Component Structure

```typescript
AnimalDetailPage
├── Header Section
│   ├── Back Button
│   ├── Animal Info (Tag, Status, Type, Breed, Sex, Age)
│   └── Edit Button
├── Tab Navigation (6 tabs with icons)
└── Tab Content (Dynamic based on active tab)
    ├── Details Tab
    ├── Breeding Tab
    ├── Health Tab
    ├── Weight Tab
    ├── Milk Tab
    └── Sales Tab
```

---

## API Integration

### tRPC Queries Used

```typescript
// Main animal data
trpc.animals.get.useQuery({ id: animalId })

// Breeding cycles (lazy loaded)
trpc.breeding.cycles.list.useQuery(
  { farmId, limit: 10 },
  { enabled: !!farmId && activeTab === 'breeding' }
)

// Health events (lazy loaded)
trpc.health.events.list.useQuery(
  { farmId, animalId, limit: 20 },
  { enabled: !!farmId && activeTab === 'health' }
)

// Weight records (lazy loaded)
trpc.weights.list.useQuery(
  { farmId, animalId, limit: 20 },
  { enabled: !!farmId && activeTab === 'weight' }
)

// Milk yields (lazy loaded)
trpc.milk.yields.list.useQuery(
  { farmId, animalId, limit: 20 },
  { enabled: !!farmId && activeTab === 'milk' }
)

// Sales records (lazy loaded)
trpc.sales.list.useQuery(
  { farmId, animalId, limit: 10 },
  { enabled: !!farmId && activeTab === 'sales' }
)
```

### Why Lazy Loading?
- **Performance**: Only fetch data when user views the tab
- **Network Efficiency**: Reduces initial page load
- **Cost Optimization**: Fewer database queries
- **User Experience**: Faster initial render

---

## State Management

### Local State
```typescript
const [activeTab, setActiveTab] = useState<Tab>('details');
```

### Derived State
```typescript
// Age calculation
const calculateAge = (dob: Date) => {
  // Returns format: "2y 3m" or "5m"
}
```

---

## Styling Classes

### Custom Classes Used
```css
.card                    /* Card container */
.btn-primary            /* Primary action button */
.bg-success-100         /* Success background light */
.text-success-700       /* Success text dark */
.bg-primary-100         /* Primary background light */
.text-primary-700       /* Primary text dark */
.bg-error-100           /* Error background light */
.text-error-700         /* Error text dark */
```

### Tailwind Utilities
- Responsive grids: `grid grid-cols-1 md:grid-cols-2`
- Spacing: `gap-4`, `mb-6`, `p-4`
- Typography: `text-xl font-semibold`
- Colors: `text-gray-600`, `bg-gray-50`
- Borders: `border border-gray-200 rounded-lg`

---

## Internationalization

### Translation Keys

```typescript
// Common translations
tCommon('loading')
tCommon('edit')

// Animal-specific translations
t('tabs.details')
t('tabs.breeding')
t('tabs.health')
t('tabs.weight')
t('tabs.milk')
t('tabs.sales')
```

### Adding New Translations

1. **English** (`apps/web/messages/en.json`):
```json
{
  "animals": {
    "tabs": {
      "newTab": "New Tab"
    }
  }
}
```

2. **Arabic** (`apps/web/messages/ar.json`):
```json
{
  "animals": {
    "tabs": {
      "newTab": "تبويب جديد"
    }
  }
}
```

---

## Adding a New Tab

### Step 1: Update Type
```typescript
type Tab = 'details' | 'breeding' | 'health' | 'weight' | 'milk' | 'sales' | 'newTab';
```

### Step 2: Add to Tabs Array
```typescript
import { NewIcon } from 'lucide-react';

const tabs = [
  // ... existing tabs
  { key: 'newTab', label: t('tabs.newTab'), icon: NewIcon },
];
```

### Step 3: Add Query (if needed)
```typescript
const { data: newData } = trpc.newRouter.list.useQuery(
  { farmId, animalId, limit: 20 },
  { enabled: !!farmId && activeTab === 'newTab' }
);
```

### Step 4: Add Tab Content
```typescript
{activeTab === 'newTab' && (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        New Tab Title
      </h2>
      <button className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add New Item
      </button>
    </div>
    
    {newData?.items && newData.items.length > 0 ? (
      <div>
        {/* Display data */}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500">
        <NewIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No records yet</p>
      </div>
    )}
  </div>
)}
```

---

## Common Patterns

### Empty State Pattern
```typescript
<div className="text-center py-12 text-gray-500">
  <Icon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
  <p>No records yet</p>
</div>
```

### Data Table Pattern
```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
          Column Header
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {data.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
          <td className="py-3 px-4 text-sm text-gray-900">
            {item.value}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Card Pattern
```typescript
<div className="border border-gray-200 rounded-lg p-4">
  <div className="flex items-start justify-between mb-3">
    <div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
    <p className="text-sm text-gray-600">{date}</p>
  </div>
  {/* Additional content */}
</div>
```

### Status Badge Pattern
```typescript
<span className={`px-2 py-1 rounded-full text-xs font-medium ${
  status === 'ACTIVE' 
    ? 'bg-success-100 text-success-700'
    : 'bg-gray-100 text-gray-700'
}`}>
  {status}
</span>
```

---

## Testing

### Manual Testing Checklist

```bash
# 1. Test with animal that has no records
- [ ] All tabs show appropriate empty states
- [ ] No console errors
- [ ] Add buttons are visible

# 2. Test with animal that has records
- [ ] Details tab shows all information
- [ ] Breeding tab displays cycles
- [ ] Health tab shows events
- [ ] Weight tab displays table
- [ ] Milk tab shows yields
- [ ] Sales tab displays sales

# 3. Test navigation
- [ ] Back button works
- [ ] Tab switching is smooth
- [ ] URL doesn't change when switching tabs

# 4. Test responsive design
- [ ] Mobile view works
- [ ] Tablet view works
- [ ] Desktop view works
- [ ] Tabs scroll horizontally on mobile

# 5. Test internationalization
- [ ] English translations work
- [ ] Arabic translations work
- [ ] RTL layout works in Arabic

# 6. Test edge cases
- [ ] Animal not found shows error
- [ ] Loading state displays
- [ ] Network errors are handled
```

### Unit Testing Example

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { trpc } from '@/lib/trpc';

jest.mock('@/lib/trpc');

describe('AnimalDetailPage', () => {
  it('displays animal information', async () => {
    (trpc.animals.get.useQuery as jest.Mock).mockReturnValue({
      data: {
        tagNumber: 'A001',
        type: 'SHEEP',
        breed: 'Awassi',
        sex: 'FEMALE',
        status: 'ACTIVE',
      },
      isLoading: false,
    });

    render(<AnimalDetailPage />);

    await waitFor(() => {
      expect(screen.getByText('A001')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });
  });
});
```

---

## Performance Optimization

### Current Optimizations
1. **Lazy Loading**: Data fetched only when tab is active
2. **Conditional Queries**: `enabled` flag prevents unnecessary requests
3. **Pagination Ready**: All queries support cursor-based pagination
4. **Memoization**: React components re-render only when necessary

### Future Optimizations
1. **Infinite Scroll**: Add pagination for large datasets
2. **Virtual Scrolling**: For very long lists
3. **Data Caching**: Implement SWR or React Query caching
4. **Prefetching**: Prefetch next tab's data on hover

---

## Troubleshooting

### Common Issues

#### Issue: "Animal not found" error
**Solution:** Check if animal ID exists in database and user has access to the farm

#### Issue: Empty tabs even though data exists
**Solution:** Check if `farmId` is being passed correctly to queries

#### Issue: Tabs not switching
**Solution:** Verify `activeTab` state is updating correctly

#### Issue: Translations not working
**Solution:** Ensure translation keys exist in both `en.json` and `ar.json`

#### Issue: Icons not displaying
**Solution:** Check if `lucide-react` is installed and icons are imported

---

## Related Files

### Backend
- `packages/api/src/routers/animals.ts` - Animal router
- `packages/api/src/routers/breeding.ts` - Breeding router
- `packages/api/src/routers/health.ts` - Health router
- `packages/api/src/routers/weights.ts` - Weights router
- `packages/api/src/routers/milk.ts` - Milk router
- `packages/api/src/routers/sales.ts` - Sales router

### Frontend
- `apps/web/src/lib/trpc.ts` - tRPC client setup
- `apps/web/messages/en.json` - English translations
- `apps/web/messages/ar.json` - Arabic translations
- `apps/web/src/app/globals.css` - Global styles

### Database
- `packages/db/prisma/schema.prisma` - Database schema

---

## Best Practices

### Do's ✅
- Use lazy loading for tab data
- Provide empty states with friendly messages
- Use icons to improve visual clarity
- Keep queries simple and focused
- Handle loading and error states
- Use TypeScript for type safety
- Follow existing code patterns

### Don'ts ❌
- Don't fetch all data on initial load
- Don't use hardcoded strings (use i18n)
- Don't ignore error states
- Don't create deeply nested components
- Don't use inline styles (use Tailwind)
- Don't forget responsive design
- Don't skip accessibility considerations

---

## Support

### Questions?
- Check the codebase for similar patterns
- Review tRPC documentation
- Check Next.js App Router docs
- Review Tailwind CSS documentation

### Need Help?
- Review this guide
- Check related documentation files
- Look at existing implementations
- Test in development environment first

---

**Last Updated:** October 22, 2025  
**Maintainer:** Development Team  
**Version:** 1.0.0

