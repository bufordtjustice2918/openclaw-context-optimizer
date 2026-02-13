# Agent Economy Guide - Context Optimizer

**How autonomous agents evaluate, subscribe to, and pay for Context Optimizer Pro using the x402 protocol.**

---

## Overview

Context Optimizer is designed for **economic agents** - AI agents that autonomously reduce token costs through intelligent compression and evaluate tools based on measurable ROI.

This document explains:
1. How agents measure token usage and compression savings
2. How agents calculate Context Optimizer Pro ROI
3. How payment delegation works
4. Autonomous subscription decision logic

---

## The Token Cost Problem

### Without Compression
```
Agent handles 100 requests/day
Average context: 50,000 tokens
Total input tokens: 5,000,000 tokens/day
Token cost: $0.003/1K tokens
Daily cost: $15
Monthly cost: $450
```

### With Context Optimizer (40-60% Savings)
```
Same 100 requests/day
Compressed context: 22,500 tokens (55% reduction)
Total input tokens: 2,250,000 tokens/day
Daily cost: $6.75
Monthly cost: $202.50
Savings: $247.50/month
Context Optimizer Pro: $0.50/month
Net savings: $247/month
ROI: 494x ✅
```

---

## How Agents Calculate ROI

### Step 1: Measure Baseline Token Usage

```javascript
async function measureBaselineTokens() {
  // Track for 7 days without compression
  const usage = await trackTokenUsage(7 * 24 * 60 * 60 * 1000);

  return {
    totalRequests: 700,
    totalInputTokens: 35_000_000,    // 35M tokens
    totalOutputTokens: 7_000_000,    // 7M tokens
    totalTokens: 42_000_000,
    avgContextSize: 50_000,
    dailyCost: 15.00,
    monthlyCost: 450.00
  };
}
```

### Step 2: Test Compression (Free Tier)

```javascript
async function testCompression() {
  // Try Context Optimizer free tier (100 compressions/day)
  const baseline = await measureBaselineTokens();
  const compressed = await compressContexts(baseline.requests);

  // Calculate compression ratio
  const originalSize = baseline.totalInputTokens;
  const compressedSize = compressed.totalInputTokens;
  const reduction = ((originalSize - compressedSize) / originalSize) * 100;

  return {
    originalTokens: originalSize,
    compressedTokens: compressedSize,
    reduction: reduction,          // 55%
    tokensSaved: originalSize - compressedSize,
    costSavings: calculateSavings(originalSize - compressedSize)
  };
}
```

### Step 3: Project Pro Tier ROI

```javascript
async function calculateProROI() {
  const baseline = await measureBaselineTokens();
  const compression = await testCompression();

  // Check if free tier sufficient
  const dailyRequests = baseline.totalRequests / 7;
  const needsPro = dailyRequests > 100; // Free tier limit

  if (!needsPro) {
    return {
      decision: 'free_tier_sufficient',
      savings: compression.costSavings * 30, // Monthly
      cost: 0,
      roi: Infinity
    };
  }

  // Calculate Pro tier ROI
  const monthlySavings = compression.costSavings * 30;
  const proCost = 0.50;
  const netSavings = monthlySavings - proCost;
  const roi = netSavings / proCost;

  return {
    decision: roi >= 10 ? 'subscribe_pro' : 'stay_free',
    monthlySavings,
    proCost,
    netSavings,
    roi,
    details: {
      baselineMonthly: baseline.monthlyCost,
      optimizedMonthly: baseline.monthlyCost - monthlySavings,
      reductionPercent: compression.reduction,
      tokensSavedPerMonth: compression.tokensSaved * 30
    }
  };
}
```

---

## Compression Strategies & Agent Learning

Context Optimizer uses multiple strategies that agents can learn from:

### Strategy 1: Deduplication (15-25% savings)
```javascript
// Remove redundant information
const original = `
User preferences: dark mode, 14pt font
User preferences: dark mode
User settings: dark mode enabled, font size 14
`;

const deduplicated = `
User preferences: dark mode, 14pt font
`;

// Tokens: 45 → 10 (78% reduction)
```

