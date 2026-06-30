/* ChickenSpammer — Revenge/Vendetta plugin, plain JS, no bundler needed */

var _v = null;
try { _v = typeof vendetta !== "undefined" ? vendetta : null; } catch (e) {}

/* findByProps first — needed to find everything else as fallback */
var _findByProps = (_v && _v.metro && _v.metro.findByProps)
    ? _v.metro.findByProps
    : null;

/* storage — try vendetta path, then plugin context */
var _storage = null;
if (_v && _v.plugin && _v.plugin.storage) {
    _storage = _v.plugin.storage;
} else if (typeof pluginContext !== "undefined" && pluginContext.storage) {
    _storage = pluginContext.storage;
} else {
    _storage = {};
}

/* registerCommand — try vendetta path, then metro search */
var _registerCommand = null;
if (_v && _v.commands && _v.commands.registerCommand) {
    _registerCommand = _v.commands.registerCommand;
} else if (_findByProps) {
    var _cmdMod = _findByProps("registerCommand");
    if (_cmdMod && _cmdMod.registerCommand) {
        _registerCommand = _cmdMod.registerCommand;
    }
}

/* React — try vendetta path, then metro search */
var _React = null;
if (_v && _v.metro && _v.metro.common && _v.metro.common.React) {
    _React = _v.metro.common.React;
} else if (_findByProps) {
    var _reactMod = _findByProps("createElement", "useState", "useEffect");
    if (_reactMod) _React = _reactMod;
}

var defaultSources = [
    "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1569254994521-ddb5a3088399?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1604848698030-c434ba086c94?auto=format&fit=crop&w=800&q=80"
];

var _unregister = null;

/* ------------------------------------------------------------------ */
/*  onLoad                                                              */
/* ------------------------------------------------------------------ */
function onLoad() {
    if (!_storage.sources || !Array.isArray(_storage.sources)) {
        _storage.sources = defaultSources.slice();
    }

    if (!_registerCommand) { return; }

    _unregister = _registerCommand({
        name: "chicken",
        displayName: "chicken",
        description: "Send a random chicken or chick picture!",
        displayDescription: "Send a random chicken or chick picture!",
        applicationId: "-1",
        inputType: 1,
        type: 1,
        options: [],
        execute: function (args, ctx) {
            try {
                var MA = _findByProps
                    ? (_findByProps("sendMessage", "receiveMessage") || _findByProps("sendMessage"))
                    : null;
                if (!MA) { return; }

                var sources = (_storage.sources && _storage.sources.length > 0)
                    ? _storage.sources
                    : defaultSources;
                var randomSource = sources[Math.floor(Math.random() * sources.length)];
                var isApi = randomSource.indexOf("/api") !== -1 || randomSource.slice(-5) === ".json";

                var p = isApi
                    ? fetch(randomSource)
                        .then(function (r) { return r.json(); })
                        .then(function (d) { return d.url || d.image || d.file || d.link || randomSource; })
                    : Promise.resolve(randomSource);

                return p.then(function (imageUrl) {
                    MA.sendMessage(ctx.channel.id, { content: imageUrl });
                }).catch(function (err) {
                    if (MA.receiveMessage) {
                        MA.receiveMessage(ctx.channel.id, {
                            content: "Failed to get chicken: " + err.message
                        });
                    }
                });
            } catch (e) {
                return Promise.resolve();
            }
        }
    });
}

/* ------------------------------------------------------------------ */
/*  onUnload                                                            */
/* ------------------------------------------------------------------ */
function onUnload() {
    if (_unregister) {
        try { _unregister(); } catch (e) {}
        _unregister = null;
    }
}

/* ------------------------------------------------------------------ */
/*  Settings page                                                       */
/* ------------------------------------------------------------------ */
function SettingsComponent() {
    if (!_React || !_findByProps) { return null; }

    var RN               = _findByProps("ScrollView", "View", "Text") || {};
    var ScrollView       = RN.ScrollView;
    var View             = RN.View;
    var Text             = RN.Text;
    var TextInput        = RN.TextInput        || ((_findByProps("TextInput")        || {}).TextInput);
    var TouchableOpacity = RN.TouchableOpacity || ((_findByProps("TouchableOpacity") || {}).TouchableOpacity);

    if (!ScrollView || !View || !Text || !TextInput || !TouchableOpacity) { return null; }

    var inputState  = _React.useState("");
    var input       = inputState[0];
    var setInput    = inputState[1];
    var forceUpdate = _React.useReducer(function (x) { return x + 1; }, 0)[1];

    if (!_storage.sources) { _storage.sources = defaultSources.slice(); }

    function handleAdd() {
        var t = input.trim();
        if (!t) { return; }
        _storage.sources.push(t);
        setInput("");
        forceUpdate();
    }

    function handleRemove(i) {
        _storage.sources.splice(i, 1);
        forceUpdate();
    }

    return _React.createElement(ScrollView, { style: { padding: 16 } },

        _React.createElement(Text, {
            style: { color: "#ffffff", fontSize: 18, fontWeight: "bold", marginBottom: 4 }
        }, "Chicken Sources Manager"),

        _React.createElement(Text, {
            style: { color: "#b9bbbe", fontSize: 14, marginBottom: 16 }
        }, "Add direct image URLs or JSON API endpoints."),

        _React.createElement(View, { style: { flexDirection: "row", marginBottom: 20 } },
            _React.createElement(TextInput, {
                value: input,
                onChangeText: setInput,
                placeholder: "https://example.com/chicken.jpg",
                placeholderTextColor: "#4f545c",
                style: {
                    flex: 1, backgroundColor: "#202225", color: "#ffffff",
                    padding: 12, borderRadius: 8, marginRight: 8, fontSize: 14
                }
            }),
            _React.createElement(TouchableOpacity, {
                onPress: handleAdd,
                style: {
                    backgroundColor: "#5865F2", justifyContent: "center",
                    paddingHorizontal: 16, borderRadius: 8
                }
            }, _React.createElement(Text, { style: { color: "#ffffff", fontWeight: "bold" } }, "Add"))
        ),

        _React.createElement(Text, {
            style: { color: "#ffffff", fontWeight: "bold", fontSize: 14, marginBottom: 8 }
        }, "Sources (" + (_storage.sources ? _storage.sources.length : 0) + ")"),

        (_storage.sources || []).map(function (src, i) {
            return _React.createElement(View, {
                key: String(i),
                style: {
                    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                    backgroundColor: "#2f3136", padding: 12, borderRadius: 8, marginBottom: 8
                }
            },
                _React.createElement(Text, {
                    style: { color: "#dcddde", flex: 1, marginRight: 8, fontSize: 12 },
                    numberOfLines: 1
                }, src),
                _React.createElement(TouchableOpacity, {
                    onPress: function () { handleRemove(i); }
                }, _React.createElement(Text, {
                    style: { color: "#ED4245", fontWeight: "bold" }
                }, "Delete"))
            );
        })
    );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */
if (typeof module !== "undefined") {
    module.exports = { onLoad: onLoad, onUnload: onUnload, settings: SettingsComponent };
}
