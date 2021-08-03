import { TextNode } from "./types";

// Finds a block by its ID using recursion search, returns undefined if it doesn't exist
export function findById(data: TextNode[], id: string): TextNode | undefined {
  for (var i = 0; i < data.length; i++) {
    if (data[i].id === id) {
      return data[i];
    } else if (
      data[i].children &&
      data[i].children.length &&
      typeof data[i].children === "object"
    ) {
      const result = findById(data[i].children, id);
      if (result === undefined) continue;
      return result;
    }
  }
}

// Finds the lowest (not deepest) child in a node using recursion
export function findLowest(data: TextNode): TextNode {
  if (data.children.length) {
    const last = data.children[data.children.length - 1];
    return findLowest(last);
  } else {
    return data;
  }
}

// Sourced from https://medium.com/swlh/how-to-build-a-text-editor-like-notion-c510aedfdfcc
// Sets the selected input caret to the end of the line
export const setCaretToEnd = (element: HTMLElement) => {
  const range = document.createRange();
  const selection = window.getSelection() as Selection;
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  element.focus();
};

// Recursively searches "up" to find the next node that has neighbours
export const findNextNode = (node: TextNode, data: TextNode[]): TextNode => {
  if (node.parent) {
    // Find the parent of the node passed
    const parent = findById(data, node.parent) as TextNode;
    const nodeIndex = parent.children.findIndex((child) => child === node);
    // If the parent is alone or the last one, keep going up the chain
    if (nodeIndex === parent.children.length - 1) {
      return findNextNode(parent, data);
    }
    // Else pass its next down neighbour
    else {
      return parent.children[nodeIndex + 1];
    }
  }
  // If the search eventually reaches the top level, just simply pass its next down neighobur
  else {
    const nodeIndex = data.findIndex((child) => child === node);
    if (nodeIndex < data.length - 1) {
      return data[nodeIndex + 1];
    } else {
      return node;
    }
  }
};
