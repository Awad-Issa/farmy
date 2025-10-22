# Feature: Manual Lamb Tag Number Entry

## Overview
This feature allows users to manually enter tag numbers for each lamb when recording a lambing event, instead of having the system auto-generate them. This provides more flexibility and control over the naming/numbering scheme used by the farm.

## Changes Made

### Frontend Changes

#### RecordLambingModal.tsx - Complete Redesign
**Location:** `apps/web/src/components/RecordLambingModal.tsx`

**Previous Behavior:**
- Users entered counts for male, female, and stillborn lambs
- System auto-generated tag numbers (L001, L002, etc.)
- No individual lamb details could be specified

**New Behavior:**
- Users add individual lambs one by one
- Each lamb has:
  - **Tag Number** (required for live lambs, user-provided)
  - **Sex** (MALE/FEMALE dropdown)
  - **Stillborn checkbox** (if checked, no tag number needed)
- Add/Remove lamb buttons for dynamic list management
- Real-time validation:
  - Tag numbers required for all live lambs
  - Duplicate tag number detection
  - Summary showing total, live, and stillborn counts

**UI Features:**
- "Add Lamb" button to add new lamb entries
- Individual lamb cards with remove button
- Tag number input field (disabled for stillborn lambs)
- Sex dropdown selector
- Stillborn checkbox (clears tag number when checked)
- Summary panel showing counts
- Validation messages for errors

### Backend Changes

#### breeding.ts Router - Lamb Creation Logic
**Location:** `packages/api/src/routers/breeding.ts`

**Previous Behavior:**
- Auto-generated sequential tag numbers (L001, L002, etc.)
- Created lambs based on counts (maleCount, femaleCount)
- No individual lamb data

**New Behavior:**
- Reads lamb details from `payload.lambs` array
- Each lamb object contains:
  ```typescript
  {
    tagNumber: string,    // User-provided tag number
    sex: 'MALE' | 'FEMALE',
    isStillborn: boolean
  }
  ```
- Validates each tag number:
  - Checks if tag number is provided for live lambs
  - Checks for duplicate tag numbers in database
  - Returns error if tag already exists
- Creates Animal records only for live lambs (skips stillborn)
- Links lambs to dam (mother ewe) and sire (father ram if known)
- Creates audit log entries for each lamb
- Stores created lamb IDs and tag numbers back in event payload

**Validation:**
1. **Tag Number Required:** All live lambs must have a tag number
2. **Duplicate Detection:** Tag numbers must be unique within the farm
3. **Stillborn Handling:** Stillborn lambs are counted but not created as animals

## Data Flow

```
User Interface
  ↓
1. User clicks "Add Lamb" for each lamb
2. User enters tag number (e.g., "L001", "LAMB-2024-001")
3. User selects sex (MALE/FEMALE)
4. User checks "Stillborn" if applicable
5. User clicks "Record Lambing"
  ↓
Frontend Validation
  ↓
- Check all live lambs have tag numbers
- Check for duplicate tag numbers in form
  ↓
API Request (breeding.events.create)
  ↓
Backend Processing
  ↓
1. Validate tag numbers
2. Check database for existing tag numbers
3. Get sire ID from insemination event
4. Create Animal record for each live lamb
5. Create audit log for each lamb
6. Update event payload with created lamb IDs
  ↓
Database Updated
  ↓
Frontend Refreshes
  ↓
Lambs appear in Animals list
```

## Payload Structure

### Frontend Sends:
```json
{
  "farmId": "uuid",
  "cycleId": "uuid",
  "eweId": "uuid",
  "type": "LAMBING",
  "date": "2024-10-22T00:00:00.000Z",
  "payload": {
    "maleCount": 2,
    "femaleCount": 1,
    "stillbornCount": 1,
    "totalCount": 4,
    "lambs": [
      {
        "tagNumber": "L001",
        "sex": "MALE",
        "isStillborn": false
      },
      {
        "tagNumber": "L002",
        "sex": "MALE",
        "isStillborn": false
      },
      {
        "tagNumber": "L003",
        "sex": "FEMALE",
        "isStillborn": false
      },
      {
        "sex": "FEMALE",
        "isStillborn": true
      }
    ],
    "notes": "Optional notes"
  }
}
```

### Backend Updates Payload:
```json
{
  "payload": {
    "maleCount": 2,
    "femaleCount": 1,
    "stillbornCount": 1,
    "totalCount": 4,
    "lambs": [...],
    "notes": "Optional notes",
    "lambIds": ["uuid1", "uuid2", "uuid3"],
    "lambTagNumbers": ["L001", "L002", "L003"]
  }
}
```

## User Experience

