import { visit, SKIP } from "unist-util-visit";
import type { Root } from "mdast";

/**
 * A remark plugin that finds "Page X" references and turns them into custom AST nodes.
 */


export function pageReferencePlugin() {
    return (tree: Root) => {
        visit(tree, "text", (node, index, parent) => {
            if (!parent || index === null) return;
            const regex =  /\[(Page\s*\d+(?:-\d+)?(?:\s*,\s*\d+(?:-\d+)?)*)\]/g;
            const text = String(node.value);
            console.log("🪵 Plugin checking text node:", text);

            if (!regex.test(text)) {
                console.log("😴 No page reference found in:", text);
                return;
            }
            console.log("✅ Found page reference in:", text);
            const newNodes: any[] = [];
            let lastIndex = 0;
            let match: RegExpExecArray | null;

            regex.lastIndex = 0; // reset
            while ((match = regex.exec(text)) !== null) {
                if (match.index > lastIndex) {
                    newNodes.push({ type: "text", value: text.slice(lastIndex, match.index) });
                }

                newNodes.push({
                    type: "pageReference",  // 👈 custom mdast node type
                    value: match[1]
                });
                console.log("🌱 Created custom node:", match[1]);

                lastIndex = regex.lastIndex;
            }

            if (lastIndex < text.length) {
                newNodes.push({ type: "text", value: text.slice(lastIndex) });
            }

            if (newNodes.length > 0) {
                if (typeof index === 'number') {
                    parent.children.splice(index, 1, ...newNodes);
                }
                return [SKIP, index! + newNodes.length];
            }
        });
        console.log("🌳 MDAST after plugin:", JSON.stringify(tree, null, 2));
    };
}