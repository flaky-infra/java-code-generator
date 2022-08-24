import {EventTypes, ProjectBuildEvent, Publisher} from 'flaky-common';

export class ProjectBuildPublisher extends Publisher<ProjectBuildEvent> {
  eventType: EventTypes.ProjectBuild = EventTypes.ProjectBuild;
  routingKey = this.eventType;
}
