import {
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IWebhookFunctions,
} from 'n8n-workflow';

export class EnlystTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Enlyst Trigger',
		name: 'enlystTrigger',
		icon: {
			light: 'file:enlyst.svg',
			dark: 'file:enlyst.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: 'Enrichment Completion',
		description: 'Starts the workflow when an Enlyst enrichment process is completed',
		defaults: {
			name: 'Enlyst Trigger',
		},
		inputs: [],
		outputs: ['main'],
		usableAsTool: true,
		credentials: [
			{
				name: 'enlystApi',
				required: false,
				displayOptions: {
					show: {
						authentication: ['credentials'],
					},
				},
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'enlyst',
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'API Key',
						value: 'credentials',
					},
				],
				default: 'none',
				description: 'Authentication method for webhook security',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: [
					{
						name: 'Enrichment Completed',
						value: 'enrichment.completed',
						description: 'Triggered when a batch enrichment process is completed',
					},
				],
				default: ['enrichment.completed'],
				description: 'Events that will trigger this webhook',
			},
			{
				displayName: 'Project Filter',
				name: 'projectFilter',
				type: 'string',
				default: '',
				placeholder: 'project_123',
				description: 'Only trigger for specific project ID (leave empty for all projects)',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const authType = this.getNodeParameter('authentication') as string;
		const events = this.getNodeParameter('events') as string[];
		const projectFilter = this.getNodeParameter('projectFilter') as string;
		
		const body = this.getBodyData();
		const headers = this.getHeaderData();

		// Validate authentication if enabled
		if (authType === 'credentials') {
			const credentials = await this.getCredentials('enlystApi');
			const expectedAuthHeader = `Bearer ${credentials.accessToken}`;
			const receivedAuthHeader = headers.authorization;

			if (receivedAuthHeader !== expectedAuthHeader) {
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Unauthorized' },
					},
				};
			}
		}

		// Validate webhook payload structure
		if (!body || typeof body !== 'object') {
			return {
				webhookResponse: {
					status: 400,
					body: { error: 'Invalid payload' },
				},
			};
		}

		// Type the webhook data appropriately
		interface EnlystWebhookData {
			event: string;
			timestamp: string;
			data: {
				projectId: string;
				projectName: string;
				stats: {
					total: number;
					completed: number;
					failed: number;
					stopped: number;
					queued: number;
					processing: number;
				};
				completedAt: string;
			};
		}

		const webhookData = body as unknown as EnlystWebhookData;

		// Validate event type
		if (!webhookData.event || !events.includes(webhookData.event)) {
			return {
				webhookResponse: {
					status: 200,
					body: { message: 'Event type not subscribed' },
				},
			};
		}

		// Validate project filter if specified
		if (projectFilter && webhookData.data?.projectId !== projectFilter) {
			return {
				webhookResponse: {
					status: 200,
					body: { message: 'Project not matching filter' },
				},
			};
		}

		// Validate enrichment.completed event structure
		if (webhookData.event === 'enrichment.completed') {
			if (!webhookData.data || !webhookData.data.projectId || !webhookData.data.stats) {
				return {
					webhookResponse: {
						status: 400,
						body: { error: 'Invalid enrichment completion payload' },
					},
				};
			}
		}

		// Return successful response and trigger workflow
		const returnData = {
			event: webhookData.event,
			timestamp: webhookData.timestamp,
			projectId: webhookData.data?.projectId,
			projectName: webhookData.data?.projectName,
			stats: webhookData.data?.stats,
			completedAt: webhookData.data?.completedAt,
			headers,
			body: webhookData,
		};

		return {
			webhookResponse: {
				status: 200,
				body: { message: 'Webhook received successfully' },
			},
			workflowData: [
				[
					{
						json: returnData,
					},
				],
			],
		};
	}
}