/**
 * RBAC (Role-Based Access Control) utilities
 * 
 * Roles hierarchy:
 * - OWNER: Full access to farm (owner can delete farm)
 * - ADMIN: Full access except farm deletion
 * - WORKER: Can perform daily operations (add animals, record events)
 * - VET: Can view animals and add health records only
 */

import { Role } from '@farmy/validators';

/**
 * Permission types
 */
export enum Permission {
  // Farm management
  FARM_VIEW = 'farm:view',
  FARM_UPDATE = 'farm:update',
  FARM_DELETE = 'farm:delete',
  FARM_MANAGE_MEMBERS = 'farm:manage_members',

  // Animals
  ANIMAL_VIEW = 'animal:view',
  ANIMAL_CREATE = 'animal:create',
  ANIMAL_UPDATE = 'animal:update',
  ANIMAL_DELETE = 'animal:delete',

  // Breeding
  BREEDING_VIEW = 'breeding:view',
  BREEDING_CREATE = 'breeding:create',
  BREEDING_UPDATE = 'breeding:update',
  BREEDING_DELETE = 'breeding:delete',

  // Health
  HEALTH_VIEW = 'health:view',
  HEALTH_CREATE = 'health:create',
  HEALTH_UPDATE = 'health:update',
  HEALTH_DELETE = 'health:delete',

  // Weights & Feed
  WEIGHT_VIEW = 'weight:view',
  WEIGHT_CREATE = 'weight:create',
  WEIGHT_UPDATE = 'weight:update',
  WEIGHT_DELETE = 'weight:delete',

  // Milk & Sales
  MILK_VIEW = 'milk:view',
  MILK_CREATE = 'milk:create',
  MILK_UPDATE = 'milk:update',
  MILK_DELETE = 'milk:delete',

  SALES_VIEW = 'sales:view',
  SALES_CREATE = 'sales:create',
  SALES_UPDATE = 'sales:update',
  SALES_DELETE = 'sales:delete',

  // Inventory
  INVENTORY_VIEW = 'inventory:view',
  INVENTORY_CREATE = 'inventory:create',
  INVENTORY_UPDATE = 'inventory:update',
  INVENTORY_DELETE = 'inventory:delete',

  // Insights
  INSIGHTS_VIEW = 'insights:view',

  // Reports
  REPORTS_VIEW = 'reports:view',
  REPORTS_EXPORT = 'reports:export',
}

/**
 * Role permissions map
 */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  OWNER: [
    // Full access to everything
    Permission.FARM_VIEW,
    Permission.FARM_UPDATE,
    Permission.FARM_DELETE,
    Permission.FARM_MANAGE_MEMBERS,
    Permission.ANIMAL_VIEW,
    Permission.ANIMAL_CREATE,
    Permission.ANIMAL_UPDATE,
    Permission.ANIMAL_DELETE,
    Permission.BREEDING_VIEW,
    Permission.BREEDING_CREATE,
    Permission.BREEDING_UPDATE,
    Permission.BREEDING_DELETE,
    Permission.HEALTH_VIEW,
    Permission.HEALTH_CREATE,
    Permission.HEALTH_UPDATE,
    Permission.HEALTH_DELETE,
    Permission.WEIGHT_VIEW,
    Permission.WEIGHT_CREATE,
    Permission.WEIGHT_UPDATE,
    Permission.WEIGHT_DELETE,
    Permission.MILK_VIEW,
    Permission.MILK_CREATE,
    Permission.MILK_UPDATE,
    Permission.MILK_DELETE,
    Permission.SALES_VIEW,
    Permission.SALES_CREATE,
    Permission.SALES_UPDATE,
    Permission.SALES_DELETE,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.INSIGHTS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
  ],
  ADMIN: [
    // Full access except farm deletion
    Permission.FARM_VIEW,
    Permission.FARM_UPDATE,
    Permission.FARM_MANAGE_MEMBERS,
    Permission.ANIMAL_VIEW,
    Permission.ANIMAL_CREATE,
    Permission.ANIMAL_UPDATE,
    Permission.ANIMAL_DELETE,
    Permission.BREEDING_VIEW,
    Permission.BREEDING_CREATE,
    Permission.BREEDING_UPDATE,
    Permission.BREEDING_DELETE,
    Permission.HEALTH_VIEW,
    Permission.HEALTH_CREATE,
    Permission.HEALTH_UPDATE,
    Permission.HEALTH_DELETE,
    Permission.WEIGHT_VIEW,
    Permission.WEIGHT_CREATE,
    Permission.WEIGHT_UPDATE,
    Permission.WEIGHT_DELETE,
    Permission.MILK_VIEW,
    Permission.MILK_CREATE,
    Permission.MILK_UPDATE,
    Permission.MILK_DELETE,
    Permission.SALES_VIEW,
    Permission.SALES_CREATE,
    Permission.SALES_UPDATE,
    Permission.SALES_DELETE,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INVENTORY_DELETE,
    Permission.INSIGHTS_VIEW,
    Permission.REPORTS_VIEW,
    Permission.REPORTS_EXPORT,
  ],
  WORKER: [
    // Daily operations
    Permission.FARM_VIEW,
    Permission.ANIMAL_VIEW,
    Permission.ANIMAL_CREATE,
    Permission.ANIMAL_UPDATE,
    Permission.BREEDING_VIEW,
    Permission.BREEDING_CREATE,
    Permission.BREEDING_UPDATE,
    Permission.HEALTH_VIEW,
    Permission.HEALTH_CREATE,
    Permission.WEIGHT_VIEW,
    Permission.WEIGHT_CREATE,
    Permission.MILK_VIEW,
    Permission.MILK_CREATE,
    Permission.SALES_VIEW,
    Permission.SALES_CREATE,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_CREATE,
    Permission.INVENTORY_UPDATE,
    Permission.INSIGHTS_VIEW,
    Permission.REPORTS_VIEW,
  ],
  VET: [
    // Health-focused access
    Permission.FARM_VIEW,
    Permission.ANIMAL_VIEW,
    Permission.BREEDING_VIEW,
    Permission.HEALTH_VIEW,
    Permission.HEALTH_CREATE,
    Permission.HEALTH_UPDATE,
    Permission.WEIGHT_VIEW,
    Permission.REPORTS_VIEW,
  ],
};

/**
 * Check if a role has a specific permission
 * 
 * @param role - User's role in the farm
 * @param permission - Permission to check
 * @returns boolean - True if role has permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Check if a role can perform an action (simplified permission check)
 * 
 * @param role - User's role in the farm
 * @param resource - Resource type (e.g., 'animal', 'breeding')
 * @param action - Action type (e.g., 'create', 'update', 'delete')
 * @returns boolean - True if role can perform action
 */
export function canPerformAction(
  role: Role,
  resource: string,
  action: 'view' | 'create' | 'update' | 'delete'
): boolean {
  const permissionKey =
    `${resource}:${action}`.toUpperCase() as unknown as Permission;
  return hasPermission(role, permissionKey);
}

/**
 * Get all permissions for a role
 * 
 * @param role - User's role
 * @returns Permission[] - Array of permissions
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role is at least as powerful as another role
 * 
 * @param role - Role to check
 * @param requiredRole - Required role level
 * @returns boolean - True if role is >= required role
 */
export function isAtLeast(role: Role, requiredRole: Role): boolean {
  const hierarchy: Record<Role, number> = {
    OWNER: 4,
    ADMIN: 3,
    WORKER: 2,
    VET: 1,
  };

  return hierarchy[role] >= hierarchy[requiredRole];
}

