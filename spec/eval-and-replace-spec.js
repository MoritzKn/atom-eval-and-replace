// jshint jasmine: true
/* globals waitsForPromise */

describe('EvalAndReplace', () => {
    let workspaceElement, editorElement, editor, activationPromise;

    function lineRange(line) {
        return [[line, 0], [line, Infinity]];
    }

    function getSelectedRanges(editor) {
        return editor.getSelections().map(s => s.getBufferRange());
    }

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace);

        waitsForPromise(() => atom.workspace.open('test.txt'));

        runs(() => {
            editor = atom.workspace.getActiveTextEditor();
            editorElement = atom.views.getView(editor);
            activationPromise = atom.packages.activatePackage('eval-and-replace');

            editor.setText('');
        });
    });

    describe('eval-and-replace:coffee', () => {
        it('evaluates each selection and replaces the selection with the result', () => {
            editor.buffer.append('45 + 12\n');
            editor.addSelectionForBufferRange([[0, 0], [0, 7]]);
            editor.buffer.append('Math.pow 5, 2\n');
            editor.addSelectionForBufferRange([[1, 0], [1, 13]]);
            editor.buffer.append('12 / 3\n');
            editor.addSelectionForBufferRange([[2, 0], [2, 6]]);
            editor.buffer.append('(parseInt "80") * 5\n');
            editor.addSelectionForBufferRange([[3, 0], [3, 19]]);

            atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

            waitsForPromise(() => activationPromise);

            runs(() => {
                const selectionRanges = getSelectedRanges(editor);
                expect(editor.buffer.getTextInRange([[0, 0], [0, 2]])).toBe('57');
                expect(selectionRanges[1].start.row).toBe(0);
                expect(selectionRanges[1].start.column).toBe(0);
                expect(selectionRanges[1].end.row).toBe(0);
                expect(selectionRanges[1].end.column).toBe(2);

                expect(editor.buffer.getTextInRange([[1, 0], [1, 2]])).toBe('25');
                expect(selectionRanges[2].start.row).toBe(1);
                expect(selectionRanges[2].start.column).toBe(0);
                expect(selectionRanges[2].end.row).toBe(1);
                expect(selectionRanges[2].end.column).toBe(2);

                expect(editor.buffer.getTextInRange([[2, 0], [2, 1]])).toBe('4');
                expect(selectionRanges[3].start.row).toBe(2);
                expect(selectionRanges[3].start.column).toBe(0);
                expect(selectionRanges[3].end.row).toBe(2);
                expect(selectionRanges[3].end.column).toBe(1);

                expect(editor.buffer.getTextInRange([[3, 0], [3, 3]])).toBe('400');
                expect(selectionRanges[4].start.row).toBe(3);
                expect(selectionRanges[4].start.column).toBe(0);
                expect(selectionRanges[4].end.row).toBe(3);
                expect(selectionRanges[4].end.column).toBe(3);
            });
        });
    });

    describe('eval-and-replace:js', () => {
        it('evaluates each selection and replaces the selection with the result', () => {
            editor.buffer.append('45 + 12\n');
            editor.addSelectionForBufferRange([[0, 0], [0, 7]]);
            editor.buffer.append('Math.pow(5, 2)\n');
            editor.addSelectionForBufferRange([[1, 0], [1, 14]]);
            editor.buffer.append('12 / 3\n');
            editor.addSelectionForBufferRange([[2, 0], [2, 6]]);
            editor.buffer.append('parseInt("80") * 5\n');
            editor.addSelectionForBufferRange([[3, 0], [3, 18]]);

            atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

            waitsForPromise(() => activationPromise);

            runs(() => {
                const selectionRanges = getSelectedRanges(editor);
                expect(editor.buffer.getTextInRange([[0, 0], [0, 2]])).toBe('57');
                expect(selectionRanges[1].start.row).toBe(0);
                expect(selectionRanges[1].start.column).toBe(0);
                expect(selectionRanges[1].end.row).toBe(0);
                expect(selectionRanges[1].end.column).toBe(2);

                expect(editor.buffer.getTextInRange([[1, 0], [1, 2]])).toBe('25');
                expect(selectionRanges[2].start.row).toBe(1);
                expect(selectionRanges[2].start.column).toBe(0);
                expect(selectionRanges[2].end.row).toBe(1);
                expect(selectionRanges[2].end.column).toBe(2);

                expect(editor.buffer.getTextInRange([[2, 0], [2, 1]])).toBe('4');
                expect(selectionRanges[3].start.row).toBe(2);
                expect(selectionRanges[3].start.column).toBe(0);
                expect(selectionRanges[3].end.row).toBe(2);
                expect(selectionRanges[3].end.column).toBe(1);

                expect(editor.buffer.getTextInRange([[3, 0], [3, 3]])).toBe('400');
                expect(selectionRanges[4].start.row).toBe(3);
                expect(selectionRanges[4].start.column).toBe(0);
                expect(selectionRanges[4].end.row).toBe(3);
                expect(selectionRanges[4].end.column).toBe(3);
            });
        });
    });

    ['js', 'coffee'].forEach(type => {
        describe(type + ' execution', () => {
            it('executes the JS code in a new context', () => {
                editor.buffer.append('require("fs")\n');
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe('require is not defined');
                });
            });

            it('executes all selections in the same context', () => {
                editor.buffer.append('foo = 40\n\n');
                editor.addSelectionForBufferRange([[0, 0], [0, 8]]);
                editor.buffer.append('foo + 2\n');
                editor.addSelectionForBufferRange([[2, 0], [2, 7]]);

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe('40');
                    expect(editor.buffer.getTextInRange(lineRange(2))).toBe('42');
                });
            });

            it('provides aliases for math functions', () => {
                editor.buffer.append('pow(15, 5)');
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe('759375');
                });
            });

            it('initializes some variables', () => {
                editor.buffer.append('i + j + n + x + y + z');
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe('0');
                });
            });

            it('provides a variable for the path of the open file', () => {
                editor.buffer.append('filePath');
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe(editor.getPath());
                });
            });

            it('provides a variable for the name of the open file', () => {
                editor.buffer.append('fileName');
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe(editor.getFileName());
                });
            });

            it('uses the toString function of an returned object if helpful', () => {
                editor.buffer.append('({ toString: () => "foo" })');
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe('foo');
                });
            });

            it('stringify an returned object if the toString function is not helpful', () => {
                editor.buffer.append('({ foo: { a: 0, b: 1 } }).foo');
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe('{"a":0,"b":1}');
                });
            });

            it('executes the selection from top to bottom', () => {
                editor.buffer.append('i++\n');
                editor.buffer.append('i++\n');
                editor.buffer.append('i++\n');

                editor.addSelectionForBufferRange(lineRange(1));
                editor.addSelectionForBufferRange(lineRange(2));
                editor.addSelectionForBufferRange(lineRange(0));

                atom.commands.dispatch(editorElement, 'eval-and-replace:coffee');

                waitsForPromise(() => activationPromise);

                runs(() => {
                    expect(editor.buffer.getTextInRange(lineRange(0))).toBe('0');
                    expect(editor.buffer.getTextInRange(lineRange(1))).toBe('1');
                    expect(editor.buffer.getTextInRange(lineRange(2))).toBe('2');
                });
            });
        });
    });

    describe('eval-and-replace:shell', () => {
        it('evaluates each selection and replaces the selection with the result', () => {
            editor.buffer.append('echo foo bar\n');
            editor.addSelectionForBufferRange([[0, 0], [0, 12]]);
            editor.buffer.append('pwd\n');
            editor.addSelectionForBufferRange([[1, 0], [1, 3]]);
            editor.buffer.append('git --version\n');
            editor.addSelectionForBufferRange([[2, 0], [2, 13]]);

            atom.commands.dispatch(editorElement, 'eval-and-replace:shell');

            waitsForPromise(() => activationPromise);

            runs(() => {
                const selectionRanges = getSelectedRanges(editor);
                expect(editor.buffer.getTextInRange([[0, 0], [0, 7]])).toBe('foo bar');
                expect(selectionRanges[1].start.row).toBe(0);
                expect(selectionRanges[1].start.column).toBe(0);
                expect(selectionRanges[1].end.row).toBe(0);
                expect(selectionRanges[1].end.column).toBe(7);

                expect(editor.buffer.getTextInRange(lineRange(1))).toMatch(/^(\/|\w:\\)/);
                expect(selectionRanges[2].start.row).toBe(1);
                expect(selectionRanges[2].start.column).toBe(0);
                expect(selectionRanges[2].end.row).toBe(1);
                expect(selectionRanges[2].end.column).toBeDefined();

                expect(editor.buffer.getTextInRange(lineRange(2))).toMatch(/^git\s+/);
                expect(selectionRanges[3].start.row).toBe(2);
                expect(selectionRanges[3].start.column).toBe(0);
                expect(selectionRanges[3].end.row).toBe(2);
                expect(selectionRanges[3].end.column).toBeDefined();
            });
        });

        it('passes the $PATH variable', () => {
            editor.buffer.append('echo $PATH');
            editor.addSelectionForBufferRange(lineRange(0));

            atom.commands.dispatch(editorElement, 'eval-and-replace:shell');

            waitsForPromise(() => activationPromise);

            runs(() => {
                expect(editor.buffer.getTextInRange(lineRange(0)).trim()).not.toBe('');
            });
        });

        it('provides a variable for the path of the open file', () => {
            editor.buffer.append('echo $FILE_PATH');
            editor.addSelectionForBufferRange(lineRange(0));

            atom.commands.dispatch(editorElement, 'eval-and-replace:shell');

            waitsForPromise(() => activationPromise);

            runs(() => {
                expect(editor.buffer.getTextInRange(lineRange(0))).toBe(editor.getPath());
            });
        });

        it('provides a variable for the name of the open file', () => {
            editor.buffer.append('echo $FILE_NAME');
            editor.addSelectionForBufferRange(lineRange(0));

            atom.commands.dispatch(editorElement, 'eval-and-replace:shell');

            waitsForPromise(() => activationPromise);

            runs(() => {
                expect(editor.buffer.getTextInRange(lineRange(0))).toBe(editor.getFileName());
            });
        });
    });
});
