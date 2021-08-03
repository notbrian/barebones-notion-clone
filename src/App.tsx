import React, { useEffect, useReducer, useRef, useState } from "react";
import "./App.css";
import {
  findById,
  findLowest,
  findNextNode,
  setCaretToEnd,
} from "./components/helpers";
import { reducer } from "./components/reducers/reducer";
import TextBlock from "./components/TextBlock";
import { TextNode } from "./components/types";

const defaultState = [
  {
    text: "Editable",
    children: [
      {
        text: "Child 1",
        children: [],
        id: "b1ce05ab-e9ed-48fb-a965-f01c9b9c6986",
        parent: "0afd8175-8d43-4f1f-bde0-09631e4ab6c1",
      },
    ],
    id: "0afd8175-8d43-4f1f-bde0-09631e4ab6c1",
  },
  {
    text: "Editable 2",
    children: [
      {
        text: "Child 1",
        children: [
          {
            text: "Child 2",
            children: [],
            id: "fb4b78d3-1d16-4b3c-9d52-6f5fac8d00e1",
            parent: "a7acd0b7-83c6-4e07-935c-875767a1591b",
          },
        ],
        id: "a7acd0b7-83c6-4e07-935c-875767a1591b",
        parent: "3333beb7-19cf-4798-bc0f-72f5aa5f9b83",
      },
    ],
    id: "3333beb7-19cf-4798-bc0f-72f5aa5f9b83",
  },
  {
    text: "Editable 3",
    children: [],
    id: "27503a02-7563-4155-9c26-c9afb17674a8",
  },
];

function App() {
  const [padState, dispatch] = useReducer(reducer, defaultState);
  const [nextFocus, setFocus] = useState<string | null>(null);
  // Ref of padState to fix stale state issues
  const padRef = useRef(padState);

  useEffect(() => {
    padRef.current = padState;
  }, [padState]);

  // On re-renders, focus to the nextFocus ID on the page (e.g new block, indent)
  useEffect(() => {
    if (nextFocus) {
      const focus = document.getElementById(nextFocus);
      if (focus !== null) {
        // Sets the caret to the end of the line
        setCaretToEnd(focus);
      }
    }
  });

  // Handler for moving the focused element up
  const MoveUp = (id: string) => {
    const node = findById(padRef.current, id);
    if (!node) return;
    // If nested
    if (node.parent) {
      const parent = findById(padRef.current, node.parent) as TextNode;
      const nodeIndex = parent.children.findIndex((child) => child === node);
      // If the node is not the first element in its neighbours
      if (nodeIndex > 0) {
        // Recursively find the lowest node of the node above it
        const aboveNeighbour = parent.children[nodeIndex - 1];
        setFocus(findLowest(aboveNeighbour).id);
      }
      // Else just focus on its parent
      else {
        setFocus(parent.id);
      }
    }
    // If top level
    else {
      const nodeIndex = padRef.current.findIndex((child) => child === node);
      // Find the lowest node of the above neighbour
      if (nodeIndex > 0) {
        const aboveNeighbour = padRef.current[nodeIndex - 1];
        setFocus(findLowest(aboveNeighbour).id);
      }
    }
  };

  // Handler for moving the focused element down
  const MoveDown = (id: string) => {
    const node = findById(padRef.current, id);
    if (!node) return;
    // Go deeper down the children chain
    if (node.children.length) {
      setFocus(node.children[0].id);
    }

    // If theres no more levels
    else {
      // If node is nested
      if (node.parent) {
        const parent = findById(padRef.current, node.parent) as TextNode;
        const nodeIndex = parent.children.findIndex((child) => child === node);
        // Go to its next down neighbour
        if (nodeIndex < parent.children.length - 1) {
          setFocus(parent.children[nodeIndex + 1].id);
        }
        // If the node is the last in its list, instead find the parent and
        // go to the its parents next down neighbour
        else {
          // If its parent is still nested
          if (parent.parent) {
            // Recursively search up to find the next node below this one
            setFocus(findNextNode(parent, padRef.current).id);
          }
          // If the parent is a top level element
          else {
            const nodeIndex = padRef.current.findIndex(
              (child) => child === parent
            );
            if (nodeIndex < padRef.current.length - 1) {
              setFocus(padRef.current[nodeIndex + 1].id);
            }
          }
        }
      }

      // If the node is a top level node, go down one
      else {
        const nodeIndex = padRef.current.findIndex((child) => child === node);
        if (nodeIndex < padRef.current.length - 1) {
          setFocus(padRef.current[nodeIndex + 1].id);
        }
      }
    }
  };
  return (
    <div className="App">
      <div id="instructions-wrapper">
        <p>Select and type to edit text</p>
        <p>Press enter to insert a new block</p>
        <p>Press tab to indent a block</p>
        <p>Press shift+tab to unindent a block</p>
      </div>
      <div id="pad">
        {padState.map((node) => {
          return (
            <TextBlock
              data={node}
              key={node.id}
              dispatch={dispatch}
              setFocus={setFocus}
              MoveUp={MoveUp}
              MoveDown={MoveDown}
            />
          );
        })}
      </div>
    </div>
  );
}
export default App;
