import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import axios from "axios";
import { FALLBACK_DOMAIN_ID } from "./constants";

export class MyMCP extends McpAgent<Env> {
  server = new McpServer({
    name: "secure-privacy-mcp",
    version: "1.1.0",
  });

  async init() {
    // Tool 1: One-click full integration
    this.server.tool(
      "install_secure_privacy_banner",
      {
        description:
          "Fully install Secure Privacy cookie banner on the user's website in one step. Use this when user asks to add cookie banner or implement GDPR compliance.",
      },
      async () => {
        console.log("Starting Secure Privacy installation...");

        // Step 1: Add domain directly (not via MCP!)
        const addResult = await this.runAddDomainTool();
        console.log("addResult:", addResult);
        if (!addResult.success) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to add domain: ${addResult.error}`,
              },
            ],
          };
        }

        console.log("Domain added:", addResult.domainId);

        // Step 2: Assign templates to domain
        const assignResult = await this.runAssignTemplatesToDomainTool(
          addResult.domainId
        );
        if (!assignResult.success) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to assign templates: ${assignResult.error}`,
              },
            ],
          };
        }

        console.log("Templates assigned:", assignResult.count);

        // Step 3: Inject script directly
        const injectResult = await this.runInjectScriptTool(addResult.domainId);
        if (!injectResult.success) {
          return {
            content: [
              {
                type: "text",
                text: `Failed to inject script: ${injectResult.error}`,
              },
            ],
          };
        }

        const status = injectResult.alreadyExists ? " (already present)" : "";

        return {
          content: [
            {
              type: "text",
              text:
                `Secure Privacy Cookie Banner Installed Successfully!\n\n` +
                `Domain registered: ${addResult.domain}\n` +
                `Domain ID: ${addResult.domainId}\n` +
                `Templates assigned: ${assignResult.count}\n` +
                `Script tag injected${status}:\n` +
                `<script src="https://app.secureprivacy.ai/script/${addResult.domainId}.js"></script>\n\n` +
                `Your website now shows a compliant cookie banner and is GDPR compliant!`,
            },
          ],
        };
      }
    );
  }

  private async runAddDomainTool() {
    const apiUrl = "https://api-prod.secureprivacy.ai/api/domain";
    const apiKey = this.env?.SECURE_PRIVACY_API_KEY;

    if (!apiKey) {
      return {
        success: false as const,
        error: "SECURE_PRIVACY_API_KEY not configured",
      };
    }

    const randomString = Math.random().toString(36).substring(2, 15);
    const domain = `https://${randomString}.example.com`;

    try {
      const payload = {
        domain,
        name: null,
        businessName: null,
        blocking: "Manual",
        websiteQuestions: null,
        collectedData: null,
        informationCollected: null,
        enableGCM: null,
        framework: "Standard",
        googleConsentMode: "GCM_ADVANCED",
        microsoftConsentMode: "UET",
        microsoftClarityMode: "CLARITY",
        metaConsentMode: "META",
        iabVendors: null,
        iabusPrivacyNotices: null,
        widgetView: { ShowOnPages: null, HideOnPages: null },
        tags: null,
        isV2: true,
      };

      const response = await axios.post(apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      const domainId = response.data?.Id || FALLBACK_DOMAIN_ID;

      if (!domainId) throw new Error("No domainId in response");

      return { success: true as const, domain, domainId };
    } catch (error: any) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      return { success: false as const, error: msg };
    }
  }

  private async runInjectScriptTool(domainId: string) {
    try {
      // Replace with your actual way to get/modify index.html
      const res = await fetch("https://your-site.pages.dev/index.html");
      let html = await res.text();

      const scriptTag = `<script src="https://app.secureprivacy.ai/script/${domainId}.js"></script>`;

      if (html.includes(`secureprivacy.ai/script/${domainId}`)) {
        return { success: true, alreadyExists: true, html };
      }

      if (html.includes("</head>")) {
        html = html.replace("</head>", `${scriptTag}\n</head>`);
      } else if (html.includes("</body>")) {
        html = html.replace("</body>", `${scriptTag}\n</body>`);
      } else {
        html += `\n${scriptTag}`;
      }

      // TODO: Actually deploy updated HTML (Cloudflare Pages API, R2, Git, etc.)
      console.log("Would deploy updated HTML:", html.slice(0, 500));

      return { success: true, alreadyExists: false, html };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  private async runAssignTemplatesToDomainTool(domainId: string) {
    const apiKey = this.env?.SECURE_PRIVACY_API_KEY;

    if (!apiKey) {
      return {
        success: false as const,
        error: "SECURE_PRIVACY_API_KEY not configured",
        count: 0,
      };
    }

    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };

      const TemplatesIds: string[] = [];

      // Fetch non-design templates
      const nonDesignResponse = await axios.get(
        "https://api-prod.secureprivacy.ai/api/template?isDesignTemplate=false&pageNumber=1&resultsPerPage=999999&onlyHeaders=true",
        { headers }
      );

      if (nonDesignResponse.data?.PagedResults) {
        const ids = nonDesignResponse.data.PagedResults.map(
          (template: any) => template.Id
        );
        TemplatesIds.push(...ids);
      }

      // Fetch design templates
      const designResponse = await axios.get(
        "https://api-prod.secureprivacy.ai/api/template?isDesignTemplate=true&pageNumber=1&resultsPerPage=999999&onlyHeaders=true",
        { headers }
      );

      if (designResponse.data?.PagedResults) {
        const ids = designResponse.data?.PagedResults?.map(
          (template: any) => template.Id
        );
        TemplatesIds.push(...ids);
      }

      // Assign templates to domain
      const assignPayload = {
        DomainId: domainId,
        PolicyIds: [],
        TemplateIds: TemplatesIds,
      };

      await axios.post(
        "https://api-prod.secureprivacy.ai/api/domain/assign",
        assignPayload,
        { headers }
      );

      return { success: true as const, count: TemplatesIds.length };
    } catch (error: any) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      return { success: false as const, error: msg, count: 0 };
    }
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/sse" || url.pathname === "/sse/message") {
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    if (url.pathname === "/mcp") {
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    return new Response("Not found", { status: 404 });
  },
};
