import { React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Settings() {
  // useProxy ensures the UI automatically rerenders when values in storage update
  useProxy(storage);
  const [input, setInput] = React.useState("");

  const handleAddSource = () => {
    if (!input.trim()) return;
    if (!storage.sources) storage.sources = [];
    storage.sources.push(input.trim());
    setInput("");
  };

  const handleRemoveSource = (index: number) => {
    storage.sources.splice(index, 1);
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ color: "#ffffff", fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
        Chicken Sources Manager
      </Text>
      <Text style={{ color: "#b9bbbe", marginBottom: 16, fontSize: 14 }}>
        Add direct image URLs or JSON APIs (which output a standard link, image, or file string payload).
      </Text>

      {/* Input Field and Action Trigger */}
      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="https://api.example.com/random-chicken"
          placeholderTextColor="#4f545c"
          style={{
            flex: 1,
            backgroundColor: "#202225",
            color: "#ffffff",
            padding: 12,
            borderRadius: 8,
            marginRight: 8,
            fontSize: 14
          }}
        />
        <TouchableOpacity
          onPress={handleAddSource}
          style={{
            backgroundColor: "#5865F2",
            justifyContent: "center",
            paddingHorizontal: 16,
            borderRadius: 8
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold" }}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Render Active List of Sources */}
      <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
        Active Pipeline Sources ({storage.sources?.length || 0})
      </Text>
      
      {storage.sources?.map((source: string, index: number) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#2f3136",
            padding: 12,
            borderRadius: 8,
            marginBottom: 8
          }}
        >
          <Text style={{ color: "#ffffff", flex: 1, marginRight: 8, fontSize: 13 }} numberOfLines={1}>
            {source}
          </Text>
          <TouchableOpacity onPress={() => handleRemoveSource(index)}>
            <Text style={{ color: "#ED4245", fontWeight: "bold", fontSize: 13 }}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

