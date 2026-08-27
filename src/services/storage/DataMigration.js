

export const CURRENT_SCHEMA_VERSION = 1;

/**
 * Migration Engine for Schema Versioning
 * Upgrades old saved data formats automatically if new fields are added in future app updates.
 */
export function migrateData(rawPayload) {
  const version = typeof rawPayload.version === 'number' ? rawPayload.version : 1;

  let payload = {
    version: CURRENT_SCHEMA_VERSION,
    inventory: Array.isArray(rawPayload.inventory) ? (rawPayload.inventory ) : [],
    recipes: Array.isArray(rawPayload.recipes) ? (rawPayload.recipes ) : [],
    orders: Array.isArray(rawPayload.orders) ? (rawPayload.orders ) : [],
    settings: (rawPayload.settings ) || {
      currencySymbol: '₱',
      defaultLaborRate: 150,
      defaultOverheadCost: 40.0,
      defaultProfitMargin: 55,
      businessName: "Gene's Bakery",
      ownerName: 'Gene',
      theme: 'light',
      schemaVersion: CURRENT_SCHEMA_VERSION,
    },
  };

  if (version < CURRENT_SCHEMA_VERSION) {
    payload.version = CURRENT_SCHEMA_VERSION;
  }

  return payload;
}
