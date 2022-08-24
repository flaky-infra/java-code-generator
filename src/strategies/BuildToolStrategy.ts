export interface BuildToolStrategy {
  buildTool: string;
  exec(projectPath: string, modulePath: string): void;
}
