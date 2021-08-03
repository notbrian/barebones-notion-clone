import React, { useEffect, useReducer, useRef, useState } from "react";
import "./App.css";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { v4 as uuidv4 } from "uuid";

interface TextNode {
  text: string;
  children: TextNode[];
  id: string;
  parent?: string;
}

function findById(data: TextNode[], id: string): TextNode | undefined {
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

function findLowest(data: TextNode): TextNode {
  if (data.children.length) {
    const last = data.children[data.children.length - 1];
    return findLowest(last);
  } else {
    return data;
  }
}

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

// const defaultState = [
//   {
//     text: "Edit text",
//     children: [],
//     id: "27503a02-7563-4155-9c26-c9afb17674a8",
//   },
// ];

interface padAction {
  id: string;
  type: string;
  text?: string;
  newID?: string;
}

function reducer(state: TextNode[], action: padAction) {
  switch (action.type) {
    case "edit": {
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      const node = findById(newState, action.id);
      if (node) {
        node.text = action.text as string;
      }
      return newState;
    }
    case "addblock": {
      // deep copy needed
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      const node = findById(newState, action.id);
      // If nested
      if (node !== undefined && node.parent) {
        const parent = findById(newState, node.parent) as TextNode;
        parent?.children.push({
          text: "New Text",
          children: [],
          id: action.newID as string,
          parent: parent.id,
        });
      }
      // If top level
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
    case "indent": {
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      const node = findById(newState, action.id);
      if (!node) return state;
      // If nested
      if (node.parent) {
        const parent = findById(newState, node.parent) as TextNode;
        const index = parent.children.findIndex((child) => child === node);
        const newParent = parent.children[index - 1];
        if (!newParent) return state;
        const spliceNode = parent.children.splice(index, 1)[0];
        spliceNode.parent = newParent.id;
        parent.children[index - 1].children.push(spliceNode);
      }
      // If top level
      else {
        const index = newState.findIndex((child) => child === node);
        if (index <= 0) return state;
        const spliceNode = newState.splice(index, 1)[0];
        const newParent = newState[index - 1];
        spliceNode.parent = newParent.id;
        newParent.children.push(spliceNode);
      }
      return newState;
    }

    case "unindent": {
      let newState = JSON.parse(JSON.stringify(state)) as TextNode[];
      const node = findById(newState, action.id);
      if (!node) return state;
      // If nested
      if (node.parent) {
        const parent = findById(newState, node.parent) as TextNode;
        const index = parent.children.findIndex((child) => child === node);
        const spliceNode = parent.children.splice(index, 1)[0];
        if (parent.parent) {
          const parentsParent = findById(newState, parent.parent) as TextNode;
          spliceNode.parent = parentsParent.id;
          parentsParent.children.push(spliceNode);
        } else {
          spliceNode.parent = undefined;
          const parentIndex = newState.findIndex((child) => child === parent);
          newState.splice(parentIndex + 1, 0, spliceNode);
        }
      }

      return newState;
    }

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

const setCaretToEnd = (element: HTMLElement) => {
  const range = document.createRange();
  const selection = window.getSelection() as Selection;
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  element.focus();
};

function App() {
  const [padState, dispatch] = useReducer(reducer, defaultState);
  const [nextFocus, setFocus] = useState<string | null>(null);
  const padRef = useRef(padState);

  useEffect(() => {
    console.log(padState);
    padRef.current = padState;
  }, [padState]);

  useEffect(() => {
    if (nextFocus) {
      const focus = document.getElementById(nextFocus);
      if (focus !== null) {
        setCaretToEnd(focus);
      }
    }
  });

  const MoveUp = (id: string) => {
    const node = findById(padRef.current, id);
    if (!node) return;
    // If nested
    if (node.parent) {
      const parent = findById(padRef.current, node.parent) as TextNode;
      const nodeIndex = parent.children.findIndex((child) => child === node);
      if (nodeIndex > 0) {
        const aboveNeighbour = parent.children[nodeIndex - 1];
        setFocus(findLowest(aboveNeighbour).id);
      } else {
        setFocus(parent.id);
      }
    } else {
      const nodeIndex = padRef.current.findIndex((child) => child === node);
      if (nodeIndex > 0) {
        const aboveNeighbour = padRef.current[nodeIndex - 1];
        setFocus(findLowest(aboveNeighbour).id);
      }
    }
  };

  const MoveDown = (id: string) => {
    const node = findById(padRef.current, id);
    if (!node) return;
    // Go deeper down the children chain
    if (node.children.length) {
      setFocus(node.children[0].id);
    }

    // If theres no where else to go
    else {
      // If node is nested, go to its next down neighbour
      if (node.parent) {
        const parent = findById(padRef.current, node.parent) as TextNode;
        const nodeIndex = parent.children.findIndex((child) => child === node);
        if (nodeIndex < parent.children.length - 1) {
          setFocus(parent.children[nodeIndex + 1].id);
        }
        // If the node is the last in its list, go to its parents next neighbour
        else {
          if (parent.parent) {
            const findNextNode = (node: TextNode): TextNode => {
              // If nested, find the parent
              if (node.parent) {
                const parent = findById(
                  padRef.current,
                  node.parent
                ) as TextNode;

                const nodeIndex = parent.children.findIndex(
                  (child) => child === node
                );

                // If the new node is still the end of the line, find the parents parent
                if (parent.children.length === 1) {
                  return findNextNode(parent);
                } else {
                  return parent.children[nodeIndex + 1];
                }
              } else {
                const nodeIndex = padRef.current.findIndex(
                  (child) => child === node
                );
                if (nodeIndex < padRef.current.length - 1) {
                  return padRef.current[nodeIndex + 1];
                } else {
                  return node;
                }
              }
            };

            setFocus(findNextNode(parent).id);
          } else {
            const nodeIndex = padRef.current.findIndex(
              (child) => child === parent
            );
            if (nodeIndex < padRef.current.length - 1) {
              setFocus(padRef.current[nodeIndex + 1].id);
            }
          }
        }
      } else {
        const nodeIndex = padRef.current.findIndex((child) => child === node);
        if (nodeIndex < padRef.current.length - 1) {
          setFocus(padRef.current[nodeIndex + 1].id);
        }
      }
    }
  };
  return (
    <div className="App">
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

const TextBlock = ({
  data,
  dispatch,
  setFocus,
  MoveUp,
  MoveDown,
}: {
  data: TextNode;
  dispatch: React.Dispatch<padAction>;
  setFocus: (id: string) => void;
  MoveUp: (id: string) => void;
  MoveDown: (id: string) => void;
}) => {
  const { children, text, id } = data;

  const handleChange = (e: ContentEditableEvent) => {
    if (e.target.value !== "") {
      dispatch({ type: "edit", id: id, text: e.target.value });
    } else {
      dispatch({ type: "delete", id: id });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newID = uuidv4();
      dispatch({ type: "addblock", id: id, newID });
      setFocus(newID);
      return;
    }

    if (e.shiftKey && e.key === "Tab") {
      dispatch({ type: "unindent", id: id });
      setFocus(id);
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      dispatch({ type: "indent", id: id, newID: uuidv4() });
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      MoveUp(id);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      MoveDown(id);
    }
  };

  const handleFocus = () => {
    setFocus(id);
  };

  return (
    <div className="flex-block">
      <div className="bullet"></div>
      <div className="text-grow">
        <ContentEditable
          html={text}
          onChange={handleChange}
          className="text-block"
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          id={id}
        />
        {children.map((node) => {
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
};

export default App;
