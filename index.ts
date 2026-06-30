import { commands } from "@vendetta";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";

const defaultSources = [
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1569254994521-ddb5a3088399?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1604848698030-c434ba086c94?auto=format&fit=crop&w=800&q=80"
];

let unregisterCommand;

export const onLoad = () => {
  // Initialize storage array safely on first boot
  if (!storage.sources) {
    storage.sources = [...defaultSources];
  }

  unregisterCommand = commands.registerCommand({
    name: "chicken",
    description: "Send a random chicken or chick picture instantly!",
    options: [],
    execute: async (args, ctx) => {
      // Find modules dynamically at execution time to guarantee Discord has loaded them
      const MessageActions = findByProps("sendMessage", "receiveMessage") || findByProps("sendMessage");

      try {
        if (!MessageActions) {
          throw new Error("Internal Discord messaging modules are unavailable.");
        }

        const sourcesList = storage.sources && storage.sources.length > 0 ? storage.sources : defaultSources;
        const randomSource = sourcesList[Math.floor(Math.random() * sourcesList.length)];
        
        let imageUrl = randomSource;
        
        // If source is a web API, fetch the payload and pull the image link out
        if (randomSource.includes("/api") || randomSource.endsWith(".json")) {
          const response = await fetch(randomSource);
          const data = await response.json();
          imageUrl = data.url || data.image || data.file || data.link || randomSource;
        }

        // Deliver to the text channel
        MessageActions.sendMessage(ctx.channel.id, {
          content: imageUrl
        });
      } catch (err) {
        console.error(`[ChickenSpammer] Error: ${err.message}`);
        if (MessageActions?.receiveMessage) {
          MessageActions.receiveMessage(ctx.channel.id, {
            content: `❌ Failed to fetch chicken source: ${err.message}`
          });
        }
      }
    }
  });
};

export const onUnload = () => {
  if (unregisterCommand) unregisterCommand();
};

export { default as settings } from "./Settings";
