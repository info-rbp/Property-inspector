
import Handlebars from 'handlebars';
import { db } from '../db';
import mjml2html from 'mjml';

export interface RenderedContent {
  subject: string;
  html: string;
  templateVersion: number;
}

export class TemplateService {
  async render(templateId: string, variables: any): Promise<RenderedContent> {
    
    // 1. Fetch Template
    const res = await db.query(
      `SELECT subject_template, body_template, version 
       FROM notification_templates 
       WHERE template_id = $1 AND status = 'active'
       ORDER BY version DESC LIMIT 1`,
      [templateId]
    );

    if (res.rows.length === 0) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const { subject_template, body_template, version } = res.rows[0];

    // 2. Compile Handlebars
    // Note: We pre-compile for performance in a real app, but for simplicity here we compile on fly
    const subjectCompiled = Handlebars.compile(subject_template);
    const bodyCompiled = Handlebars.compile(body_template);

    const subject = subjectCompiled(variables);
    const bodyMjml = bodyCompiled(variables);

    // 3. Render MJML to HTML
    const mjmlResult = mjml2html(bodyMjml);
    
    if (mjmlResult.errors.length > 0) {
      // Log warnings but usually proceed if it rendered something
      console.warn('MJML Warnings', mjmlResult.errors);
    }

    return {
      subject,
      html: mjmlResult.html,
      templateVersion: version
    };
  }
  
  /**
   * Seed templates for the deliverable
   */
  async seedTemplates() {
    const templates = [
      {
        id: 'report_ready',
        name: 'Report Ready',
        subject: 'Inspection Report Ready: {{propertyAddress}}',
        body: `
          <mjml>
            <mj-body>
              <mj-section>
                <mj-column>
                  <mj-image width="150px" src="{{logoUrl}}"></mj-image>
                  <mj-divider border-color="{{brandColor}}"></mj-divider>
                  <mj-text font-size="20px" color="{{brandColor}}" font-family="helvetica">Report Ready</mj-text>
                  <mj-text>Hello,</mj-text>
                  <mj-text>The inspection report for <strong>{{propertyAddress}}</strong> conducted on {{inspectionDate}} is now available.</mj-text>
                  <mj-button background-color="{{brandColor}}" href="{{reportDownloadUrl}}">Download Report</mj-button>
                  <mj-divider border-color="#F45E43"></mj-divider>
                  <mj-text font-size="12px" color="gray">Powered by {{tenantName}}</mj-text>
                </mj-column>
              </mj-section>
            </mj-body>
          </mjml>
        `
      },
      {
        id: 'report_shared',
        name: 'Report Shared',
        subject: 'A report has been shared with you',
        body: `
          <mjml>
            <mj-body>
              <mj-section>
                <mj-column>
                  <mj-image width="150px" src="{{logoUrl}}"></mj-image>
                  <mj-text>You have been given access to a report.</mj-text>
                  <mj-button background-color="{{brandColor}}" href="{{shareLinkUrl}}">View Report</mj-button>
                </mj-column>
              </mj-section>
            </mj-body>
          </mjml>
        `
      },
      {
        id: 'support_notice',
        name: 'Support Update',
        subject: 'Update on Ticket #{{supportTicketId}}',
        body: `
          <mjml>
            <mj-body>
              <mj-section>
                <mj-column>
                   <mj-image width="150px" src="{{logoUrl}}"></mj-image>
                   <mj-text>There is an update on your ticket {{supportTicketId}}.</mj-text>
                   <mj-text>{{message}}</mj-text>
                </mj-column>
              </mj-section>
            </mj-body>
          </mjml>
        `
      }
    ];

    for (const t of templates) {
      await db.query(`
        INSERT INTO notification_templates (template_id, channel, name, subject_template, body_template, version)
        VALUES ($1, 'email', $2, $3, $4, 1)
        ON CONFLICT (template_id) DO NOTHING
      `, [t.id, t.name, t.subject, t.body]);
    }
  }
}
