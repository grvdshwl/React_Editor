import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  ContentState,
  ContentBlock,genKey,
} from "draft-js";
import "draft-js/dist/Draft.css";
import "./MyEditor.css";

const styleMap = {
  REDTEXT: {
    color: "red",

  }
};

const styles = ["BOLD", "REDTEXT", "UNDERLINE"];

const MyEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("draftEditorContent");
    if (savedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(savedContent)),
      );
    }
    return EditorState.createEmpty();
  });

  useEffect(() => {
    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    );
  }, []);


  function createEmptyBlock(editorState) {
    const newBlock = new ContentBlock({
        key: genKey(), 
        type: "unstyled",
        text: "",
        
    });

    const contentState = editorState.getCurrentContent();
    const newBlockMap = contentState.getBlockMap().set(newBlock.getKey(), newBlock);

    const newContentState = ContentState.createFromBlockArray(
        newBlockMap.toArray()
    ).set(
        'selectionAfter',
        contentState.getSelectionAfter().merge({
            anchorKey: newBlock.getKey(),
            anchorOffset: 0,
            focusKey: newBlock.getKey(),
            focusOffset: 0,
            isBackward: false,
        })
    );

    let newEditorState =EditorState.createEmpty();

    let finalState = EditorState.push(
        newEditorState,
        newContentState,
        "split-block"
    );

    styles.forEach(style => {
      if (finalState.getCurrentInlineStyle().has(style)) {
          finalState = RichUtils.toggleInlineStyle(finalState, style, false);
      }


  });

  return finalState
}



  

  const handleChange = (newState) => {
    const content = newState.getCurrentContent();
    const blocks = content.getBlocksAsArray();
    const isHeading = blocks.some((block) => block.text.startsWith("# "));

    const isBold = blocks.some((block) => block.text.startsWith("* "));

    const isRed = blocks.some((block) => block.text.startsWith("** "));

    const isUnderLine = blocks.some((block) => block.text.startsWith("*** "));

    const isHighlight = false;

    if (isBold) {
      const newBlocks = blocks.filter(
        (block) => !block.getText().startsWith("* "),
      );
      const textContentState = ContentState.createFromText("");
      const textContentBlocksArr = textContentState.getFirstBlock();

      newBlocks.push(textContentBlocksArr);
      let state = EditorState.createWithContent(
        ContentState.createFromBlockArray(newBlocks),
      );
      const editState = EditorState.moveFocusToEnd(state);

      setEditorState(RichUtils.toggleInlineStyle(editState, "BOLD"));
    } else if (isUnderLine) {
      const newBlocks = blocks.filter(
        (block) => !block.getText().startsWith("*** "),
      );
      const textContentState = ContentState.createFromText("");
      const textContentBlocksArr = textContentState.getFirstBlock();

      newBlocks.push(textContentBlocksArr);
      let state = EditorState.createWithContent(
        ContentState.createFromBlockArray(newBlocks),
      );
      const editState = EditorState.moveFocusToEnd(state);

      setEditorState(RichUtils.toggleInlineStyle(editState, "UNDERLINE"));
    } else if (isRed) {
      const newBlocks = blocks.filter(
        (block) => !block.getText().startsWith("** "),
      );
      const textContentState = ContentState.createFromText("");
      const textContentBlocksArr = textContentState.getFirstBlock();

      newBlocks.push(textContentBlocksArr);
      let state = EditorState.createWithContent(
        ContentState.createFromBlockArray(newBlocks),
      );
      const editState = EditorState.moveFocusToEnd(state);

      setEditorState(RichUtils.toggleInlineStyle(editState, "REDTEXT"));
    } else if (isHeading) {
      const newBlocks = blocks.filter(
        (block) => !block.getText().startsWith("# "),
      );
      const textContentState = ContentState.createFromText("");
      const textContentBlocksArr = textContentState.getFirstBlock();

      newBlocks.push(textContentBlocksArr);
      let state = EditorState.createWithContent(
        ContentState.createFromBlockArray(newBlocks),
      );
      const editState = EditorState.moveFocusToEnd(state);

      setEditorState(RichUtils.toggleBlockType(editState, "header-one"));
    } else if (isHighlight) {
      const newBlocks = blocks.filter(
        (block) => !block.getText().startsWith("# "),
      );
      const textContentState = ContentState.createFromText("");
      const textContentBlocksArr = textContentState.getFirstBlock();
      newBlocks.push(textContentBlocksArr);

      let state = EditorState.createWithContent(
        ContentState.createFromBlockArray(newBlocks),
      );
      const editState = EditorState.moveFocusToEnd(state);

      setEditorState(RichUtils.toggleBlockType(editState, "HIGHLIGHT_TEXT"));
    } else {
      setEditorState(newState);
    }
  };

  const handleSave = () => {
    localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(editorState.getCurrentContent())),
    );
  };


  

  function handleKeyCommand(command, state) {
    if (command === "split-block") {
      setEditorState(createEmptyBlock(state))

      return "handled";
    }

    return "not-handled";
  }

  return (
    <div className='editor-container'>
      <div className="editor-main">
      <h2>My Editor</h2>
      <div onClick={handleSave} className="custom-button">Save</div>
      </div>
      <div>
        <Editor
          customStyleMap={styleMap}
          textAlignment='left'
          blockStyleFn={() => ({ border: "1px solid red" })}
          editorState={editorState}
          onChange={handleChange}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  );
};

export default MyEditor;
