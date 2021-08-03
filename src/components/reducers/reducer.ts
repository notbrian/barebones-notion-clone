import { TextNode, padAction } from "../types";
import { findById } from "../helpers";

export function reducer(state: TextNode[], action: padAction) {
  switch (action.type) {
    // Action: Edit a blocks text
    case "edit": {
      // Deep clone the state
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      // Find the node in question
      const node = findById(newState, action.id);
      // Replace the text with the passed value
      if (node) {
        node.text = action.text as string;
      }
      return newState;
    }
    // Action: Add a new block underneath inputted block
    case "addblock": {
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      // Find the node in question
      const node = findById(newState, action.id);
      if (!node) return state;

      // If the node is nested, find its parent and add a new block after the node
      if (node.parent) {
        const parent = findById(newState, node.parent) as TextNode;
        const index = parent.children.findIndex(
          (testNode) => node === testNode
        );
        parent?.children.splice(index + 1, 0, {
          text: "New Text",
          children: [],
          id: action.newID as string,
          parent: parent.id,
        });
      }
      // If this node is top level, add a new block after it
      else {
        const index = newState.findIndex((testNode) => node === testNode);
        newState.splice(index + 1, 0, {
          text: "New Text",
          children: [],
          id: action.newID as string,
        });
      }
      return newState;
    }
    // Action: Indent a block
    case "indent": {
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      const node = findById(newState, action.id);
      if (!node) return state;
      // If nested
      if (node.parent) {
        const parent = findById(newState, node.parent) as TextNode;
        const index = parent.children.findIndex((child) => child === node);
        if (index > 0) {
          // Find the nodes new parent
          const newParent = parent.children[index - 1];
          // Splice the node from its original parent and push it into its new parent
          const spliceNode = parent.children.splice(index, 1)[0];
          spliceNode.parent = newParent.id;
          parent.children[index - 1].children.push(spliceNode);
        }
      }
      // If top level
      else {
        const index = newState.findIndex((child) => child === node);
        // If the 1st node don't do anything
        if (index <= 0) return state;
        // Otherwise find its new parent and splice
        const newParent = newState[index - 1];
        const spliceNode = newState.splice(index, 1)[0];
        spliceNode.parent = newParent.id;
        newParent.children.push(spliceNode);
      }
      return newState;
    }

    // Action: Unindent a block
    case "unindent": {
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      const node = findById(newState, action.id);
      if (!node) return state;
      // If nested
      if (node.parent) {
        // Splice the node from its parent
        const parent = findById(newState, node.parent) as TextNode;
        const index = parent.children.findIndex((child) => child === node);
        const spliceNode = parent.children.splice(index, 1)[0];
        // If the nodes parent is nested, then place the node under that
        if (parent.parent) {
          const parentsParent = findById(newState, parent.parent) as TextNode;
          const parentIndex = parentsParent.children.findIndex(
            (child) => child === parent
          );
          spliceNode.parent = parentsParent.id;
          parentsParent.children.splice(parentIndex + 1, 0, spliceNode);
        }
        // Else move this to the top level
        else {
          spliceNode.parent = undefined;
          const parentIndex = newState.findIndex((child) => child === parent);
          newState.splice(parentIndex + 1, 0, spliceNode);
        }
      }

      return newState;
    }

    // Action: Delete a node
    case "delete": {
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      const node = findById(newState, action.id);
      if (!node) return state;
      // If nested
      if (node.parent) {
        const parent = findById(newState, node.parent) as TextNode;
        const index = parent.children.findIndex((child) => child === node);
        parent.children.splice(index, 1);
      }
      // If top level
      else {
        const index = newState.findIndex((child) => child === node);
        newState.splice(index, 1);
      }
      return newState;
    }
    default:
      throw new Error();
  }
}
