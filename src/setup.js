import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { ContextStorage } from './storage.js';

/**
 * OpenClaw Context Optimizer - Database Setup Script
 *
 * Initializes the SQLite database with:
 * - Core compression tables (001-init.sql)
 * - WAL mode for better concurrency
 */

async function setup() {
  console.log('\n🔧 OpenClaw Context Optimizer - Database Setup\n');

  try {
    // 1. Determine data directory
      || join(homedir(), '.openclaw', 'openclaw-context-optimizer');

    console.log(`📁 Data directory: ${dataDir}`);

    // 2. Create data directory if it doesn't exist
    if (!existsSync(dataDir)) {
      console.log('   Creating data directory...');
      mkdirSync(dataDir, { recursive: true });
      console.log('   ✅ Directory created');
    } else {
      console.log('   ✅ Directory exists');
    }

    // 3. Initialize database
    const dbPath = join(dataDir, 'context-optimizer.db');
    console.log(`\n💾 Database path: ${dbPath}`);

    const storage = new ContextStorage(dbPath);

    // 4. Run migrations
    console.log('\n🔧 Running migrations...');

    console.log('   [1/2] Creating compression tables (001-init.sql)...');

    storage.initialize();

    console.log('   ✅ All migrations completed');

    // 5. Verify setup
    console.log('\n🔍 Verifying database setup...');

    const tables = storage.db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `).all();

    console.log(`   ✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`      - ${table.name}`);
    });

    // 6. Display schema info
    console.log('\n📊 Database Configuration:');
    console.log(`   Journal Mode: ${storage.db.pragma('journal_mode', { simple: true })}`);
    console.log(`   Page Size: ${storage.db.pragma('page_size', { simple: true })} bytes`);
    console.log(`   Encoding: ${storage.db.pragma('encoding', { simple: true })}`);

    // 7. Display features
    console.log('\n🎯 Context Optimizer Features:');
    console.log('   ✅ Context compression (summary, dedup, prune, hybrid)');
    console.log('   ✅ Token usage tracking & savings analytics');
    console.log('   ✅ Pattern learning (redundant/high-value detection)');
    console.log('   ✅ Quality feedback & adaptive optimization');

    // 8. Display pricing
    console.log('\n💰 Pricing:');

    // 9. Display usage examples
    console.log('\n📚 Usage:');
    console.log('   Import: import { ContextStorage } from "openclaw-context-optimizer";');
    console.log('   Create: const storage = new ContextStorage(dbPath);');
    console.log('   Compress: storage.recordCompressionSession({ session_id, ... });');
    console.log('   Stats: storage.getCompressionStats(agentWallet, "7 days");');
    console.log('   Quota: storage.checkQuotaAvailable(agentWallet);');
    console.log('   Patterns: storage.getPatterns(agentWallet, "high_value");');

    // 10. Close database
    storage.close();

    console.log('\n✅ Setup complete! Context Optimizer is ready to use.\n');
    console.log(`📂 Database location: ${dbPath}`);
    console.log(`🌐 Data directory: ${dataDir}\n`);

    return {
      success: true,
      dbPath,
      dataDir,
      tables: tables.map(t => t.name)
    };

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error.stack);
  }
}

// Run setup if called directly
  setup().catch(error => {
    console.error('Setup error:', error);
  });
}

export { setup };
