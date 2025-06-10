const Octane = require('@microfocus/alm-octane-js-rest-sdk').Octane;
const Query = require('@microfocus/alm-octane-js-rest-sdk').Query;
const colors = require('colors/safe');

class OctaneService {
  constructor(logger, config) {
    this.logger = logger;
    this.config = config;
  }

  buildOctaneClient(serverUrl, sharedSpaceId, workspaceId) {
    const credentials = this.config.getOctaneCredentials();
    return new Octane({
      server: serverUrl,
      sharedSpace: sharedSpaceId,
      workspace: workspaceId,
      user: credentials.user,
      password: credentials.password,
      headers: {
        ALM_OCTANE_TECH_PREVIEW: true
      }
    });
  }

  async updateEntity(webhookData) {
    let octane;
    try {
      const { server_url, sharedspace_id, workspace_id, event_type, data } = webhookData;
      
      if (event_type !== 'update' || !data || !data[0]) {
        return;
      }

      const entity = data[0].entity;
      if (entity.type !== 'epic') {
        return;
      }

      octane = this.buildOctaneClient(server_url, sharedspace_id, workspace_id);
      await octane.authenticate();

      const phaseValue = data[0].changes.phase.newValue.id.split('.').pop();
      this.logger.info(
        "Epic #%s: %s status updated - new status is %s",
        colors.cyan(entity.id),
        colors.cyan(entity.name),
        phaseValue
      );

      await this.updateLinkedFeatures(octane, entity);

    } catch (error) {
      this.logger.error('Error updating entity:', error);
      throw error;
    } finally {
      if (octane) {
        await octane.signOut();
      }
    }
  }

  async updateLinkedFeatures(octane, epic) {
    this.logger.info("Updating all Features linked to Epic %s", epic.name);
    
    const featuresQuery = Query.field('parent')
      .equal(Query.field('id').equal(epic.id))
      .build();
    
    const features = await octane.get(Octane.entityTypes.features)
      .fields(['phase', 'name'])
      .query(featuresQuery)
      .execute();

    for (const feature of features.data) {
      feature.phase = { type: 'phase', id: 'phase.feature.inprogress' };
      await octane.update(Octane.entityTypes.features, feature).execute();
      
      this.logger.info(
        "Feature %s: %s phase changed to inprogress",
        colors.cyan("#" + feature.id),
        colors.cyan(feature.name)
      );
    }
  }
}

module.exports = OctaneService; 