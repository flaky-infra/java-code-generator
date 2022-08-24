import {ConsumeMessage} from 'amqplib';
import {randomUUID} from 'crypto';
import {
  brokerWrapper,
  EventTypes,
  Listener,
  ProjectNewRequestEvent,
} from 'flaky-common';
import {ProjectBuildPublisher} from '../publishers/project-build-publisher';
import {BuildToolStrategy} from '../../strategies/BuildToolStrategy';
import {readdirSync} from 'fs';
import {GradleStrategy} from '../../strategies/GradleStrategy';
import {MavenStrategy} from '../../strategies/MavenStrategy';
import {join} from 'path';
import {TestFileGenerator} from '../../useCases/TestFileGenerator';

function defineBuildTool(projectPath: string): BuildToolStrategy {
  try {
    const files = readdirSync(projectPath);
    for (const file of files) {
      if (file === 'build.gradle') return new GradleStrategy();
      else if (file === 'pom.xml') return new MavenStrategy();
    }
    throw new Error('Non sei in Java');
  } catch (err) {
    process.exit();
  }
}

export class ProjectJavaListener extends Listener<ProjectNewRequestEvent> {
  eventType: EventTypes.ProjectNewRequest = EventTypes.ProjectNewRequest;
  queueName = `java-code-generator/java-project-generation-${randomUUID()}`;
  routingKey = this.eventType + '.java';

  async onMessage(data: ProjectNewRequestEvent['data'], msg: ConsumeMessage) {
    const {
      projectId,
      testRunId,
      projectPath,
      name,
      version,
      commitId,
      testMethodName,
      configurationFolder,
      moduleName,
    } = data;

    console.log('Generating Java code ...');

    const buildToolStrategy = defineBuildTool(join(projectPath, moduleName));
    const testFileGenerator = new TestFileGenerator(
      buildToolStrategy,
      projectPath,
      moduleName
    );
    const buildTool = testFileGenerator.generate();

    new ProjectBuildPublisher(brokerWrapper).publish({
      projectId,
      testRunId,
      projectPath,
      name,
      version,
      commitId,
      testMethodName,
      configurationFolder,
      buildTool,
      moduleName,
    });

    console.log('Java code generation finished!');
  }
}
