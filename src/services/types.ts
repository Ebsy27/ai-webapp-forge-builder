
export interface FileContent {
  code: string;
}

export interface GeneratedCode {
  [filepath: string]: FileContent;
}