### Strategy 2: Pruning (20-30% savings)
```javascript
// Remove low-importance context
const original = `
[100 lines of import statements]
[50 lines of function signatures]
[Relevant function implementation]
`;

const pruned = `
[Relevant imports]
[Relevant function implementation]
`;

// Tokens: 8,000 → 2,500 (69% reduction)
```

### Strategy 3: Summarization (30-50% savings)
```javascript
// Summarize long contexts
const original = `
[5 pages of conversation history with detailed back-and-forth about project requirements]
`;

const summarized = `
Project requirements agreed:
- Authentication via OAuth
- Database: PostgreSQL
- Frontend: React + TypeScript
`;

// Tokens: 25,000 → 150 (99% reduction for long-term context)
```

### Strategy 4: Hybrid (40-60% savings)
```javascript
// Combine strategies intelligently
async function hybridCompression(context) {
  // Step 1: Remove duplicates
  const deduped = await deduplicate(context);

  // Step 2: Identify and prune low-value sections
  const pruned = await prune(deduped, {
    keepFunctions: true,
    removeBoilerplate: true
  });

  // Step 3: Summarize remaining long sections
  const summarized = await summarize(pruned, {
    maxSectionLength: 1000
  });

  return summarized;
}

// Result: 50,000 tokens → 22,500 tokens (55% reduction)
```

### Agent Learning Over Time

```javascript
class AdaptiveCompressionAgent {
  async learnOptimalStrategy() {
    // Try each strategy on sample data
    const strategies = ['dedup', 'prune', 'summarize', 'hybrid'];
    const results = {};

    for (const strategy of strategies) {
      const compressed = await this.compress(this.sampleData, strategy);
      const quality = await this.evaluateQuality(compressed);

      results[strategy] = {
        compressionRatio: compressed.ratio,
        qualityScore: quality,
        efficiency: quality * compressed.ratio
      };
    }

    // Select best strategy
    const best = Object.entries(results)
      .sort((a, b) => b[1].efficiency - a[1].efficiency)[0];

    this.preferredStrategy = best[0];
    return best;
  }

  async evaluateQuality(compressed) {
    // Send compressed context to LLM
    const response = await this.llm.query(compressed.context);

    // Compare to baseline response
    const baseline = await this.llm.query(this.originalContext);
    const similarity = this.calculateSimilarity(response, baseline);

    // Quality score: 0.0 (bad) to 1.0 (perfect)
    return similarity;
  }
}
```

---

## Agent Decision Logic

```javascript
class ContextOptimizerEvaluator {
  async evaluate(agentWallet, agentPolicy) {
    // Step 1: Measure baseline
    console.log('[Agent] Measuring baseline token usage (7 days)...');
    const baseline = await this.measureBaselineTokens();
    console.log(`[Agent] Baseline: ${baseline.totalTokens.toLocaleString()} tokens, $${baseline.monthlyCost}/month`);

    // Step 2: Test compression
    console.log('[Agent] Testing compression strategies...');
    const compression = await this.testCompression(baseline);
    console.log(`[Agent] Compression: ${compression.reduction.toFixed(1)}% reduction`);

    // Step 3: Calculate daily usage
    const dailyCompressions = baseline.totalRequests / 7;
    const freeTierSufficient = dailyCompressions <= 100;

    if (freeTierSufficient) {
      return {
        decision: 'use_free_tier',
        reason: `${dailyCompressions.toFixed(0)} compressions/day ≤ 100 free tier limit`,
        savings: compression.costSavings * 30,
        cost: 0,
        roi: Infinity
      };
    }

    // Step 4: Calculate Pro tier ROI
    const monthlySavings = compression.costSavings * 30;
    const proCost = 0.50;
    const netSavings = monthlySavings - proCost;
    const roi = netSavings / proCost;

    console.log(`[Agent] Pro tier analysis:
      Monthly savings: $${monthlySavings.toFixed(2)}
      Pro cost: $${proCost}
      Net savings: $${netSavings.toFixed(2)}
      ROI: ${roi.toFixed(1)}x
    `);

    // Step 5: Check policy
    if (roi < agentPolicy.minROI) {
      return {
        decision: 'skip_pro',
        reason: `ROI ${roi.toFixed(1)}x < minimum ${agentPolicy.minROI}x`,
        recommendation: 'Consider increasing compression or reducing free tier usage'
      };
    }

    if (proCost > agentPolicy.maxPerTool) {
      return {
        decision: 'skip_pro',
        reason: `Cost $${proCost} > max per tool $${agentPolicy.maxPerTool}`
      };
    }

    // Step 6: Subscribe
    return {
      decision: 'subscribe_pro',
      reason: `ROI ${roi.toFixed(1)}x, saves $${monthlySavings.toFixed(2)}/month`,
      autoApprove: agentPolicy.autoSubscribe && proCost <= agentPolicy.maxPerTool,
      details: {
        baselineMonthly: baseline.monthlyCost,
        optimizedMonthly: baseline.monthlyCost - monthlySavings,
        compressionRatio: compression.reduction,
        netSavings,
        roi
      }
    };
  }
}
```

