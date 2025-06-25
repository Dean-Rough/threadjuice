# MCP Configuration - ThreadJuice

## Clean MCP Setup (December 2024)

After cleaning up duplicates and removing unused servers, here's the optimized MCP configuration:

### Active MCP Servers

1. **sequential-thinking** - Complex reasoning and problem decomposition
   - Command: `npx -y @modelcontextprotocol/server-sequential-thinking`
   - Scope: User

2. **filesystem** - File operations and management
   - Command: `@modelcontextprotocol/server-filesystem`
   - Scope: User

3. **puppeteer** - Web scraping and browser automation
   - Command: `@cloudcode/mcp-server-puppeteer`
   - Scope: User

4. **fetch** - HTTP requests and API calls
   - Command: `@modelcontextprotocol/server-fetch`
   - Scope: User

5. **brave-search** - Web search capabilities
   - Command: `@modelcontextprotocol/server-brave-search`
   - Scope: User
   - Note: Requires BRAVE_API_KEY environment variable

6. **memory** - Persistent memory across sessions
   - Command: `npx -y @modelcontextprotocol/server-memory`
   - Scope: User

7. **time** - Time and date operations
   - Command: `@modelcontextprotocol/server-time`
   - Scope: User

8. **git** - Version control operations
   - Command: `@modelcontextprotocol/server-git`
   - Scope: User

### Removed Servers

- **sequential** (duplicate of sequential-thinking)
- **sqlite** (wrong project path)
- **mem0** (duplicate memory functionality)
- **postgres** (not used in ThreadJuice)
- **github** (not configured)
- **music-analysis** (not relevant to project)
- **WayStation** (not needed)

### Configuration Notes

- All servers are in User scope for cross-project availability
- No project-specific servers needed currently
- Brave Search requires API key setup if used
- All essential functionality covered with minimal overlap

### Commands for Reference

```bash
# List all MCP servers
claude mcp list

# Add a new server
claude mcp add <name> <command> -s <scope>

# Remove a server
claude mcp remove <name> -s <scope>

# Get server details
claude mcp get <name>
```