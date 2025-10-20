-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'WORKER', 'VET');

-- CreateEnum
CREATE TYPE "AnimalType" AS ENUM ('RAM', 'EWE', 'LAMB');

-- CreateEnum
CREATE TYPE "AnimalSex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('ACTIVE', 'SOLD', 'DEAD', 'CULLED');

-- CreateEnum
CREATE TYPE "BreedingCycleStatus" AS ENUM ('OPEN', 'PREGNANT', 'LAMBED', 'FAILED', 'ABORTED');

-- CreateEnum
CREATE TYPE "PregnancyCheckResult" AS ENUM ('POSITIVE', 'NEGATIVE', 'UNCERTAIN');

-- CreateEnum
CREATE TYPE "BreedingEventType" AS ENUM ('INS1', 'INS2', 'CHECK1', 'CHECK2', 'LAMBING', 'LOSS', 'ABORTION');

-- CreateEnum
CREATE TYPE "HealthEventType" AS ENUM ('DIAGNOSIS', 'TREATMENT', 'VACCINE', 'SUPPLEMENT', 'CHECKUP', 'INJURY', 'DEATH');

-- CreateEnum
CREATE TYPE "TreatmentRoute" AS ENUM ('ORAL', 'INJECTION_IM', 'INJECTION_IV', 'INJECTION_SC', 'TOPICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "DoseStatus" AS ENUM ('SCHEDULED', 'GIVEN', 'SKIPPED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "WeightMethod" AS ENUM ('SCALE', 'TAPE', 'VISUAL_ESTIMATE');

-- CreateEnum
CREATE TYPE "LambFeedingMethod" AS ENUM ('NURSING', 'MANUFACTURED');

-- CreateEnum
CREATE TYPE "AnimalSaleType" AS ENUM ('LIVE', 'SLAUGHTER', 'CULL');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('FEED', 'MEDICINE', 'VACCINE', 'SUPPLEMENT', 'EQUIPMENT', 'SUPPLIES', 'OTHER');

-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE');

-- CreateEnum
CREATE TYPE "CostSource" AS ENUM ('BATCH', 'FIFO', 'LAST_KNOWN', 'CATALOG', 'DERIVED', 'FUZZY', 'REFERENCE', 'ZERO');

-- CreateEnum
CREATE TYPE "CostConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "ActionEventType" AS ENUM ('SHEARING', 'SUPPLIER_CHANGE', 'RATION_CHANGE', 'PROTOCOL_SHIFT', 'PEN_MOVE', 'OTHER');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('ADG', 'MILK_YIELD', 'CONCEPTION_RATE', 'SICKNESS_RATE', 'MORTALITY_RATE', 'OTHER');

-- CreateEnum
CREATE TYPE "InsightConfidence" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "InsightStatus" AS ENUM ('ACTIVE', 'CONFIRMED', 'MUTED');

-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('BREEDING_INS2', 'BREEDING_CHECK1', 'BREEDING_CHECK2', 'BREEDING_LAMBING_PREP', 'BREEDING_OVERDUE', 'HEALTH_DOSE_DUE', 'HEALTH_DOSE_OVERDUE', 'INVENTORY_LOW_STOCK', 'INVENTORY_EXPIRY');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'DISMISSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LAMBING', 'PREGNANCY_RESULT', 'DOSE_DUE', 'DOSE_OVERDUE', 'MILK_DISCARDED', 'SALE_POSTED', 'LOW_STOCK', 'EXPIRY_WARNING', 'INSIGHT_GENERATED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farm_members" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farm_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admins" (
    "user_id" TEXT NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "animals" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "tag_number" TEXT NOT NULL,
    "rfid" VARCHAR(15),
    "type" "AnimalType" NOT NULL,
    "sex" "AnimalSex" NOT NULL,
    "status" "AnimalStatus" NOT NULL DEFAULT 'ACTIVE',
    "date_of_birth" TIMESTAMP(3),
    "sire_id" TEXT,
    "dam_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeding_cycles" (
    "id" TEXT NOT NULL,
    "ewe_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "ins1_date" TIMESTAMP(3) NOT NULL,
    "ins2_date" TIMESTAMP(3),
    "check1_date" TIMESTAMP(3),
    "check1_result" "PregnancyCheckResult",
    "check2_date" TIMESTAMP(3),
    "check2_result" "PregnancyCheckResult",
    "conception_date" TIMESTAMP(3),
    "due_start" TIMESTAMP(3),
    "due_end" TIMESTAMP(3),
    "estimated_due" TIMESTAMP(3),
    "status" "BreedingCycleStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeding_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeding_events" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "ewe_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "type" "BreedingEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "payload" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "breeding_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_events" (
    "id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "type" "HealthEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "diagnosis_code" TEXT,
    "payload" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treatments" (
    "id" TEXT NOT NULL,
    "health_event_id" TEXT,
    "animal_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "drug" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "route" "TreatmentRoute" NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "withdrawal_milk_end" TIMESTAMP(3),
    "withdrawal_meat_end" TIMESTAMP(3),
    "lot" TEXT,
    "expiry" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doses" (
    "id" TEXT NOT NULL,
    "treatment_id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "given_at" TIMESTAMP(3),
    "given_by" TEXT,
    "notes" TEXT,
    "status" "DoseStatus" NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weights" (
    "id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "kg" DOUBLE PRECISION NOT NULL,
    "method" "WeightMethod" NOT NULL DEFAULT 'SCALE',
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_plans" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "ratios" JSONB NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feed_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lamb_feedings" (
    "id" TEXT NOT NULL,
    "lamb_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "method" "LambFeedingMethod" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "volume_per_day" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lamb_feedings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milk_yields" (
    "id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milk_yields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milk_sales" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "volume_liters" DOUBLE PRECISION NOT NULL,
    "price_per_liter" DOUBLE PRECISION NOT NULL,
    "buyer_name" TEXT,
    "total_revenue" DOUBLE PRECISION NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "milk_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animal_sales" (
    "id" TEXT NOT NULL,
    "animal_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "AnimalSaleType" NOT NULL,
    "weight_kg" DOUBLE PRECISION,
    "price" DOUBLE PRECISION NOT NULL,
    "buyer_name" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animal_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "unit" TEXT NOT NULL,
    "reorder_level" DOUBLE PRECISION,
    "supplier_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batches" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "batch_code" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit_cost" DOUBLE PRECISION NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "supplier_id" TEXT,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "batch_id" TEXT,
    "cost_value" DOUBLE PRECISION,
    "cost_source" "CostSource",
    "confidence" "CostConfidence",
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_events" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "type" "ActionEventType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "affected_animal_ids" TEXT[],
    "payload" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metric_snapshots" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "metric_type" "MetricType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cohort" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metric_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insight_cards" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "action_event_id" TEXT,
    "title" TEXT NOT NULL,
    "narrative" TEXT NOT NULL,
    "effect_percent" DOUBLE PRECISION,
    "lag_days" INTEGER,
    "window_start" TIMESTAMP(3),
    "window_end" TIMESTAMP(3),
    "confidence" "InsightConfidence" NOT NULL,
    "status" "InsightStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insight_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "type" "ReminderType" NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "target_entity_id" TEXT,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_inbox" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "farm_id" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "target_entity_id" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_inbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tombstones" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_by" TEXT NOT NULL,

    CONSTRAINT "tombstones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "farm_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "farm_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "storage_key" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "farm_members_user_id_idx" ON "farm_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "farm_members_farm_id_user_id_key" ON "farm_members"("farm_id", "user_id");

-- CreateIndex
CREATE INDEX "animals_farm_id_status_idx" ON "animals"("farm_id", "status");

-- CreateIndex
CREATE INDEX "animals_farm_id_type_idx" ON "animals"("farm_id", "type");

-- CreateIndex
CREATE INDEX "animals_farm_id_updated_at_idx" ON "animals"("farm_id", "updated_at");

-- CreateIndex
CREATE INDEX "animals_rfid_idx" ON "animals"("rfid");

-- CreateIndex
CREATE UNIQUE INDEX "animals_farm_id_tag_number_key" ON "animals"("farm_id", "tag_number");

-- CreateIndex
CREATE INDEX "breeding_cycles_farm_id_status_idx" ON "breeding_cycles"("farm_id", "status");

-- CreateIndex
CREATE INDEX "breeding_cycles_farm_id_estimated_due_idx" ON "breeding_cycles"("farm_id", "estimated_due");

-- CreateIndex
CREATE INDEX "breeding_cycles_ewe_id_idx" ON "breeding_cycles"("ewe_id");

-- CreateIndex
CREATE INDEX "breeding_events_farm_id_date_idx" ON "breeding_events"("farm_id", "date");

-- CreateIndex
CREATE INDEX "breeding_events_cycle_id_idx" ON "breeding_events"("cycle_id");

-- CreateIndex
CREATE INDEX "health_events_farm_id_date_idx" ON "health_events"("farm_id", "date");

-- CreateIndex
CREATE INDEX "health_events_animal_id_idx" ON "health_events"("animal_id");

-- CreateIndex
CREATE INDEX "treatments_farm_id_start_date_idx" ON "treatments"("farm_id", "start_date");

-- CreateIndex
CREATE INDEX "treatments_animal_id_idx" ON "treatments"("animal_id");

-- CreateIndex
CREATE INDEX "treatments_withdrawal_milk_end_idx" ON "treatments"("withdrawal_milk_end");

-- CreateIndex
CREATE INDEX "treatments_withdrawal_meat_end_idx" ON "treatments"("withdrawal_meat_end");

-- CreateIndex
CREATE INDEX "doses_animal_id_scheduled_at_idx" ON "doses"("animal_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "doses_status_scheduled_at_idx" ON "doses"("status", "scheduled_at");

-- CreateIndex
CREATE INDEX "weights_farm_id_date_idx" ON "weights"("farm_id", "date");

-- CreateIndex
CREATE INDEX "weights_animal_id_date_idx" ON "weights"("animal_id", "date");

-- CreateIndex
CREATE INDEX "feed_plans_farm_id_idx" ON "feed_plans"("farm_id");

-- CreateIndex
CREATE INDEX "lamb_feedings_lamb_id_idx" ON "lamb_feedings"("lamb_id");

-- CreateIndex
CREATE INDEX "lamb_feedings_farm_id_method_idx" ON "lamb_feedings"("farm_id", "method");

-- CreateIndex
CREATE INDEX "milk_yields_farm_id_at_idx" ON "milk_yields"("farm_id", "at");

-- CreateIndex
CREATE INDEX "milk_yields_animal_id_at_idx" ON "milk_yields"("animal_id", "at");

-- CreateIndex
CREATE INDEX "milk_sales_farm_id_date_idx" ON "milk_sales"("farm_id", "date");

-- CreateIndex
CREATE INDEX "animal_sales_farm_id_date_idx" ON "animal_sales"("farm_id", "date");

-- CreateIndex
CREATE INDEX "animal_sales_animal_id_idx" ON "animal_sales"("animal_id");

-- CreateIndex
CREATE INDEX "inventory_items_farm_id_category_idx" ON "inventory_items"("farm_id", "category");

-- CreateIndex
CREATE INDEX "suppliers_farm_id_idx" ON "suppliers"("farm_id");

-- CreateIndex
CREATE INDEX "inventory_batches_farm_id_item_id_idx" ON "inventory_batches"("farm_id", "item_id");

-- CreateIndex
CREATE INDEX "inventory_batches_expiry_date_idx" ON "inventory_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "inventory_transactions_farm_id_date_idx" ON "inventory_transactions"("farm_id", "date");

-- CreateIndex
CREATE INDEX "inventory_transactions_item_id_date_idx" ON "inventory_transactions"("item_id", "date");

-- CreateIndex
CREATE INDEX "action_events_farm_id_date_idx" ON "action_events"("farm_id", "date");

-- CreateIndex
CREATE INDEX "metric_snapshots_farm_id_metric_type_date_idx" ON "metric_snapshots"("farm_id", "metric_type", "date");

-- CreateIndex
CREATE INDEX "insight_cards_farm_id_status_idx" ON "insight_cards"("farm_id", "status");

-- CreateIndex
CREATE INDEX "reminders_farm_id_status_due_date_idx" ON "reminders"("farm_id", "status", "due_date");

-- CreateIndex
CREATE INDEX "notification_inbox_user_id_read_idx" ON "notification_inbox"("user_id", "read");

-- CreateIndex
CREATE INDEX "notification_inbox_farm_id_created_at_idx" ON "notification_inbox"("farm_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_user_id_idx" ON "device_tokens"("user_id");

-- CreateIndex
CREATE INDEX "tombstones_farm_id_entity_deleted_at_idx" ON "tombstones"("farm_id", "entity", "deleted_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_farm_id_created_at_idx" ON "audit_logs"("farm_id", "created_at");

-- CreateIndex
CREATE INDEX "attachments_farm_id_entity_type_entity_id_idx" ON "attachments"("farm_id", "entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "farm_members" ADD CONSTRAINT "farm_members_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farm_members" ADD CONSTRAINT "farm_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admins" ADD CONSTRAINT "super_admins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_sire_id_fkey" FOREIGN KEY ("sire_id") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "animals" ADD CONSTRAINT "animals_dam_id_fkey" FOREIGN KEY ("dam_id") REFERENCES "animals"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "breeding_cycles" ADD CONSTRAINT "breeding_cycles_ewe_id_fkey" FOREIGN KEY ("ewe_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_cycles" ADD CONSTRAINT "breeding_cycles_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_events" ADD CONSTRAINT "breeding_events_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "breeding_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_events" ADD CONSTRAINT "breeding_events_ewe_id_fkey" FOREIGN KEY ("ewe_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_events" ADD CONSTRAINT "breeding_events_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_events" ADD CONSTRAINT "health_events_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_events" ADD CONSTRAINT "health_events_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_health_event_id_fkey" FOREIGN KEY ("health_event_id") REFERENCES "health_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doses" ADD CONSTRAINT "doses_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doses" ADD CONSTRAINT "doses_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weights" ADD CONSTRAINT "weights_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feed_plans" ADD CONSTRAINT "feed_plans_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lamb_feedings" ADD CONSTRAINT "lamb_feedings_lamb_id_fkey" FOREIGN KEY ("lamb_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lamb_feedings" ADD CONSTRAINT "lamb_feedings_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_yields" ADD CONSTRAINT "milk_yields_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_yields" ADD CONSTRAINT "milk_yields_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milk_sales" ADD CONSTRAINT "milk_sales_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_sales" ADD CONSTRAINT "animal_sales_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "animals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animal_sales" ADD CONSTRAINT "animal_sales_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_events" ADD CONSTRAINT "action_events_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metric_snapshots" ADD CONSTRAINT "metric_snapshots_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_cards" ADD CONSTRAINT "insight_cards_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "insight_cards" ADD CONSTRAINT "insight_cards_action_event_id_fkey" FOREIGN KEY ("action_event_id") REFERENCES "action_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_inbox" ADD CONSTRAINT "notification_inbox_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_inbox" ADD CONSTRAINT "notification_inbox_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tombstones" ADD CONSTRAINT "tombstones_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_farm_id_fkey" FOREIGN KEY ("farm_id") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