---

## Real-World Agent Examples

### Example 1: Code Review Agent (High ROI)

**Profile:**
- Reviews code, suggests improvements
- 300 requests/day
- Large context windows (50KB per review)

**Baseline:**
```
300 requests/day × 50,000 tokens = 15M tokens/day
15M × 30 days = 450M tokens/month
Cost: $0.003/1K = $1,350/month
```

**With Context Optimizer:**
```javascript
// Compression analysis
const strategies = {
  dedup: 15%,      // Remove duplicate imports, comments
  prune: 25%,      // Remove unchanged files, focus on diffs
  summarize: 10%   // Summarize long function bodies
};

// Total reduction: 50% (hybrid strategy)
const compressed = 225M tokens/month
const cost = $675/month
const savings = $675/month

// Pro tier ROI
const roi = $675 / $0.50 = 1,350x ✅
```

**Agent decision:** Subscribe immediately (1,350x ROI)

### Example 2: Documentation Agent (Medium ROI)

**Profile:**
- Generates documentation from code
- 150 requests/day
- Medium context (20KB per request)

**Baseline:**
```
150 × 20,000 = 3M tokens/day = 90M tokens/month
Cost: $270/month
```

**With Context Optimizer:**
```
Compression: 45% (remove boilerplate, deduplicate)
Compressed: 49.5M tokens/month
Cost: $148.50/month
Savings: $121.50/month
ROI: $121.50 / $0.50 = 243x ✅
```

**Agent decision:** Subscribe (243x ROI)

### Example 3: Q&A Agent (Low Volume - Free Tier)

**Profile:**
- Answers questions
- 50 requests/day (under free tier limit)
- Small context (5KB per request)

**Baseline:**
```
50 × 5,000 = 250K tokens/day = 7.5M tokens/month
Cost: $22.50/month
```

**With Context Optimizer (Free Tier):**
```
Compression: 40%
Compressed: 4.5M tokens/month
Cost: $13.50/month
Savings: $9/month
Pro tier cost: $0
ROI: Infinite (free tier sufficient) ✅
```

**Agent decision:** Use free tier (no Pro subscription needed)

---

## Autonomous Subscription Flow

