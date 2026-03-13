// undo_redo.js
// 変数を直接保持して export する
export let undoStack = [];
export let redoStack = [];

export function saveState(currentState) {
    undoStack.push(JSON.stringify(currentState));
    redoStack = []; 
    console.log("スタックに保存。現在のサイズ:", undoStack.length);
}

export function undo(currentState) {
    if (undoStack.length === 0) return null;
    redoStack.push(JSON.stringify(currentState));
    return JSON.parse(undoStack.pop());
}

export function redo(currentState) {
    if (redoStack.length === 0) return null;
    undoStack.push(JSON.stringify(currentState));
    return JSON.parse(redoStack.pop());
}