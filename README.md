# Secure Privacy MCP Server

A remote [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that enables AI agents like Claude Desktop, GitHub Copilot, and Cursor to automatically integrate GDPR-compliant cookie consent banners into websites with a single command.

Built on Cloudflare Workers, this MCP server provides a one-click solution for implementing Secure Privacy's cookie consent management platform, handling domain registration, template assignment, and script injection seamlessly.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI assistants to securely connect to external tools and data sources. It allows AI agents to perform actions on your behalf, making complex multi-step workflows as simple as a single conversational request.

## Key Features

- **One-Click Installation**: Fully automate cookie banner deployment with a single AI command
- **GDPR Compliant**: Automatically configure compliant consent management
- **Multiple Consent Modes**: Support for Google Consent Mode (GCM), Microsoft UET, Meta, and more
- **Template Management**: Auto-assign all available cookie banner templates
- **No API Key Required**: Users don't need to provide any credentials
- **AI Agent Compatible**: Works with Claude Desktop, GitHub Copilot, Cursor, and other MCP clients

## Available Tools

### `install_secure_privacy_banner`

Fully install Secure Privacy cookie banner on a website in one step. This is the primary tool that orchestrates the entire installation process.

**What it does:**
1. **Registers a domain** with Secure Privacy
2. **Assigns templates** - Fetches and assigns all available cookie banner templates (design + functional)
3. **Generates the script tag** - Creates the integration code for your website
4. **Configures consent modes** - Sets up Google Consent Mode (GCM), Microsoft UET, Meta, and more

**Response includes:**
- Domain URL registered
- Domain ID for tracking
- Number of templates assigned
- Script tag for integration
- Confirmation of GDPR compliance

## Example Usage

Simply ask your AI agent in natural language:

```
"Add a cookie banner to my website"
"Make my site GDPR compliant"
"Install Secure Privacy on my website"
"I need cookie consent management"
```

The AI will automatically use the Secure Privacy MCP to set everything up and provide you with the script tag to add to your website.

## Installation

### Claude Desktop

1. Install the [mcp-remote](https://www.npmjs.com/package/mcp-remote) proxy:
   ```bash
   npm install -g mcp-remote
   ```

2. Open Claude Desktop and go to **Settings > Developer > Edit Config**

3. Add this configuration:
   ```json
   {
     "mcpServers": {
       "secure-privacy": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://mcp.secureprivacy.ai/sse"
         ]
       }
     }
   }
   ```

4. Restart Claude Desktop

5. Start using it! Ask Claude: "Add a cookie banner to my website"

### GitHub Copilot (VS Code)

1. Install the [mcp-remote](https://www.npmjs.com/package/mcp-remote) package globally:
   ```bash
   npm install -g mcp-remote
   ```

2. Open VS Code Settings (JSON) and add the MCP configuration:
   ```json
   {
     "github.copilot.chat.mcp.servers": {
       "secure-privacy": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://mcp.secureprivacy.ai/sse"
         ]
       }
     }
   }
   ```

3. Restart VS Code

4. Use Copilot Chat and ask: "Add Secure Privacy cookie banner to my site"

### Cursor

1. Install the [mcp-remote](https://www.npmjs.com/package/mcp-remote) proxy:
   ```bash
   npm install -g mcp-remote
   ```

2. Open Cursor Settings and navigate to the MCP configuration

3. Add the Secure Privacy MCP server:
   ```json
   {
     "mcpServers": {
       "secure-privacy": {
         "command": "npx",
         "args": [
           "mcp-remote",
           "https://mcp.secureprivacy.ai/sse"
         ]
       }
     }
   }
   ```

4. Restart Cursor

5. Chat with the AI and request: "Install cookie consent on my website"

## Troubleshooting

### Connection Issues

If the MCP server doesn't appear in your AI client:
- Verify the URL is correct: `https://mcp.secureprivacy.ai/sse`
- Restart your AI client after updating the configuration
- Check that `mcp-remote` is properly installed by running: `npm list -g mcp-remote`
- Make sure you have an active internet connection

### MCP Not Showing Up

- Ensure the configuration file syntax is correct (valid JSON)
- Check for typos in the server URL
- Try reinstalling `mcp-remote`: `npm install -g mcp-remote`
- Verify your AI client supports MCP (check version requirements)

### Script Already Exists

If you see a message that the script is already present, that's normal! The MCP automatically detects existing Secure Privacy installations and won't duplicate the script tag.

## Development

### Get Started

Deploy to Cloudflare Workers:

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/ai/tree/main/demos/remote-mcp-authless)

Or use the command line:
```bash
npm create cloudflare@latest -- my-mcp-server --template=cloudflare/ai/demos/remote-mcp-authless
```

### Customizing the MCP Server

To add your own [tools](https://developers.cloudflare.com/agents/model-context-protocol/tools/) to the MCP server, define each tool inside the `init()` method of `src/index.ts` using `this.server.tool(...)`.

### Testing with Cloudflare AI Playground

You can test your MCP server from the Cloudflare AI Playground:

1. Go to https://playground.ai.cloudflare.com/
2. Enter your deployed MCP server URL (`mcp.secureprivacy.ai/sse`)
3. Use your MCP tools directly from the playground

## Need Help?

For additional support:
- **Secure Privacy Support**: [Contact support](https://secureprivacy.ai/contact-us)
- **Documentation**: [Browse our docs](https://docs.secureprivacy.ai)
- **Email**: support@secureprivacy.ai

## License

See LICENSE file for details. 
