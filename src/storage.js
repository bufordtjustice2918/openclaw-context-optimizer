import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * ContextStorage - SQLite storage for context compression and optimization
 * Handles compression sessions, patterns, quotas, 
 */
export class ContextStorage {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
  }

  /**
   * Initialize database with migrations
   * Run this separately via setup.js
   */
  initialize() {
    // Run core compression schema
    const migration1 = readFileSync(
      join(__dirname, '../migrations/001-init.sql'),
      'utf-8'
    );
    this.db.exec(migration1);

      }

  // ============================================
  // Compression Session Management
  // ============================================

  /**
   * Record a compression session
   * @param {Object} sessionData - Compression session details
   */
  recordCompressionSession(sessionData) {
    const stmt = this.db.prepare(`
      INSERT INTO compression_sessions (
        session_id, agent_wallet, original_tokens, compressed_tokens,
        compression_ratio, tokens_saved, cost_saved_usd, strategy_used,
        quality_score, original_context, compressed_context
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    return stmt.run(
      sessionData.session_id,
      sessionData.agent_wallet || null,
      sessionData.original_tokens,
      sessionData.compressed_tokens,
      sessionData.compression_ratio,
      sessionData.tokens_saved,
      sessionData.cost_saved_usd || 0.0,
      sessionData.strategy_used,
      sessionData.quality_score || 1.0,
      sessionData.original_context || null,
      sessionData.compressed_context || null
    );
  }

  /**
   * Get compression statistics for an agent
   * @param {string} agentWallet - Agent wallet address
   * @param {string} timeframe - SQL timeframe (e.g., '7 days', '1 month')
   */
  getCompressionStats(agentWallet, timeframe = '30 days') {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total_compressions,
        SUM(original_tokens) as total_original_tokens,
        SUM(compressed_tokens) as total_compressed_tokens,
        SUM(tokens_saved) as total_tokens_saved,
        SUM(cost_saved_usd) as total_cost_saved,
        AVG(compression_ratio) as avg_compression_ratio,
        AVG(quality_score) as avg_quality_score
      FROM compression_sessions
      WHERE agent_wallet = ?
        AND timestamp >= datetime('now', '-' || ?)
    `);

    return stmt.get(agentWallet, timeframe);
  }

  /**
   * Get recent compression sessions
   */
  getCompressionSessions(agentWallet, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM compression_sessions
      WHERE agent_wallet = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    return stmt.all(agentWallet, limit);
  }

  /**
   * Get a single compression session
   */
  getCompressionSession(sessionId) {
    const stmt = this.db.prepare(`
      SELECT * FROM compression_sessions WHERE session_id = ?
    `);

    return stmt.get(sessionId);
  }

  // ============================================
  // Pattern Management
  // ============================================

  /**
   * Record a learned pattern
   * @param {Object} patternData - Pattern details
   */
  recordPattern(patternData) {
    const stmt = this.db.prepare(`
      INSERT INTO compression_patterns (
        pattern_id, agent_wallet, pattern_type, pattern_text,
        frequency, token_impact, importance_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(pattern_id) DO UPDATE SET
        frequency = frequency + 1,
        token_impact = excluded.token_impact,
        importance_score = excluded.importance_score,
        last_seen = CURRENT_TIMESTAMP
    `);

    return stmt.run(
      patternData.pattern_id,
      patternData.agent_wallet || null,
      patternData.pattern_type,
      patternData.pattern_text,
      patternData.frequency || 1,
      patternData.token_impact || 0,
      patternData.importance_score || 0.5
    );
  }

  /**
   * Get patterns for an agent
   * @param {string} agentWallet - Agent wallet address
   * @param {string} patternType - Optional pattern type filter
   */
  getPatterns(agentWallet, patternType = null) {
    let query = `
      SELECT * FROM compression_patterns
      WHERE agent_wallet = ?
    `;
    const params = [agentWallet];

    if (patternType) {
      query += ' AND pattern_type = ?';
      params.push(patternType);
    }

    query += ' ORDER BY importance_score DESC, frequency DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  /**
   * Get top patterns by importance
   */
  getTopPatterns(agentWallet, limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM compression_patterns
      WHERE agent_wallet = ?
      ORDER BY importance_score DESC, frequency DESC
      LIMIT ?
    `);

    return stmt.all(agentWallet, limit);
  }

  /**
   * Update pattern importance
   */
  updatePattern(patternId, updates) {
    const fields = [];
    const params = [];

    if (updates.frequency !== undefined) {
      fields.push('frequency = ?');
      params.push(updates.frequency);
    }

    if (updates.token_impact !== undefined) {
      fields.push('token_impact = ?');
      params.push(updates.token_impact);
    }

    if (updates.importance_score !== undefined) {
      fields.push('importance_score = ?');
      params.push(updates.importance_score);
    }

    if (fields.length === 0) {
      throw new Error('No valid update fields provided');
    }

    fields.push('last_seen = CURRENT_TIMESTAMP');
    params.push(patternId);

    const stmt = this.db.prepare(`
      UPDATE compression_patterns
      SET ${fields.join(', ')}
      WHERE pattern_id = ?
    `);

    return stmt.run(...params);
  }

  // ============================================
  // Token Statistics
  // ============================================

  /**
   * Update token statistics (daily aggregation)
   * @param {string} agentWallet - Agent wallet address
   * @param {number} originalTokens - Original token count
   * @param {number} compressedTokens - Compressed token count
   * @param {number} costSaved - Cost saved in USD
   */
  updateTokenStats(agentWallet, originalTokens, compressedTokens, costSaved) {
    const tokensSaved = originalTokens - compressedTokens;
    const compressionRatio = compressedTokens / originalTokens;

    const stmt = this.db.prepare(`
      INSERT INTO token_stats (
        agent_wallet, date, original_tokens, compressed_tokens,
        tokens_saved, cost_saved_usd, compression_count, average_ratio
      ) VALUES (?, DATE('now'), ?, ?, ?, ?, 1, ?)
      ON CONFLICT(agent_wallet, date) DO UPDATE SET
        original_tokens = original_tokens + excluded.original_tokens,
        compressed_tokens = compressed_tokens + excluded.compressed_tokens,
        tokens_saved = tokens_saved + excluded.tokens_saved,
        cost_saved_usd = cost_saved_usd + excluded.cost_saved_usd,
        compression_count = compression_count + 1,
        average_ratio = (compressed_tokens + excluded.compressed_tokens) /
                        (original_tokens + excluded.original_tokens)
    `);

    return stmt.run(
      agentWallet,
      originalTokens,
      compressedTokens,
      tokensSaved,
      costSaved,
      compressionRatio
    );
  }

  /**
   * Get token statistics for an agent
   */
  getTokenStats(agentWallet, days = 30) {
    const stmt = this.db.prepare(`
      SELECT * FROM token_stats
      WHERE agent_wallet = ?
        AND date >= DATE('now', '-' || ? || ' days')
      ORDER BY date DESC
    `);

    return stmt.all(agentWallet, days);
  }

  /**
   * Get total token savings
   */
  getTotalSavings(agentWallet) {
    const stmt = this.db.prepare(`
      SELECT
        SUM(tokens_saved) as total_tokens_saved,
        SUM(cost_saved_usd) as total_cost_saved,
        SUM(compression_count) as total_compressions,
        AVG(average_ratio) as overall_avg_ratio
      FROM token_stats
      WHERE agent_wallet = ?
    `);

    return stmt.get(agentWallet);
  }

  // ============================================
  // Quota Management
  // ============================================

  /**
   * Get agent's compression quota
   */
  getQuota(agentWallet) {
    const stmt = this.db.prepare(`
      SELECT * FROM agent_optimizer_quotas WHERE agent_wallet = ?
    `);
    let quota = stmt.get(agentWallet);

    // Initialize quota if doesn't exist
    if (!quota) {
      quota = this.initializeQuota(agentWallet);
    }

    // Reset daily counter if needed
    quota = this.resetDailyQuotaIfNeeded(quota);

    return quota;
  }

  /**
   * Initialize default quota for new agent
   */
  initializeQuota(agentWallet) {
    const stmt = this.db.prepare(`
      INSERT INTO agent_optimizer_quotas (
        agent_wallet, tier, compression_limit, compressions_today, last_reset_date
      ) VALUES (?, 'free', 100, 0, DATE('now'))
    `);
    stmt.run(agentWallet);

    return this.getQuota(agentWallet);
  }

  /**
   * Reset daily quota if date has changed
   */
  resetDailyQuotaIfNeeded(quota) {
    const today = new Date().toISOString().split('T')[0];

    if (quota.last_reset_date !== today) {
      const stmt = this.db.prepare(`
        UPDATE agent_optimizer_quotas
        SET compressions_today = 0,
            last_reset_date = DATE('now'),
            updated_at = CURRENT_TIMESTAMP
        WHERE agent_wallet = ?
      `);
      stmt.run(quota.agent_wallet);

      // Refresh quota
      return this.db.prepare(`
        SELECT * FROM agent_optimizer_quotas WHERE agent_wallet = ?
      `).get(quota.agent_wallet);
    }

    return quota;
  }

  /**
   * Check if agent has quota available
   * @returns {Object} { available: boolean, remaining: number, limit: number, tier: string }
   */
  checkQuotaAvailable(agentWallet) {
    const quota = this.getQuota(agentWallet);

    // Pro tier has unlimited quota
    if (quota.tier === 'pro' && quota.compression_limit === -1) {
      return {
        available: true,
        remaining: -1,
        limit: -1,
        tier: 'pro'
      };
    }

    const remaining = quota.compression_limit - quota.compressions_today;
    return {
      available: remaining > 0,
      remaining: Math.max(0, remaining),
      limit: quota.compression_limit,
      tier: quota.tier
    };
  }

  /**
   * Update agent quota
   */
  updateQuota(agentWallet, updates) {
    const fields = [];
    const params = [];

    if (updates.compressions_today !== undefined) {
      fields.push('compressions_today = ?');
      params.push(updates.compressions_today);
    }

    if (updates.compression_limit !== undefined) {
      fields.push('compression_limit = ?');
      params.push(updates.compression_limit);
    }

    if (updates.tier !== undefined) {
      fields.push('tier = ?');
      params.push(updates.tier);
    }

    if (updates.paid_until !== undefined) {
      fields.push('paid_until = ?');
      params.push(updates.paid_until);
    }

    if (fields.length === 0) {
      throw new Error('No valid update fields provided');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(agentWallet);

    const stmt = this.db.prepare(`
      UPDATE agent_optimizer_quotas
      SET ${fields.join(', ')}
      WHERE agent_wallet = ?
    `);

    return stmt.run(...params);
  }

  /**
   * Increment compression count for agent
   */
  incrementCompressionCount(agentWallet) {
    const quota = this.getQuota(agentWallet);

    const stmt = this.db.prepare(`
      UPDATE agent_optimizer_quotas
      SET compressions_today = compressions_today + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE agent_wallet = ?
    `);

    return stmt.run(agentWallet);
  }

  /**
   * Update agent tier and paid_until date
   * @param {string} agentWallet - Agent wallet address
   * @param {string} tier - 'free' or 'pro'
   * @param {string} paidUntil - ISO date string
   */
  updateAgentTier(agentWallet, tier, paidUntil) {
    const stmt = this.db.prepare(`
      UPDATE agent_optimizer_quotas
      SET tier = ?,
          paid_until = ?,
          compression_limit = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE agent_wallet = ?
    `);

    // Pro tier gets unlimited compressions
    const compressionLimit = tier === 'pro' ? -1 : 100;

    return stmt.run(tier, paidUntil, compressionLimit, agentWallet);
  }

  // ============================================
}