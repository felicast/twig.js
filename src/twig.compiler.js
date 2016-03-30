//     Twig.js
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.compiler.js
//
// This file handles compiling templates into JS
var Twig = (function (Twig) {
    /**
     * Namespace for compilation.
     */
    Twig.compiler = {
        module: {}
    };

    // Compile a Twig Template to output.
    Twig.compiler.compile = function(template, options) {
        // Get tokens
        var tokens = JSON.stringify(template.tokens)
            , id = template.id
            , output;

        if (options.module) {
            if (Twig.compiler.module[options.module] === undefined) {
                throw new Twig.Error("Unable to find module type " + options.module);
            }
            output = Twig.compiler.module[options.module](id, tokens, options.twig, options.compilerOptions);
        } else {
            output = Twig.compiler.wrap(id, tokens);
        }
        return output;
    };

    Twig.compiler.module = {
        amd: function(id, tokens, pathToTwig) {
            return 'define(["' + pathToTwig + '"], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = ' + Twig.compiler.wrap(id, tokens) + '\n\treturn templates;\n});';
        },
        amdSmart: function(id, tokens, pathToTwig, options) {
            var required = [];
            required.push('"' + pathToTwig + '"');
            if (options.required) {
                options.required.forEach(function (req) {
                    required.push('"' + req + '"');
                });
            }
            console.log(options.runtimeOptions);
            return 'define([' + required.join(', ') + '], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = ' + Twig.compiler.wrap(id, tokens, options.runtimeOptions) + '\n\treturn function () { return templates.render.apply(templates, arguments); };\n});';
        },
        node: function(id, tokens) {
            return 'var twig = require("twig").twig;\n'
                + 'exports.template = ' + Twig.compiler.wrap(id, tokens)
        },
        cjs2: function(id, tokens, pathToTwig) {
            return 'module.declare([{ twig: "' + pathToTwig + '" }], function (require, exports, module) {\n'
                        + '\tvar twig = require("twig").twig;\n'
                        + '\texports.template = ' + Twig.compiler.wrap(id, tokens)
                    + '\n});'
        }
    };

    Twig.compiler.wrap = function(id, tokens, options) {
        var runOptions = {
            id: id,
            data: JSON.parse(tokens),
            precompiled: true
        };
        if (options) {
            Twig.merge(runOptions, options);
        }
            console.log(runOptions);
        //return 'twig({id:"'+id.replace('"', '\\"')+'", data:'+tokens+', precompiled: true});\n';
        return 'twig(' + JSON.stringify(runOptions) + ');\n';
    };

    return Twig;
})(Twig || {});
