import { PowerSyncDatabase } from '@powersync/web';
import { Kysely } from 'kysely';
import { PowerSyncKyselyDatabase } from '@powersync/kysely-driver';

export const db = new PowerSyncDatabase({
  database: {
    dbFilename: 'streamattention.db',
    tables: {}, // Will be populated from sync rules
  },
});

// Optional: Kysely for type-safe queries
export const kysely = new Kysely<any>({
  dialect: new PowerSyncKyselyDatabase(db),
});
