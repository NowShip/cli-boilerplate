export type ProjectType = "nextjs" | "npm-package" | "docs";

export interface AllAnswers {
  projectName: string;
  branch: string;
}

export interface Template {
  type: "file" | "dir";
  content?: string;
  files?: {
    [key: string]: Template;
  };
}
