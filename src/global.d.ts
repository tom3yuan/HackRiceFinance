import "mdast";

declare module "mdast" {
  interface PageReference extends Literal {
    type: "pageReference";
    value: string;
    data?: {
      hName?: string;
      hProperties?: Record<string, unknown>;
    };
  }

  interface RootContentMap {
    pageReference: PageReference; // 👈 add our node
  }
}