export interface TextNode {
  text: string;
  children: TextNode[];
  id: string;
  parent?: string;
}

export interface padAction {
  id: string;
  type: string;
  text?: string;
  newID?: string;
}
