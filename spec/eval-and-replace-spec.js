// jshint jasmine: true
/* globals waitsForPromise */

describe('EvalAndReplace', () => {
    let workspaceElement, editor;

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace);

        waitsForPromise(() => atom.workspace.open('test.txt'));

        runs(() => {
            editor = atom.workspace.getActiveTextEditor();
            editor.setText('');
            atom.packages.activatePackage('eval-and-replace');
        });
    });

    describe('eval-and-replace:coffee', () => {
        it('evaluates the selection and replaces the selection with the result', () => {
            editor.buffer.append('45 + 12\n');
            editor.addSelectionForBufferRange([[0, 0], [0, Infinity]]);
            editor.buffer.append('Math.pow 5, 2\n');
            editor.addSelectionForBufferRange([[1, 0], [1, Infinity]]);
            editor.buffer.append('12 / 3\n');
            editor.addSelectionForBufferRange([[2, 0], [2, Infinity]]);
            editor.buffer.append('(parseInt "80") * 5\n');
            editor.addSelectionForBufferRange([[3, 0], [3, Infinity]]);

            atom.commands.dispatch(workspaceElement, 'eval-and-replace:coffee');

            expect(editor.buffer.getTextInRange([[0, 0], [0, Infinity]])).toBe('57');
            expect(editor.buffer.getTextInRange([[1, 0], [1, Infinity]])).toBe('25');
            expect(editor.buffer.getTextInRange([[2, 0], [2, Infinity]])).toBe('4');
            expect(editor.buffer.getTextInRange([[3, 0], [3, Infinity]])).toBe('400');
        });
    });

    describe('eval-and-replace:js', () => {
        it('evaluates the selection and replaces the selection with the result', () => {
            editor.buffer.append('45 + 12\n');
            editor.addSelectionForBufferRange([[0, 0], [0, Infinity]]);
            editor.buffer.append('Math.pow(5, 2)\n');
            editor.addSelectionForBufferRange([[1, 0], [1, Infinity]]);
            editor.buffer.append('12 / 3\n');
            editor.addSelectionForBufferRange([[2, 0], [2, Infinity]]);
            editor.buffer.append('parseInt("80") * 5\n');
            editor.addSelectionForBufferRange([[3, 0], [3, Infinity]]);

            atom.commands.dispatch(workspaceElement, 'eval-and-replace:js');

            expect(editor.buffer.getTextInRange([[0, 0], [0, Infinity]])).toBe('57');
            expect(editor.buffer.getTextInRange([[1, 0], [1, Infinity]])).toBe('25');
            expect(editor.buffer.getTextInRange([[2, 0], [2, Infinity]])).toBe('4');
            expect(editor.buffer.getTextInRange([[3, 0], [3, Infinity]])).toBe('400');
        });
    });

    describe('eval-and-replace:shell', () => {
        it('evaluates the selection and replaces the selection with the result', () => {
            editor.buffer.append('echo foo bar\n');
            editor.addSelectionForBufferRange([[0, 0], [0, Infinity]]);
            editor.buffer.append('pwd\n');
            editor.addSelectionForBufferRange([[1, 0], [1, Infinity]]);
            editor.buffer.append('git --version\n');
            editor.addSelectionForBufferRange([[2, 0], [2, Infinity]]);
            editor.buffer.append('parseInt("80") * 5\n');
            editor.addSelectionForBufferRange([[3, 0], [3, Infinity]]);

            atom.commands.dispatch(workspaceElement, 'eval-and-replace:shell');

            expect(editor.buffer.getTextInRange([[0, 0], [0, Infinity]])).toBe('foo bar');
            expect(editor.buffer.getTextInRange([[1, 0], [1, Infinity]])).toBeTruthy();
            expect(editor.buffer.getTextInRange([[2, 0], [2, Infinity]])).toMatch(/^git\s+/);
        });
    });
});
