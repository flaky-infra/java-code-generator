import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {
  executionTestClassName,
  neededDependencies,
  xmlParseOptions,
} from '../constants/TestConstants';
import {BuildToolStrategy} from './BuildToolStrategy';
import {XMLParser, XMLBuilder} from 'fast-xml-parser';

export class MavenStrategy implements BuildToolStrategy {
  buildTool = 'maven';
  public exec(projectPath: string, modulePath: string): void {
    const pomXml = readFileSync(
      join(projectPath, modulePath, 'pom.xml'),
      'utf-8'
    );
    const pomObject = new XMLParser(xmlParseOptions).parse(pomXml);

    if (!pomObject.project.dependencies) {
      pomObject.project.dependencies = {dependency: []};
    }
    if (!pomObject.project.profiles) {
      pomObject.project.profiles = {profile: []};
    } else if (!Array.isArray(pomObject.project.profiles.profile)) {
      const oldProfile = pomObject.project.profiles.profile;
      pomObject.project.profiles.profile = [oldProfile];
    }

    neededDependencies.forEach(dependency => {
      const {groupId, artifactId, version} = dependency;
      pomObject.project.dependencies.dependency.push({
        groupId,
        artifactId,
        version,
        scope: 'test',
      });
    });

    pomObject.project.profiles.profile.push({
      id: 'runFlakyTest',
      activation: {
        property: {
          name: 'runFlakyTest',
        },
      },
      build: {
        plugins: {
          plugin: {
            groupId: 'org.codehaus.mojo',
            artifactId: 'exec-maven-plugin',
            configuration: {
              executable: 'java',
              classpathScope: 'test',
              mainClass: executionTestClassName,
            },
          },
        },
      },
    });

    writeFileSync(
      join(projectPath, modulePath, 'pom.xml'),
      new XMLBuilder(xmlParseOptions).build(pomObject),
      'utf-8'
    );

    // if (existsSync(join(projectPath, 'mvnw'))) {
    //   unlinkSync(join(projectPath, 'mvnw'));
    //   unlinkSync(join(projectPath, 'mvnw.cmd'));
    // }

    writeFileSync(
      join(projectPath, 'Procfile'),
      `web: ./mvnw -pl ${modulePath} exec:java -PrunFlakyTest`,
      'utf-8'
    );
  }
}
