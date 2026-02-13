# Awesome Claude Code Resource Submission

**Submission URL:** https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml

---

## Form Fields

### Display Name
```
OpenClaw Context Optimizer
```

### Category
```
Tooling
```

### Sub-Category
```
Tooling: Usage Monitors
```

### Primary Link
```
https://github.com/AtlasPA/openclaw-context-optimizer
```

### Author Name
```
AtlasPA
```

### Author Link
```
https://github.com/AtlasPA
```

### License
```
MIT
```

### Description
```
Intelligent context compression that reduces token usage by 40-60% for OpenClaw agents. Multiple compression strategies (deduplication, pruning, summarization, hybrid), seamless integration with Memory System, and adaptive learning of what context matters. Free tier: 100 compressions/day. Pro tier (0.5 USDT/month): unlimited compressions with pattern learning and ROI tracking. Includes CLI and web dashboard on port 9092.
```

### Validate Claims
```
1. Install the tool: `cd ~/.openclaw && git clone https://github.com/AtlasPA/openclaw-context-optimizer.git && cd openclaw-context-optimizer && npm install && npm run setup`
2. Start the dashboard: `npm run dashboard` (runs on http://localhost:9092)
3. Check optimizer status: `node src/cli.js status --wallet 0xTestWallet`
4. Make API calls with large context and observe automatic compression
5. View compression stats: `node src/cli.js stats --wallet 0xTestWallet`
6. Observe 40-60% reduction in token usage and corresponding cost savings
```

### Specific Task(s)
```
Install the OpenClaw Context Optimizer and have a conversation with large context (paste documentation, code files). Observe how the optimizer compresses redundant information while preserving important details, reducing token costs.
```

### Specific Prompt(s)
```
"Install the OpenClaw Context Optimizer from ~/.openclaw/openclaw-context-optimizer. Then show me how much I'm saving on token costs by compressing my conversation context."
```

### Additional Comments
```
This is part of the OpenClaw ecosystem (5 tools total: Cost Governor, Memory System, Context Optimizer, Smart Router, and API Quota Tracker). All tools use the same x402 payment protocol for Pro tier subscriptions. Context Optimizer works seamlessly with Memory System to intelligently compress context using stored memories, achieving 40-60% token savings.
```

### Recommendation Checklist
- [x] I have checked that this resource hasn't already been submitted
- [x] My resource provides genuine value to Claude Code users, and any risks are clearly stated
- [x] All provided links are working and publicly accessible
- [x] I am submitting only ONE resource in this issue
- [x] I understand that low-quality or duplicate submissions may be rejected

---

## Instructions

1. Go to: https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml
2. Copy and paste each field from above into the corresponding form field
3. Check all the checkboxes at the bottom
4. Click "Submit new issue"
5. The automated validator will check your submission and post results as a comment
