'use babel';

import {CompositeDisposable} from 'atom';

// lazy loaded module
let vm = null;
let exec = null;
let CoffeeScript = null;

function stringify(something) {
    if (typeof something === 'object') {
        if (typeof something.toString === 'function') {
            const str = something.toString();
            if (!/^\[object /.test(str)) {
                return str;
            }
        }

        return JSON.stringify(something);
    } else {
        return '' + something;
    }
}

function toSnakeCase(str) {
    return ('' + str).replace(/[a-z](?=[A-Z])/g, c => c + '_').toLowerCase();
}

function logError(atCode, err) {
    console.error(`Error evaluating "${atCode}"`, err);
    const msg = err.message;
    if (msg) {
        atom.notifications.addWarning(`Error evaluating "${atCode}": ${msg}`);
    } else {
        atom.notifications.addWarning(`Error evaluating "${atCode}"`);
    }
}

function getActiveProject() {
    const editorPath = atom.workspace.getActiveTextEditor().getPath();
    if (!editorPath) {
        return;
    }

    return atom.project.getPaths()
        .filter(path => editorPath.startsWith(path))
        .sort((a, b) => (a && b && Math.sign(a.length - b.length)) || 0)
        [0];
}

function getContextVariables(editor) {
    return {
        i: 0,
        j: 0,
        n: 0,
        x: 0,
        y: 0,
        z: 0,
        PI: Math.PI,
        E: Math.E,
        filePath: editor.getPath(),
        fileName: editor.getFileName(),
        project: getActiveProject(),
    };
}

function getContextFunctions() {
    return {
        random: Math.random,
        pow: Math.pow,
        sqrt: Math.sqrt,
        abs: Math.abs,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
    };
}

function replaceEachSelection(fn) {
    const editor = atom.workspace.getActiveTextEditor();

    editor.transact(() => {
        editor.getSelectedBufferRanges();

        const ranges = editor.getSelectedBufferRanges();
        const sortedRanges = ranges.sort((a, b) =>
            (a && b && Math.sign(a.start.row - b.start.row)) || 0);

        sortedRanges.forEach((range, index) => {
            if (range.isEmpty()) {
                return;
            }

            const text = editor.buffer.getTextInRange(range);
            const result = fn(text, {editor, range, index});
            editor.buffer.setTextInRange(range, '' + result);
        });
    });
}

function createEvalContext(editor) {
    const ctx = {};

    const vars = getContextVariables(editor);
    Object.keys(vars).forEach(k => ctx[k] = vars[k]);

    const funcs = getContextFunctions();
    Object.keys(funcs).forEach(k => ctx[k] = funcs[k]);

    return ctx;
}

function runJs(code, ctx) {
    if (!vm) {
        vm = require('vm');
    }

    try {
        const result = vm.runInNewContext(code, ctx, {timeout: 200});
        return stringify(result);
    } catch (err) {
        logError(code, err);
        return err.message || stringify(err);
    }
}

function evalAndReplaceJs() {
    let ctx;
    replaceEachSelection((code, {editor}) => {
        ctx = ctx || createEvalContext(editor);
        return runJs(code, ctx);
    });
}

function coffeeToJs(code) {
    if (!CoffeeScript) {
        CoffeeScript = require('coffee-script');
    }

    code = code.replace(/\s*$/, '');
    const lines = code.split('\n');
    const lastLine = lines[lines.length - 1];
    if (!/\s*retuns\s+/.test(lastLine)) {
        const indent = lastLine.match(/^\s*/)[0];
        lines[lines.length - 1] = indent + 'return ' + lastLine.replace(/^\s+/g, '');
    }
    code = lines.join('\n');

    return CoffeeScript.compile(code);
}

function runCoffee(code, ctx) {
    try {
        code = coffeeToJs(code);
    } catch (err) {
        logError(code, err);
        return err.message || stringify(err);
    }
    return runJs(code, ctx);
}

function evalAndReplaceCoffee() {
    let ctx;

    replaceEachSelection((code, {editor}) => {
        ctx = ctx || createEvalContext(editor);
        return runCoffee(code, ctx);
    });
}

function runShell(code, env, cwd) {
    try {
        if (!exec) {
            exec = require('child_process').execSync;
        }

        const result = '' + exec(code, {
            encoding: 'utf-8',
            maxBuffer: 1024 * 10,
            timeout: 1000,
            cwd,
            env,
        });

        return result.replace(/\n\s?$/, '');
    } catch (err) {
        logError(code, err);
        return err.message || stringify(err);
    }
}

function createShellEnv(editor) {
    const vars = getContextVariables(editor);
    const env = {
        PATH: process.env.PATH
    };

    Object.keys(vars).forEach(k => env[toSnakeCase(k).toUpperCase()] = vars[k]);
    return env;
}

function evalAndReplaceShell() {
    let env;
    replaceEachSelection((code, {editor}) => {
        env = env || createShellEnv(editor);
        return runShell(code, env, getActiveProject());
    });
}

export default {
    subscriptions: null,

    activate() {
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'eval-and-replace:coffee': () => evalAndReplaceCoffee(),
            'eval-and-replace:js': () => evalAndReplaceJs(),
            'eval-and-replace:shell': () => evalAndReplaceShell(),
        }));
    },

    deactivate() {
        if (this.subscriptions) {
            this.subscriptions.dispose();
        }
    }
};
