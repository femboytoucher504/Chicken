(function () {
    var React        = vendetta.metro.common.React;
    var registerCommand = vendetta.commands.registerCommand;
    var storage      = vendetta.plugin.storage;
    var findByProps  = vendetta.metro.findByProps;

    var defaultSources = [
        "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1569254994521-ddb5a3088399?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1604848698030-c434ba086c94?auto=format&fit=crop&w=800&q=80"
    ];

    var unregisterCommand = null;

    function onLoad() {
        if (!storage.sources) {
            storage.sources = defaultSources.slice();
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
            execute: function (args, ctx) {
                var MessageActions = findByProps("sendMessage", "receiveMessage") || findByProps("sendMessage");

                if (!MessageActions) {
                    return Promise.reject(new Error("Discord messaging module not found."));
                }

                var sourcesList = (storage.sources && storage.sources.length > 0)
                    ? storage.sources
                    : defaultSources;
                var randomSource = sourcesList[Math.floor(Math.random() * sourcesList.length)];

                var isApi = randomSource.indexOf("/api") !== -1 || randomSource.slice(-5) === ".json";

                var p = isApi
                    ? fetch(randomSource)
                        .then(function (r) { return r.json(); })
                        .then(function (d) { return d.url || d.image || d.file || d.link || randomSource; })
                    : Promise.resolve(randomSource);

                return p.then(function (imageUrl) {
                    MessageActions.sendMessage(ctx.channel.id, { content: imageUrl });
                }).catch(function (err) {
                    if (MessageActions.receiveMessage) {
                        MessageActions.receiveMessage(ctx.channel.id, {
                            content: "❌ Failed to fetch chicken source: " + err.message
                        });
                    }
                });
            }
        });
    }

    function onUnload() {
        if (unregisterCommand) {
            unregisterCommand();
            unregisterCommand = null;
        }
    }

    function SettingsComponent() {
        // Pull React Native components from the already-loaded RN bundle
        var RN               = findByProps("ScrollView", "View", "Text");
        var ScrollView       = RN.ScrollView;
        var View             = RN.View;
        var Text             = RN.Text;
        var TextInput        = RN.TextInput        || findByProps("TextInput").TextInput;
        var TouchableOpacity = RN.TouchableOpacity || findByProps("TouchableOpacity").TouchableOpacity;

        var inputState   = React.useState("");
        var input        = inputState[0];
        var setInput     = inputState[1];
        var forceUpdate  = React.useReducer(function (x) { return x + 1; }, 0)[1];

        if (!storage.sources) storage.sources = defaultSources.slice();

        function handleAddSource() {
            var trimmed = input.trim();
            if (!trimmed) return;
            storage.sources.push(trimmed);
            setInput("");
            forceUpdate();
        }

        function handleRemoveSource(index) {
            storage.sources.splice(index, 1);
            forceUpdate();
        }

        return React.createElement(
            ScrollView,
            { style: { padding: 16 } },

            React.createElement(Text, {
                style: { color: "#ffffff", fontSize: 18, fontWeight: "bold", marginBottom: 4 }
            }, "Chicken Sources Manager"),

            React.createElement(Text, {
                style: { color: "#b9bbbe", marginBottom: 16, fontSize: 14 }
            }, "Add direct image URLs or JSON APIs (returning a url/image/file/link field)."),

            React.createElement(View, { style: { flexDirection: "row", marginBottom: 20 } },
                React.createElement(TextInput, {
                    value: input,
                    onChangeText: setInput,
                    placeholder: "https://api.example.com/random-chicken",
                    placeholderTextColor: "#4f545c",
                    style: {
                        flex: 1, backgroundColor: "#202225", color: "#ffffff",
                        padding: 12, borderRadius: 8, marginRight: 8, fontSize: 14
                    }
                }),
                React.createElement(TouchableOpacity, {
                    onPress: handleAddSource,
                    style: {
                        backgroundColor: "#5865F2", justifyContent: "center",
                        paddingHorizontal: 16, borderRadius: 8
                    }
                }, React.createElement(Text, { style: { color: "#ffffff", fontWeight: "bold" } }, "Add"))
            ),

            React.createElement(Text, {
                style: { color: "#ffffff", fontSize: 14, fontWeight: "bold", marginBottom: 8 }
            }, "Active Pipeline Sources (" + (storage.sources ? storage.sources.length : 0) + ")"),

            (storage.sources || []).map(function (source, index) {
                return React.createElement(View, {
                    key: String(index),
                    style: {
                        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                        backgroundColor: "#2f3136", padding: 12, borderRadius: 8, marginBottom: 8
                    }
                },
                    React.createElement(Text, {
                        style: { color: "#ffffff", flex: 1, marginRight: 8, fontSize: 13 },
                        numberOfLines: 1
                    }, source),
                    React.createElement(TouchableOpacity, {
                        onPress: function () { handleRemoveSource(index); }
                    }, React.createElement(Text, {
                        style: { color: "#ED4245", fontWeight: "bold", fontSize: 13 }
                    }, "Delete"))
                );
            })
        );
    }

    module.exports = {
        onLoad: onLoad,
        onUnload: onUnload,
        settings: SettingsComponent
    };
})();
