import {BuildToolStrategy} from '../strategies/BuildToolStrategy';
import ninjuks from 'nunjucks';
import {executionTestClassName} from '../constants/TestConstants';
import {join} from 'path';
import {readFileSync, writeFileSync, writeSync} from 'fs';

export class TestFileGenerator {
  private buildToolStrategy: BuildToolStrategy;
  private projectPath: string;
  private modulePath: string;

  constructor(
    buildToolStrategy: BuildToolStrategy,
    projectPath: string,
    modulePath: string
  ) {
    this.buildToolStrategy = buildToolStrategy;
    this.projectPath = projectPath;
    this.modulePath = modulePath;
  }

  public setStrategy(buildToolStrategy: BuildToolStrategy) {
    this.buildToolStrategy = buildToolStrategy;
  }

  private generateTestFile(): void {
    const executionTestClassPath = join(
      this.projectPath,
      this.modulePath,
      'src',
      'test',
      'java',
      executionTestClassName + '.java'
    );
    ninjuks.configure('src/templates', {autoescape: true});
    const executionTestClass = ninjuks.render('JUnit5TestClass.njk', {
      executionTestClassName: executionTestClassName,
    });

    // executionTestClass = executionTestClass.replace(/[\r\n]/gm, '');
    writeFileSync(executionTestClassPath, executionTestClass, 'utf-8');
  }

  public generate(): string {
    this.buildToolStrategy.exec(this.projectPath, this.modulePath);
    this.generateTestFile();
    return this.buildToolStrategy.buildTool;
  }
}
