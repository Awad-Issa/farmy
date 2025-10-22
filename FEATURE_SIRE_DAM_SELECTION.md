# Feature: Sire and Dam Selection

## Overview
Added the ability to select Sire (Father) and Dam (Mother) when creating a new animal in the Add Animal Modal.

## Changes Made

### 1. Updated AddAnimalModal Component
**File:** `apps/web/src/components/AddAnimalModal.tsx`

#### Added State Management
- Added `sireId` and `damId` state variables
- Added `farmId` state to track current farm
- Fetch animals list on component mount for parent selection

#### Added Parent Fetching
```typescript
// Fetch animals for parent selection
const { data: maleAnimals } = trpc.animals.list.useQuery(
  {
    farmId: farmId!,
    limit: 100,
  },
  { enabled: !!farmId }
);

// Filter males and females
const males = maleAnimals?.items?.filter(a => a.sex === 'MALE' && a.status === 'ACTIVE') || [];
const females = maleAnimals?.items?.filter(a => a.sex === 'FEMALE' && a.status === 'ACTIVE') || [];
```

#### Added UI Fields
- **Sire (Father) Dropdown**: Shows only MALE animals that are ACTIVE
- **Dam (Mother) Dropdown**: Shows only FEMALE animals that are ACTIVE
- Both fields are optional
- Display format: `{tagNumber} ({type})`

#### Updated Form Submission
The form now includes `sireId` and `damId` when submitting animal creation:

```typescript
// Add parent IDs if selected
if (sireId) {
  data.sireId = sireId;
}

if (damId) {
  data.damId = damId;
}
```

## Features

### Parent Selection
1. **Filtered Lists**: 
   - Sire dropdown only shows MALE animals
   - Dam dropdown only shows FEMALE animals
   - Only ACTIVE status animals are shown

2. **Optional Fields**: Both Sire and Dam are optional - users can create animals without parent information

3. **Clear Labels**: Helper text explains what each field is for

4. **Form Reset**: Parent selections are properly cleared when form is reset

## Backend Support

The backend already supported this feature:
- ✅ Database schema has `sireId` and `damId` fields
- ✅ API accepts parent IDs in create/update mutations
- ✅ Validators include parent ID validation
- ✅ Animal detail page displays parent information

## User Flow

1. User clicks "Add Animal" button
2. Modal opens with the animal creation form
3. User fills in basic information (Tag Number, Type, Sex, etc.)
4. **NEW**: User can optionally select:
   - A Sire (Father) from dropdown of male animals
   - A Dam (Mother) from dropdown of female animals
5. User submits form
6. Animal is created with parent relationships
7. Parents are visible on the animal detail page

## Technical Details

### Form Fields Order
1. Tag Number (required)
2. RFID (optional)
3. Type (required)
4. Sex (required)
5. Birth Date (optional)
6. **Sire - Father (optional)** ← NEW
7. **Dam - Mother (optional)** ← NEW

### Data Flow
```
User Selection → Form State (sireId/damId) → Mutation Payload → API → Database
```

### Display Format
Parents are shown in dropdowns as: `{tagNumber} ({type})`
- Example: "R001 (RAM)" or "E042 (EWE)"

## Benefits

1. **Complete Lineage Tracking**: Users can now track complete family trees
2. **Breeding Records**: Essential for breeding program management
3. **Genetic Information**: Helps track genetic lines and avoid inbreeding
4. **Historical Data**: Important for lamb registration and pedigree tracking

## Future Enhancements

Potential improvements:
1. Add search functionality to parent dropdowns for farms with many animals
2. Show parent details (age, breed) in dropdown
3. Add validation to prevent circular parent relationships
4. Add "Add New" button to quickly create parent animals
5. Show offspring count for potential parents
6. Add edit functionality to update parents on existing animals

## Testing Checklist

- ✅ Form displays Sire and Dam dropdowns
- ✅ Dropdowns are properly filtered by sex
- ✅ Dropdowns only show ACTIVE animals
- ✅ Form submission includes parent IDs
- ✅ Form reset clears parent selections
- ✅ Parents are optional (form works without them)
- ✅ No linter errors
- ✅ Data is saved to database correctly
- ⏳ Manual testing with real farm data (recommended)

## Related Files

- `apps/web/src/components/AddAnimalModal.tsx` - Main component updated
- `packages/validators/src/animal.ts` - Already has parent ID validation
- `packages/api/src/routers/animals.ts` - Backend router (no changes needed)
- `packages/db/prisma/schema.prisma` - Database schema (already had fields)
- `apps/web/src/app/[locale]/(app)/animals/[id]/page.tsx` - Displays parent info

## Completion Date
October 22, 2025

## Status
✅ **COMPLETE** - Feature is fully implemented and ready for use

