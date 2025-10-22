# Feature: Lamb Details in Breeding Records

## Overview
Enhanced the animal detail page to display comprehensive lamb information in breeding records. When viewing an animal's breeding history, users can now see detailed information about each lamb that was born, including their tag numbers, sex, and status (live or stillborn).

## Changes Made

### 1. Updated Animal Detail Page (`apps/web/src/app/[locale]/(app)/animals/[id]/page.tsx`)

#### Added New Query for Breeding Cycles
- Added a dedicated query to fetch breeding cycles with events for the specific animal
- Filters cycles where the animal is the ewe (mother)
- Includes all breeding events to access lambing event payloads

```typescript
const { data: animalBreedingCycles } = trpc.breeding.cycles.list.useQuery(
  {
    farmId: farmId!,
    limit: 50,
  },
  { 
    enabled: !!farmId && activeTab === 'breeding',
    select: (data) => {
      return data.items.filter((cycle: any) => cycle.eweId === animalId);
    }
  }
);
```

#### Enhanced Breeding Records Display
The breeding tab now shows:

1. **Breeding Cycle Information**
   - Status badge (OPEN, PREGNANT, LAMBED, etc.)
   - Insemination date
   - Estimated due date
   - Actual lambing date (when available)

2. **Lamb Details Section** (for LAMBED cycles)
   - **Summary Statistics**:
     - Total lambs count
     - Live lambs count
     - Stillborn count (if any)
   
   - **Individual Lamb Information**:
     - Sequential numbering (#1, #2, etc.)
     - Tag number (for live lambs)
     - Sex (Male/Female) with color-coded badges
     - Stillborn status indicator
     - Link to view the lamb's animal record
   
   - **Additional Information**:
     - Notes from the lambing event

#### Visual Design
- Color-coded cards for different lamb statuses:
  - Live lambs: Blue background (`bg-blue-50`)
  - Stillborn lambs: Gray background (`bg-gray-50`)
- Sex badges:
  - Male: Blue badge (`bg-blue-100 text-blue-700`)
  - Female: Pink badge (`bg-pink-100 text-pink-700`)
- Tag numbers displayed in monospace font for easy reading
- Summary stats in colored cards:
  - Total: Success green (`bg-success-50`)
  - Live: Blue (`bg-blue-50`)
  - Stillborn: Gray (`bg-gray-50`)

#### Bug Fixes
- Fixed type error in `calculateAge` function to accept both `Date` and `string` types
- Removed reference to non-existent `birthWeight` field

## Data Structure

### Lambing Event Payload
The lambing event stores the following information in its `payload` field:

```typescript
{
  maleCount: number,           // Number of live male lambs
  femaleCount: number,         // Number of live female lambs
  stillbornCount: number,      // Number of stillborn lambs
  totalCount: number,          // Total number of lambs
  lambs: [                     // Array of individual lamb details
    {
      tagNumber?: string,      // Tag number (undefined for stillborn)
      sex: 'MALE' | 'FEMALE', // Lamb's sex
      isStillborn: boolean     // Whether the lamb was stillborn
    }
  ],
  notes?: string               // Optional notes about the lambing
}
```

## User Experience

### Before
- Breeding records only showed basic cycle information
- No visibility into lamb details
- Users had to navigate to the animals list to find offspring

### After
- Complete lamb information displayed inline with breeding records
- Easy identification of each lamb with tag numbers
- Quick access to lamb records via "View Animal" links
- Clear visual distinction between live and stillborn lambs
- Summary statistics for quick overview

## Example Display

For a breeding cycle that resulted in 3 lambs (2 live, 1 stillborn):

```
┌─────────────────────────────────────────────────┐
│ LAMBED                     10/15/2024           │
├─────────────────────────────────────────────────┤
│ Insemination Date: 05/18/2024                   │
│ Est. Due Date: 10/15/2024                       │
│ Lambing Date: 10/15/2024                        │
├─────────────────────────────────────────────────┤
│ Lamb Details                                    │
│                                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ Total   │ │ Live    │ │Stillborn│           │
│ │   3     │ │   2     │ │   1     │           │
│ └─────────┘ └─────────┘ └─────────┘           │
│                                                 │
│ Individual Lambs:                               │
│ ┌─────────────────────────────────────────┐   │
│ │ #1  [L001]  Male      View Animal →    │   │
│ └─────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────┐   │
│ │ #2  [L002]  Female    View Animal →    │   │
│ └─────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────┐   │
│ │ #3          Male      Stillborn         │   │
│ └─────────────────────────────────────────┘   │
│                                                 │
│ Notes: Easy lambing, all healthy               │
└─────────────────────────────────────────────────┘
```

## Technical Notes

1. **Performance**: The breeding cycles query is only executed when the breeding tab is active
2. **Data Filtering**: Client-side filtering ensures only relevant cycles are displayed
3. **Type Safety**: All lamb data is properly typed and validated
4. **Responsive Design**: Layout adapts to different screen sizes

## Related Files
- `apps/web/src/app/[locale]/(app)/animals/[id]/page.tsx` - Main implementation
- `apps/web/src/components/RecordLambingModal.tsx` - Modal that creates the lamb data
- `packages/api/src/routers/breeding.ts` - API endpoint that handles lambing events
- `packages/db/prisma/schema.prisma` - Database schema for breeding events

## Testing Recommendations

1. Test with breeding cycles that have:
   - No lambing event yet (PREGNANT status)
   - Multiple live lambs
   - Mix of live and stillborn lambs
   - Only stillborn lambs
   - Lambs with long tag numbers

2. Verify:
   - "View Animal" links work correctly
   - Summary statistics are accurate
   - Visual styling is consistent
   - Mobile responsiveness

## Future Enhancements

Potential improvements for future iterations:
1. Add lamb birth weights if tracked
2. Show lamb health status indicators
3. Display lamb current age/status
4. Add filtering/sorting options for breeding records
5. Export breeding records with lamb details
6. Add photos of lambs to the display

