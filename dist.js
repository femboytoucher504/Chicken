var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// index.js
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_commands = require("@vendetta/commands");
var import_plugin = require("@vendetta/plugin");
var DEFAULT_SOURCES = [
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1604848698030-c434ba08ece1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1587573089734-09cb6b4eb18b?auto=format&fit=crop&w=800&q=80"
];
var patches = [];
var index_default = {
  onLoad: () => {
    if (!import_plugin.storage.sources || import_plugin.storage.sources.length === 0) {
      import_plugin.storage.sources = [...DEFAULT_SOURCES];
    }
    patches.push(
      import_commands.commands.registerCommand({
        name: "chick",
        description: "Sends a random chicken or chick picture",
        options: [],
        execute: (args, ctx) => {
          const srcs = import_plugin.storage.sources.length > 0 ? import_plugin.storage.sources : DEFAULT_SOURCES;
          const randomPic = srcs[Math.floor(Math.random() * srcs.length)];
          return { content: randomPic };
        }
      })
    );
    patches.push(
      import_commands.commands.registerCommand({
        name: "chick-add",
        description: "Add a new chicken picture source URL",
        options: [
          {
            name: "url",
            description: "The direct link to the image",
            type: 3,
            // String type
            required: true
          }
        ],
        execute: (args, ctx) => {
          const urlOption = args.find((arg) => arg.name === "url");
          if (!urlOption || !urlOption.value.startsWith("http")) {
            return { content: "\u274C Please provide a valid web URL starting with http or https." };
          }
          const targetUrl = urlOption.value.trim();
          if (import_plugin.storage.sources.includes(targetUrl)) {
            return { content: "\u26A0\uFE0F This source link is already saved." };
          }
          import_plugin.storage.sources.push(targetUrl);
          return { content: `\u2705 Added new source successfully!` };
        }
      })
    );
    patches.push(
      import_commands.commands.registerCommand({
        name: "chick-list",
        description: "List all active chicken picture sources",
        options: [],
        execute: (args, ctx) => {
          if (import_plugin.storage.sources.length === 0) {
            return { content: "\u{1F414} No image sources are currently loaded." };
          }
          const visibleList = import_plugin.storage.sources.map((src, index) => `**${index + 1}.** ${src}`).join("\n");
          return { content: `### \u{1F4C2} Current Chicken Sources:
${visibleList}` };
        }
      })
    );
    patches.push(
      import_commands.commands.registerCommand({
        name: "chick-remove",
        description: "Remove a source entry using its index number from /chick-list",
        options: [
          {
            name: "index",
            description: "The number of the source to delete",
            type: 4,
            // Integer type
            required: true
          }
        ],
        execute: (args, ctx) => {
          const indexOption = args.find((arg) => arg.name === "index");
          if (!indexOption) return { content: "\u274C Specify an item number to clear." };
          const itemIndex = parseInt(indexOption.value) - 1;
          if (itemIndex >= 0 && itemIndex < import_plugin.storage.sources.length) {
            const deletedItem = import_plugin.storage.sources.splice(itemIndex, 1);
            return { content: `\u{1F5D1}\uFE0F Successfully removed source entry: <${deletedItem[0]}>` };
          }
          return { content: "\u274C Invalid item number. Check your positions via `/chick-list` first." };
        }
      })
    );
  },
  onUnload: () => {
    for (const unpatch of patches) unpatch();
  }
};
