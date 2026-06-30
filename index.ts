import { commands } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const MessageActions = findByProps("sendMessage", "receiveMessage");

// Stock chicken images to fall back on if storage is empty
const defaultSources = [
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1569254994521-ddb5a3088399?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1604848698030-c434ba086c94?auto=format&fit=crop&w=800&q=80"
];

let unregisterCommand;

export const onLoad = () => {
  // Safe initialization of client-side storage
  if (!storage.sources) {
    storage.sources = [...defaultSources];
  }

  unregisterCommand = commands.registerCommand({
    name: "chicken",
    description: "Send a random chicken or chick picture instantly!",
    options: [],
    execute: async (args, ctx) => {
      try {
        const sourcesList = storage.sources && storage.sources.length > 0 ? storage.sources : defaultSources;
        const randomSource = sourcesList[Math.floor(Math.random() * sourcesList.length)];
        
        let imageUrl = randomSource;
        
        // Dynamic detection: If source is an API endpoint, unpack the JSON data
        if (randomSource.includes("/api") || randomSource.endsWith(".json")) {
          const response = await fetch(randomSource);
          const data = await response.json();
          // Extract image URLs from standard nesting properties commonly used by open APIs
          imageUrl = data.url || data.image || data.file || data.link || randomSource;
        }

        // Programmatically execute the message send event in the target text channel
        MessageActions.sendMessage(ctx.channel.id, {
          content: imageUrl
        });
      } catch (err) {
        // Fallback trace to channel view if a user-supplied network endpoint is broken
        MessageActions.receiveMessage(ctx.channel.id, {
          content: `❌ Failed to fetch chicken source: ${err.message}`
        });
      }
    }
  });
};

export const onUnload = () => {
  if (unregisterCommand) unregisterCommand();
};

// Expose settings UI configuration
export { default as settings } from "./Settings";
