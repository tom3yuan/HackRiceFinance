import { visit } from "unist-util-visit";
import type { Root } from "mdast";

/**
 * A remark plugin that finds "Page X" references and turns them into custom AST nodes.
 */
export function pageReferencePlugin() {
  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === null) return;

      const regex = /(Page\s*\d+(?:-\d+)?(?:\s*,\s*\d+)*)/g;
      const text = String(node.value);

      if (!regex.test(text)) return;

      const newNodes: any[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      regex.lastIndex = 0; // reset
      while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          newNodes.push({ type: "text", value: text.slice(lastIndex, match.index) });
        }

        newNodes.push({
          type: "pageReference",
          value: match[0],
        });
        console.log("✅ Creating pageReference node with value:", match[0]);

        lastIndex = regex.lastIndex;
      }

      if (lastIndex < text.length) {
        newNodes.push({ type: "text", value: text.slice(lastIndex) });
      }

      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes);
        return [visit.SKIP, index + newNodes.length];
      }
    });
  };
}