```javascript
import { ContextOptimizerClient } from '@openclaw/context-optimizer';
import { X402Client } from '@x402/client';

class CompressionOptimizationAgent {
  async autoEvaluate() {
    // Step 1: Measure baseline (1 week)
    const baseline = await this.measureWeek();

    // Step 2: Enable Context Optimizer (free tier)
    await this.contextOptimizer.enable();

    // Step 3: Measure with compression (1 week)
    const compressed = await this.measureWeek();

    // Step 4: Calculate results
    const reduction = ((baseline.tokens - compressed.tokens) / baseline.tokens) * 100;
    const savings = baseline.cost - compressed.cost;

    console.log(`[Agent] Compression test results:
      Original: ${baseline.tokens.toLocaleString()} tokens, $${baseline.cost}
      Compressed: ${compressed.tokens.toLocaleString()} tokens, $${compressed.cost}
      Reduction: ${reduction.toFixed(1)}%
      Savings: $${savings.toFixed(2)}/week
    `);

    // Step 5: Check free tier limit
    const dailyCompressions = compressed.requests / 7;

    if (dailyCompressions <= 100) {
      console.log(`[Agent] Free tier sufficient (${dailyCompressions.toFixed(0)}/100 daily compressions)`);
      return { decision: 'free_tier', savings: savings * 4.3 };
    }

    // Step 6: Calculate Pro ROI
    const monthlySavings = savings * 4.3;
    const proCost = 0.50;
    const roi = monthlySavings / proCost;

    if (roi >= this.policy.minROI && this.policy.autoSubscribe) {
      console.log(`[Agent] Subscribing to Pro (ROI: ${roi.toFixed(1)}x)...`);
      const txHash = await this.subscribePro();
      console.log(`[Agent] Subscribed ✓ ${txHash}`);
      return { decision: 'subscribed', roi, txHash };
    }

    return { decision: 'needs_approval', roi };
  }

  private async subscribePro() {
    const payment = await this.x402.createPayment({
      recipient: '0xContextOptimizerProAddress',
      amount: 0.50,
      currency: 'USDT',
      memo: 'Context Optimizer Pro - 30 days'
    });

    return await payment.sign().broadcast();
  }

  async monitorCompressionQuality() {
    // Run daily
    setInterval(async () => {
      const quality = await this.evaluateCompressionQuality();

      if (quality < 0.95) {
        console.warn(`[Agent] Compression quality dropped to ${quality.toFixed(2)} - adjusting strategy`);
        await this.adjustCompressionStrategy();
      }
    }, 24 * 60 * 60 * 1000);
  }
}
```

---

## Payment Authorization

### Fully Autonomous (Recommended)

```javascript
const agentPolicy = {
  maxMonthlyBudget: 10.00,
  minROI: 10,
  autoSubscribe: true,
  maxPerTool: 1.00
};

// Agent subscribes if:
// - ROI ≥ 10x ✓
// - Cost ≤ $1/tool ✓ ($0.50)
// - Within monthly budget ✓

// No human intervention required
```

### Result
- Agent optimizes token costs automatically
- Subscribes to Pro if ROI justifies it
- Cancels if compression quality degrades
- Continuous optimization

---

## Economic Impact

### Individual Agent
```
Baseline: $450/month (15M tokens)
Compressed: $202.50/month (55% reduction)
Savings: $247.50/month
Context Optimizer Pro: $0.50/month
Net: $247/month saved
ROI: 494x
```

### Agent Fleet (1,000 agents)
```
Baseline: $450,000/month
Compressed: $202,500/month
Savings: $247,500/month
Context Optimizer Pro: $500/month (1,000 × $0.50)
Net: $247,000/month saved
Annual savings: $2,964,000
```

### Ecosystem (1,000,000 agents)
```
Baseline: $450M/month
Compressed: $202.5M/month
Savings: $247.5M/month
Context Optimizer Pro: $500K/month
Net: $247M/month saved
Annual savings: $2.964B
```

**This is why micropayments matter:** $0.50/month × massive scale = billion-dollar impact

---

## Summary

**For Autonomous Agents:**
1. **Measure baseline:** Track token usage for 7 days
2. **Test compression:** Try free tier (100 compressions/day)
3. **Calculate ROI:** Compare savings vs. Pro cost ($0.50/month)
4. **Auto-subscribe:** If ROI ≥ 10x and within policy limits
5. **Monitor quality:** Adjust strategies if compression quality drops
6. **Cancel if unprofitable:** Continuous ROI evaluation

**For Humans:**
- Set delegation policy once
- Agent optimizes token costs autonomously
- Typical ROI: 100x-500x for high-volume agents
- Audit via blockchain trail

**Economic Model:**
- Free tier: 100 compressions/day
- Pro tier: Unlimited compressions ($0.50/month)
- Typical savings: 40-60% of token costs
- Break-even: $1/month token spend
- Sweet spot: $50+/month token spend (saves $25, costs $0.50 = 50x ROI)

---

## Links

- **Context Optimizer GitHub:** https://github.com/AtlasPA/openclaw-context-optimizer
- **x402 Protocol:** https://www.x402.org/
- **Compression Strategies:** See `src/strategies/`

**Next:** Enable autonomous compression optimization