### Before
1. Enter counts: 2 males, 1 female, 1 stillborn
2. Click "Record Lambing"
3. System creates lambs with auto-generated tags (L001, L002, L003)
4. User has no control over tag numbers

### After
1. Click "Add Lamb" button
2. Enter tag number: "L001"
3. Select sex: "Male"
4. Click "Add Lamb" again
5. Enter tag number: "L002"
6. Select sex: "Male"
7. Click "Add Lamb" again
8. Enter tag number: "L003"
9. Select sex: "Female"
10. Click "Add Lamb" again
11. Select sex: "Female"
12. Check "Stillborn" checkbox
13. Click "Record Lambing"
14. System creates 3 lambs (L001, L002, L003) and counts 1 stillborn

### Benefits
- **Flexibility:** Use any tag numbering scheme (L001, LAMB-001, 2024-L-001, etc.)
- **Control:** Match existing farm numbering conventions
- **Accuracy:** Enter exact tag numbers as they appear on physical tags
- **Traceability:** Better tracking with meaningful tag numbers
- **Validation:** Immediate feedback on duplicate or missing tag numbers

## Validation & Error Handling

### Frontend Validation
1. **Empty Tag Numbers:** "All live lambs must have a tag number"
2. **Duplicate Tags in Form:** "Duplicate tag numbers are not allowed"
3. **No Lambs Added:** "Please add at least one lamb"
4. **Missing Date:** "Lambing date is required"

### Backend Validation
1. **Tag Number Missing:** 
   ```
   Error: "All live lambs must have a tag number"
   Code: BAD_REQUEST
   ```

2. **Tag Number Already Exists:**
   ```
   Error: "Tag number L001 already exists"
   Code: CONFLICT
   ```

## Database Schema

No changes to database schema required. Uses existing Animal model:

```prisma
model Animal {
  id        String       @id @default(uuid())
  farmId    String       @map("farm_id")
  tagNumber String       @map("tag_number")
  type      AnimalType   // LAMB
  sex       AnimalSex    // MALE or FEMALE
  status    AnimalStatus @default(ACTIVE)
  dob       DateTime?    @map("date_of_birth")
  sireId    String?      @map("sire_id")
  damId     String?      @map("dam_id")
  
  @@unique([farmId, tagNumber])
}
```

## Testing Checklist

- [x] Add individual lambs with custom tag numbers
- [x] Remove lambs from the list
- [x] Mark lambs as stillborn (tag number not required)
- [x] Validate duplicate tag numbers in form
- [x] Validate empty tag numbers for live lambs
- [x] Backend validates tag number uniqueness in database
- [x] Created lambs appear in Animals list with correct tag numbers
- [x] Lambs linked to correct dam (mother ewe)
- [x] Lambs linked to correct sire (father ram) if available
- [x] Stillborn lambs counted but not created as animals
- [x] Audit logs created for each lamb
- [x] Event payload updated with created lamb IDs

## Future Enhancements

1. **Tag Number Suggestions:** Auto-suggest next available tag number
2. **Bulk Import:** Import lamb details from CSV/Excel
3. **Tag Number Validation Rules:** Custom regex patterns per farm
4. **Birth Weight Entry:** Add birth weight field for each lamb
5. **Photo Upload:** Attach photos to individual lambs
6. **Twin/Triplet Marking:** Mark which lambs are from same birth
7. **Quick Copy:** Duplicate lamb details for faster entry
8. **Tag Number Templates:** Predefined formats (e.g., YYYY-MM-###)

## Migration Notes

### Backward Compatibility
- Old lambing events (with auto-generated tags) remain valid
- New events use the manual tag number system
- Both payload formats are supported:
  - Old: `{ maleCount, femaleCount, stillbornCount }`
  - New: `{ lambs: [...], maleCount, femaleCount, stillbornCount }`

### No Data Migration Required
- Existing lambing events work as-is
- No database changes needed
- No breaking changes to API

## Related Files

### Modified Files
- `apps/web/src/components/RecordLambingModal.tsx` - Complete redesign
- `packages/api/src/routers/breeding.ts` - Updated lamb creation logic

### Related Files (No Changes)
- `apps/web/src/app/[locale]/(app)/breeding/page.tsx` - Uses the modal
- `packages/validators/src/breeding.ts` - Payload validation (flexible schema)
- `packages/db/prisma/schema.prisma` - No schema changes

## Conclusion

This feature provides farmers with complete control over lamb tag numbers while maintaining data integrity through validation. The system is more flexible and matches real-world farm practices where tag numbers may follow specific conventions or patterns.

Key improvements:
1. ✅ Manual tag number entry
2. ✅ Individual lamb details
3. ✅ Duplicate detection
4. ✅ Stillborn handling
5. ✅ Better UX with add/remove functionality
6. ✅ Comprehensive validation
7. ✅ Backward compatible

