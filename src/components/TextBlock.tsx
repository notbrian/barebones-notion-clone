import React from "react";
import { TextNode, padAction } from "./types";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { v4 as uuidv4 } from "uuid";

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

  // Edit the block text or deletes it if empty
  const handleChange = (e: ContentEditableEvent) => {
    if (e.target.value !== "") {
      dispatch({ type: "edit", id: id, text: e.target.value });
    } else {
      dispatch({ type: "delete", id: id });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Creates a new block below on enter press
    if (e.key === "Enter") {
      e.preventDefault();
      const newID = uuidv4();
      dispatch({ type: "addblock", id: id, newID });
      // Focus onto the new block that is going to be created
      setFocus(newID);
      return;
    }

    // Unidents this block on shift+tab
    if (e.shiftKey && e.key === "Tab") {
      dispatch({ type: "unindent", id: id });
      setFocus(id);
      return;
    }

    // Intents this block on tab
    if (e.key === "Tab") {
      e.preventDefault();
      dispatch({ type: "indent", id: id });
      setFocus(id);
      return;
    }

    // Change the focussed element
    if (e.key === "ArrowUp") {
      e.preventDefault();
      MoveUp(id);
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      MoveDown(id);
    }
  };

  // On select, change the focus state to this block
  const handleSelect = () => {
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
          onSelect={handleSelect}
          id={id}
        />
        {/* Render nested blocks */}
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

export default TextBlock;
