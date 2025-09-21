import { visit } from "unist-util-visit";

export function rehypePageReference() {
  return (tree: any) => {
    visit(tree, "pageReference", (node: any) => {
      node.type = "element";
      node.tagName = "pageReference";
      node.properties = { value: node.value };
      node.children = [{ type: "text", value: node.value }];
    });
  };
}