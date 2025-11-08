import {
	type IHookFunctions,
	type IWebhookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
	type IDataObject,
} from 'n8n-workflow';export class EnlystTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Enlyst Trigger',
		name: 'enlystTrigger',
		icon: { light: 'file:enlyst.svg', dark: 'file:enlyst.dark.svg' },
		group: ['trigger'],
		version: 1,
		description: 'Triggers when batch enrichment is completed',
		defaults: {
			name: 'Enlyst Trigger',
		},
		documentationUrl: 'https://github.com/cgaeking/n8n-nodes-enlyst#readme',
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'enlystApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Enrichment Finished',
						value: 'enrichmentFinished',
						description: 'Triggers when batch enrichment completes',
					},
				],
				default: 'enrichmentFinished',
				description: 'The event to listen for',
			},
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				placeholder: 'proj_abc123',
				description: 'Optional: Filter events for a specific project ID. Leave empty to receive all enrichment completion events.',
			},
		],
		usableAsTool: true,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Webhook always exists - it's a passive listener
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Webhook is created automatically
				// User needs to manually configure the webhook URL in their Enlyst project settings
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// No cleanup needed
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const bodyData = this.getBodyData();
		const projectIdFilter = this.getNodeParameter('projectId', '') as string;

		// If project filter is set, check if webhook matches
		if (projectIdFilter) {
			const webhookProjectId = (bodyData as IDataObject).projectId as string;
			if (webhookProjectId !== projectIdFilter) {
				// Project doesn't match filter - ignore this webhook
				return {
					noWebhookResponse: true,
				};
			}
		}

		// Return the enrichment completion data
		return {
			workflowData: [
				this.helpers.returnJsonArray([bodyData]),
			],
		};
	}
}
