const { React } = require("@vendetta/metro/common");
const { registerCommand } = require("@vendetta/commands");
const { storage } = require("@vendetta/plugin");
const { findByProps } = require("@vendetta/metro");
const { ScrollView, Text, TextInput, TouchableOpacity, View } = require("react-native");

const defaultSources = [
  "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1569254994521-ddb5a3088399?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1604848698030-c434ba086c94?auto=format&fit=crop&w=800&q=80"
];

let unregisterCommand;

function onLoad() {
  if (!storage.sources) {
    storage.sources = [...defaultSources];
  }

  unregisterCommand = registerCommand({
    name: "chicken",
    displayName: "chicken",
    description: "Send a random chicken or chick picture instantly!",
    displayDescription: "Send a random chicken or chick picture instantly!",
    applicationId: "-1",
    inputType: 1,
    type: 1,
    options: [],
    execute: async (args, ctx) => {
      const MessageActions = findByProps("sendMessage", "receiveMessage") || findByProps("sendMessage");

      try {
        if (!MessageActions) {
          throw new Error("Discord messaging module not found.");
        }

        const sourcesList = storage.sources && storage.sources.length > 0 ? storage.sources : defaultSources;
        const randomSource = sourcesList[Math.floor(Math.random() * sourcesList.length)];
        
        let imageUrl = randomSource;
        
        if (randomSource.includes("/api") || randomSource.endsWith(".json")) {
          const response = await fetch(randomSource);
          const data = await response.json();
          imageUrl = data.url || data.image || data.file || data.link || randomSource;
        }

        MessageActions.sendMessage(ctx.channel.id, {
          content: imageUrl
        });
      } catch (err) {
        if (MessageActions?.receiveMessage) {
          MessageActions.receiveMessage(ctx.channel.id, {
            content: `❌ Failed to fetch chicken source: ${err.message}`
          });
        }
      }
    }
  });
}

function onUnload() {
  if (unregisterCommand) unregisterCommand();
}

function SettingsComponent() {
  const [input, setInput] = React.useState("");
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const handleAddSource = () => {
    if (!input.trim()) return;
    if (!storage.sources) storage.sources = [];
    storage.sources.push(input.trim());
    setInput("");
    forceUpdate();
  };

  const handleRemoveSource = (index) => {
    storage.sources.splice(index, 1);
    forceUpdate();
  };

  return React.createElement(
    ScrollView,
    { style: { padding: 16 } },
    React.createElement(Text, { style: { color: "#ffffff", fontSize: 18, fontWeight: "bold", marginBottom: 4 } }, "Chicken Sources Manager"),
    React.createElement(Text, { style: { color: "#b9bbbe", marginBottom: 16, fontSize: 14 } }, "Add direct image URLs or JSON APIs (which output a standard link, image, or file string payload)."),
    React.createElement(
      View,
      { style: { flexDirection: "row", marginBottom: 20 } },
      React.createElement(TextInput, {
        value: input,
        onChangeText: setInput,
        placeholder: "https://api.example.com/random-chicken",
        placeholderTextColor: "#4f545c",
        style: { flex: 1, backgroundColor: "#202225", color: "#ffffff", padding: 12, borderRadius: 8, marginRight: 8, fontSize: 14 }
      }),
      React.createElement(
        TouchableOpacity,
        {
          onPress: handleAddSource,
          style: { backgroundColor: "#5865F2", justifyContent: "center", paddingHorizontal: 16, borderRadius: 8 }
        },
        React.createElement(Text, { style: { color: "#ffffff", fontWeight: "bold" } }, "Add")
      )
    ),
    React.createElement(Text, { style: { color: "#ffffff", fontSize: 14, fontWeight: "bold", marginBottom: 8 } }, `Active Pipeline Sources (${storage.sources?.length || 0})`),
    storage.sources?.map((source, index) =>
      React.createElement(
        View,
        { key: index, style: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#2f3136", padding: 12, borderRadius: 8, marginBottom: 8 } },
        React.createElement(Text, { style: { color: "#ffffff", flex: 1, marginRight: 8, fontSize: 13 }, numberOfLines: 1 }, source),
        React.createElement(
          TouchableOpacity,
          { onPress: () => handleRemoveSource(index) },
          React.createElement(Text, { style: { color: "#ED4245", fontWeight: "bold", fontSize: 13 } }, "Delete")
        )
      )
    )
  );
}

module.exports = {
  onLoad: onLoad,
  onUnload: onUnload,
  settings: SettingsComponent
};

