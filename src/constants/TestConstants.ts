export const executionTestClassName = 'FlakyInfraTest';

export const xmlParseOptions = {
  ignoreAttributes: false,
};

interface Dependency {
  type: 'testImplementation' | 'implementation';
  groupId: string;
  artifactId: string;
  version: string;
}

export const neededDependencies: Dependency[] = [
  {
    type: 'testImplementation',
    groupId: 'org.junit.jupiter',
    artifactId: 'junit-jupiter-api',
    version: '5.8.1',
  },
  {
    type: 'testImplementation',
    groupId: 'org.junit.jupiter',
    artifactId: 'junit-jupiter-engine',
    version: '5.8.1',
  },
  {
    type: 'testImplementation',
    groupId: 'org.junit.vintage',
    artifactId: 'junit-vintage-engine',
    version: '5.8.1',
  },
  {
    type: 'testImplementation',
    groupId: 'org.junit.platform',
    artifactId: 'junit-platform-launcher',
    version: '1.8.1',
  },
  {
    type: 'implementation',
    groupId: 'com.martensigwart',
    artifactId: 'fakeload',
    version: '0.7.0',
  },
  {
    type: 'implementation',
    groupId: 'net.vidageek',
    artifactId: 'mirror',
    version: '1.6.1',
  },
];
