# Bug Fix: Lamb Breeding Restriction & Automatic Lamb Creation

## Overview
This document describes the fixes implemented to address two critical issues in the breeding system:
1. **Lambs cannot breed** - Only ewes should be able to breed, not lambs
2. **Automatic lamb creation** - When a ewe lambs, the system should automatically create lamb animal records

## Issues Fixed

### Issue 1: Lambs Were Allowed to Breed
**Problem:** The breeding modal was allowing both EWE and LAMB types to be selected for breeding, which is biologically incorrect. Only mature ewes should breed.

**Solution:**
- Updated `AddBreedingModal.tsx` to filter only EWE type animals (line 43-46)
- Backend already had validation in place (`breeding.ts` line 106) to ensure only EWEs can breed

**Files Changed:**
- `apps/web/src/components/AddBreedingModal.tsx`

### Issue 2: Lambs Not Created When Lambing Recorded
**Problem:** When recording a lambing event, only the counts were stored in the payload, but no actual lamb Animal records were created in the database. This meant lambs didn't appear in the animals list.

**Solution:**
- Modified the breeding event creation endpoint to automatically create lamb Animal records when a LAMBING event is recorded
- Lambs are created with:
  - Auto-generated tag numbers (L001, L002, L003, etc.)
  - Proper type (LAMB)
  - Correct sex (MALE/FEMALE based on counts)
  - Birth date (lambing date)
  - Dam ID (mother ewe)
  - Sire ID (father ram, if available from insemination event)
  - Active status
- Stillborn lambs are NOT created as animal records (only counted)
- Created lamb IDs and tag numbers are stored back in the event payload for reference

**Files Changed:**
- `packages/api/src/routers/breeding.ts` (lines 247-357)
- `apps/web/src/components/RecordLambingModal.tsx` (updated info message)

## Implementation Details

### Automatic Lamb Creation Logic

When a LAMBING event is created, the system:

1. **Retrieves breeding cycle information** to find the sire (ram) from the insemination event
2. **Generates sequential tag numbers** starting from the last lamb (L001, L002, etc.)
3. **Creates male lambs** based on `maleCount` in the payload
4. **Creates female lambs** based on `femaleCount` in the payload
5. **Links parentage** - sets damId (mother) and sireId (father if available)
6. **Updates the event payload** with the created lamb IDs and tag numbers for tracking

### Tag Number Generation
- Format: `L###` (e.g., L001, L002, L003)
- Sequential numbering based on existing lambs in the farm
- Automatically finds the next available number

### Data Flow

```
User Records Lambing
  ↓
RecordLambingModal (Frontend)
  ↓
breeding.events.create (API)
  ↓
1. Create BreedingEvent record
2. Update BreedingCycle status to 'LAMBED'
3. Fetch breeding cycle with insemination events
4. Extract sire ID from insemination payload
5. Generate tag numbers for lambs
6. Create Animal records for each live lamb
7. Update event payload with lamb IDs
  ↓
Animals appear in Animals list automatically
```

## User Experience Improvements

### Before
- Users had to manually add each lamb after recording lambing
- No automatic linking between lambing events and lamb animals
- Risk of forgetting to add lambs or incorrect parentage

### After
- Lambs are automatically created when lambing is recorded
- Proper parentage (dam and sire) is automatically set
- Tag numbers are auto-generated sequentially
- User sees confirmation message: "✓ Automatic Creation: X lambs will be automatically created in the Animals section with tag numbers (L001, L002, etc.) and linked to this ewe as their dam."

## Testing Checklist

- [x] Only EWEs can be selected in the breeding modal
- [x] LAMBs do not appear in the breeding ewe selection dropdown
- [x] Recording lambing with male lambs creates MALE LAMB animals
- [x] Recording lambing with female lambs creates FEMALE LAMB animals
- [x] Stillborn lambs are counted but NOT created as animals
- [x] Created lambs have correct tag numbers (L001, L002, etc.)
- [x] Created lambs have correct birth date (lambing date)
- [x] Created lambs are linked to the ewe as dam
- [x] Created lambs are linked to the ram as sire (if available)
- [x] Created lambs appear in the Animals list immediately
- [x] Created lamb IDs are stored in the breeding event payload
- [x] Animals list invalidation triggers refresh after lambing

## Database Schema

No database schema changes were required. The existing Animal model already supports:
- `type: LAMB` (AnimalType enum)
- `damId` (mother reference)
- `sireId` (father reference)
- `dob` (date of birth)

## API Changes

### Modified Endpoint
**`breeding.events.create`** (mutation)
- Added automatic lamb creation logic for LAMBING events
- No breaking changes to the API contract
- Payload structure remains the same, with additional fields added:
  - `lambIds: string[]` - IDs of created lamb animals
  - `lambTagNumbers: string[]` - Tag numbers of created lambs

## Future Enhancements

Potential improvements for future iterations:
1. Allow custom tag numbers for lambs during lambing recording
2. Record birth weight for each lamb during lambing
3. Support for twin/triplet identification
4. Automatic reminder creation for lamb weaning
5. Lamb health check reminders at key milestones
6. Option to edit lamb details immediately after creation

## Related Files

### Frontend
- `apps/web/src/components/AddBreedingModal.tsx` - Breeding cycle creation
- `apps/web/src/components/RecordLambingModal.tsx` - Lambing event recording
- `apps/web/src/app/[locale]/(app)/breeding/page.tsx` - Breeding page (uses modals)
- `apps/web/src/app/[locale]/(app)/animals/page.tsx` - Animals list page

### Backend
- `packages/api/src/routers/breeding.ts` - Breeding router with lamb creation logic
- `packages/api/src/routers/animals.ts` - Animal CRUD operations
- `packages/validators/src/breeding.ts` - Breeding validation schemas
- `packages/validators/src/animal.ts` - Animal validation schemas

### Database
- `packages/db/prisma/schema.prisma` - Database schema (no changes)

## Conclusion

These fixes ensure that:
1. Only biologically appropriate animals (ewes) can breed
2. Lambs are automatically created with proper data when lambing is recorded
3. The system maintains accurate parentage tracking
4. Users have a seamless experience without manual data entry

The implementation follows the existing patterns in the codebase and doesn't introduce breaking changes.

