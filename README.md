# eval-and-replace

[![Build Status](https://travis-ci.org/MoritzKn/atom-eval-and-replace.svg?branch=master)](https://travis-ci.org/MoritzKn/atom-eval-and-replace)

Execute CoffeeScript, JavaScript or Shell code from the [Atom](https://atom.io) editor and replace the code with the result.

![calc](https://raw.githubusercontent.com/MoritzKn/atom-eval-and-replace/master/doc/git.gif)

![calc](https://raw.githubusercontent.com/MoritzKn/atom-eval-and-replace/master/doc/calc.gif)

![calc](https://raw.githubusercontent.com/MoritzKn/atom-eval-and-replace/master/doc/count.gif)

![calc](https://raw.githubusercontent.com/MoritzKn/atom-eval-and-replace/master/doc/url.gif)

## Install
```sh
apm install eval-and-replace
```

## Commands
| Commands                   | Description                         | Default keybinding                                               |
| :------------------------- | ----------------------------------- | :--------------------------------------------------------------- |
| `eval-and-replace:coffee`  | Executes selected CoffeeScript code | <kbd>ctrl-shift-e ctrl-shift-c</kbd> or <kbd>ctrl-k ctrl-e</kbd> |
| `eval-and-replace:js`      | Executes selected JavaScript code   | <kbd>ctrl-shift-e ctrl-shift-j</kbd>                             |
| `eval-and-replace:shell`   | Executes selected Shell code        | <kbd>ctrl-shift-e ctrl-shift-s</kbd>                             |

**Be careful with `eval-and-replace:shell`; nobody will prevent you from executing `rm -rf /`!**

## Shell environment variables
When executing shell code with `eval-and-replace:shell` you have access to these variables:
* `FILE_PATH`: path to of the currently opened file
* `FILE_NAME`: name of the currently opened file
* `PROJECT`: path to the Atom project

## CoffeeScript / JS Context
CoffeeScript / JS code is executed in its own context, this means you can only use ECMAScript
functions (i.e. no`require`). But the same context is used for all selections, so you can reuse
variables. Additionally you have access to these functions and variables:

* `i`, `j`, `n`, `x`, `y`, `z`: initialized with `0`
* `filePath`: path of the opened file
* `fileName`: name of the opened file
* `project`: path of the current Atom project
* `PI`: alias for `Math.PI`
* `E`: alias for `Math.E`
* `random()`: alias for `Math.random()`
* `pow()`: alias for `Math.pow()`
* `sqrt()`: alias for `Math.sqrt()`
* `abs()`: alias for `Math.abs()`
* `sin()`: alias for `Math.sin()`
* `cos()`: alias for `Math.cos()`
* `tan()`: alias for `Math.tan()`
* `floor()`: alias for `Math.floor()`
* `ceil()`: alias for `Math.ceil()`
* `round()`: alias for `Math.round()`

## License
This project is licensed under the terms of the MIT license. A copy of the license can
be found in the root directory of the project in the file [LICENSE.md](./LICENSE.md).
