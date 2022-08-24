import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {
  executionTestClassName,
  neededDependencies,
} from '../constants/TestConstants';
import {BuildToolStrategy} from './BuildToolStrategy';

export class GradleStrategy implements BuildToolStrategy {
  buildTool = 'gradle';
  public exec(projectPath: string, modulePath: string): void {
    let data = readFileSync(
      join(projectPath, modulePath, 'build.gradle'),
      'utf-8'
    );

    const dependenciesBlockIdentificator = 'dependencies {';
    const dependenciesBlockIndex =
      data.indexOf(dependenciesBlockIdentificator) +
      dependenciesBlockIdentificator.length;

    neededDependencies.forEach(dependency => {
      const dependecyPosition = data.indexOf(
        dependency.artifactId,
        dependenciesBlockIndex
      );
      if (dependecyPosition == -1)
        data =
          data.substring(0, dependenciesBlockIndex) +
          `\n\t${dependency.type} '${Object.entries({
            groupId: dependency.groupId,
            artifactId: dependency.artifactId,
            version: dependency.version,
          })
            .map(([key, value]) => value)
            .join(':')}'` +
          data.substring(dependenciesBlockIndex);
    });

    data += `
\n// GENERATED BY FLAKYINFR
\ntask runFlakyTest(type: JavaExec) {
  group = "Execution"
  description = "Run the main class with JavaExecTask"
  classpath = sourceSets.test.runtimeClasspath
  main = "${executionTestClassName}"
}
    `;
    writeFileSync(join(projectPath, modulePath, 'build.gradle'), data, 'utf-8');
    writeFileSync(
      join(projectPath, 'Procfile'),
      'web: ./gradlew runFlakyTest',
      'utf-8'
    );
  }
}
