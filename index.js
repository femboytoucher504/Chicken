/**
 * Chickenizer — a Revenge/Vendetta plugin
 *
 * Sends random chicken/chick pictures pulled from a configurable list
 * of sources, and lets you add new sources on the fly.
 *
 * Commands:
 *   /chick            - posts a random chicken/chick image
 *   /chick-add <url>  - adds a new image source
 *   /chick-list       - lists current sources
 *   /chick-remove <i> - removes a source by its index from /chick-list
 *
 * This file is plain unbundled JS (no `import`/`export` statements) so it
 * can be fetched and evaluated directly by Revenge/Vendetta without an
 * esbuild step. It pulls everything it needs off the global `vendetta`
 * object that Revenge injects into the plugin's evaluation scope.
 */

(function () {
    var storage = vendetta.plugin.storage;
    var registerCommand = vendetta.commands.registerCommand;
    var showToast = vendetta.ui.toasts.showToast;

    var DEFAULT_SOURCES = [
        {
            name: "RandomFox-style Chickens (placeholder API)",
            type: "random",
            endpoint: "https://some-chicken-api.example.com/random",
            path: "url",
        },
        {
            name: "Static baby chick pool",
            type: "static",
            urls: [
                "https://upload.wikimedia.org/wikipedia/commons/4/4d/Baby_chick.jpg",
            ],
        },
    ];

    var unregisterFns = [];

    function resolvePath(obj, path) {
        var parts = path.split(".");
        var acc = obj;
        for (var i = 0; i < parts.length; i++) {
            if (acc == null) return acc;
            acc = acc[parts[i]];
        }
        return acc;
    }

    function ensureStorage() {
        if (!storage.sources || !Array.isArray(storage.sources)) {
            storage.sources = DEFAULT_SOURCES;
        }
    }

    function getRandomImageUrl() {
        ensureStorage();
        var sources = storage.sources;
        if (!sources.length) {
            return Promise.reject(new Error("No sources configured. Use /chick-add to add one."));
        }

        var source = sources[Math.floor(Math.random() * sources.length)];

        if (source.type === "static") {
            var urls = source.urls;
            if (!urls || !urls.length) {
                return Promise.reject(new Error('Source "' + source.name + '" has no urls.'));
            }
            return Promise.resolve(urls[Math.floor(Math.random() * urls.length)]);
        }

        if (source.type === "random") {
            return fetch(source.endpoint).then(function (res) {
                if (!res.ok) {
                    throw new Error('Source "' + source.name + '" returned HTTP ' + res.status);
                }
                return res.json();
            }).then(function (json) {
                var url = resolvePath(json, source.path || "url");
                if (!url || typeof url !== "string") {
                    throw new Error(
                        'Couldn\'t find an image URL at path "' + source.path + '" in response from "' + source.name + '".'
                    );
                }
                return url;
            });
        }

        return Promise.reject(new Error('Unknown source type "' + source.type + '" on "' + source.name + '".'));
    }

    function onLoad() {
        ensureStorage();

        unregisterFns.push(
            registerCommand({
                name: "chick",
                displayName: "chick",
                description: "Send a random chicken/chick picture",
                displayDescription: "Send a random chicken/chick picture",
                options: [],
                applicationId: "-1",
                inputType: 1,
                type: 1,
                execute: function (_args, _ctx) {
                    return getRandomImageUrl().then(function (url) {
                        return { content: url };
                    }).catch(function (e) {
                        showToast("Chickenizer error: " + e.message, null);
                        return { content: "⚠️ Couldn't fetch a chicken: " + e.message };
                    });
                },
            })
        );

        unregisterFns.push(
            registerCommand({
                name: "chick-add",
                displayName: "chick-add",
                description: "Add a new chicken/chick image source",
                displayDescription: "Add a new chicken/chick image source (static URL or random-API endpoint)",
                options: [
                    {
                        name: "url",
                        description: "Direct image URL, or a JSON API endpoint that returns one",
                        type: 3,
                        required: true,
                    },
                    {
                        name: "type",
                        description: "static (direct image link) or random (JSON API)",
                        type: 3,
                        required: false,
                    },
                    {
                        name: "json_path",
                        description: "For type=random: dot-path to the url field in the JSON response, e.g. data.url",
                        type: 3,
                        required: false,
                    },
                ],
                applicationId: "-1",
                inputType: 1,
                type: 1,
                execute: function (args) {
                    ensureStorage();
                    var urlArg = args.filter(function (a) { return a.name === "url"; })[0];
                    var typeArg = args.filter(function (a) { return a.name === "type"; })[0];
                    var pathArg = args.filter(function (a) { return a.name === "json_path"; })[0];

                    var url = urlArg ? urlArg.value : null;
                    var type = typeArg ? typeArg.value : "static";
                    var jsonPath = pathArg ? pathArg.value : "url";

                    if (!url) return { content: "⚠️ You need to provide a URL." };

                    if (type === "random") {
                        storage.sources.push({
                            name: url,
                            type: "random",
                            endpoint: url,
                            path: jsonPath,
                        });
                    } else {
                        storage.sources.push({
                            name: url,
                            type: "static",
                            urls: [url],
                        });
                    }

                    return { content: "✅ Added source: " + url + " (type: " + type + ")" };
                },
            })
        );

        unregisterFns.push(
            registerCommand({
                name: "chick-list",
                displayName: "chick-list",
                description: "List current chicken/chick image sources",
                displayDescription: "List current chicken/chick image sources",
                options: [],
                applicationId: "-1",
                inputType: 1,
                type: 1,
                execute: function () {
                    ensureStorage();
                    var lines = storage.sources.map(function (s, i) {
                        return i + ": [" + s.type + "] " + s.name;
                    });
                    return { content: lines.length ? lines.join("\n") : "No sources configured." };
                },
            })
        );

        unregisterFns.push(
            registerCommand({
                name: "chick-remove",
                displayName: "chick-remove",
                description: "Remove a chicken/chick image source by index",
                displayDescription: "Remove a source by the index shown in /chick-list",
                options: [
                    {
                        name: "index",
                        description: "Index from /chick-list",
                        type: 4,
                        required: true,
                    },
                ],
                applicationId: "-1",
                inputType: 1,
                type: 1,
                execute: function (args) {
                    ensureStorage();
                    var indexArg = args.filter(function (a) { return a.name === "index"; })[0];
                    var index = indexArg ? indexArg.value : null;
                    if (index == null || index < 0 || index >= storage.sources.length) {
                        return { content: "⚠️ Invalid index. Check /chick-list." };
                    }
                    var removed = storage.sources.splice(index, 1);
                    return { content: "🗑️ Removed: " + (removed[0] ? removed[0].name : "unknown") };
                },
            })
        );
    }

    function onUnload() {
        unregisterFns.forEach(function (unregister) { unregister(); });
        unregisterFns = [];
    }

    // Revenge/Vendetta evaluates this file and looks for these exports
    // on `module.exports` (CommonJS-style), not ES `export`.
    module.exports = { onLoad: onLoad, onUnload: onUnload };
})();
