import { 
	NodeConnectionTypes, 
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType, 
	type INodeTypeDescription,
	type IHttpRequestOptions,
	type IDataObject,
	ApplicationError,
} from 'n8n-workflow';
import { projectDescription } from './resources/project';
import { leadDescription } from './resources/lead';
import { referralDescription } from './resources/referral';

export class Enlyst implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Enlyst',
		name: 'enlyst',
		icon: { light: 'file:enlyst.svg', dark: 'file:enlyst.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Enlyst lead enrichment and data management platform',
		defaults: {
			name: 'Enlyst',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'enlystApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Project',
						value: 'project',
						description: 'Manage Enlyst projects',
					},
					{
						name: 'Lead',
						value: 'lead',
						description: 'Search and manage leads',
					},
					{
						name: 'Referral',
						value: 'referral',
						description: 'Manage referral system',
					},
				],
				default: 'project',
			},
			...projectDescription,
			...leadDescription,
			...referralDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData: IDataObject | undefined;
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'lead') {
					const projectId = this.getNodeParameter('projectId', i) as string;
					
					if (operation === 'getProjectData') {
						const page = this.getNodeParameter('page', i, null) as number | null;
						const limit = this.getNodeParameter('limit', i, null) as number | null;
						const statuses = this.getNodeParameter('status', i, []) as string[];
						
						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;
						
						const queryParams = new URLSearchParams();
						
						// Only add page and limit if they're specified
						// If both are omitted, the API returns all records
						if (page !== null && page > 0) {
							queryParams.append('page', page.toString());
						}
						
						if (limit !== null && limit > 0) {
							queryParams.append('limit', limit.toString());
						}
						
						// Add multiple status filters if specified
						if (statuses && statuses.length > 0 && !statuses.includes('all')) {
							statuses.forEach(status => {
								queryParams.append('status', status);
							});
						}
						
						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/projects/${projectId}/data?${queryParams.toString()}`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
						};

						responseData = await this.helpers.httpRequest(options);
						
					} else if (operation === 'enrichLeads') {
						const enrichmentType = this.getNodeParameter('enrichmentType', i) as string;
						const requestBody: IDataObject = {};

						// Build request body based on enrichment type
						if (enrichmentType === 'single') {
							requestBody.rowId = this.getNodeParameter('rowId', i);
						} else if (enrichmentType === 'filtered') {
							requestBody.includeStatuses = this.getNodeParameter('includeStatuses', i);
							requestBody.excludeErrors = this.getNodeParameter('excludeErrors', i);
							requestBody.startRow = this.getNodeParameter('startRow', i);
							requestBody.maxRows = this.getNodeParameter('maxRows', i);
						} else if (enrichmentType === 'dryRun') {
							requestBody.dryRun = true;
						}

						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `/projects/${projectId}/enrich`,
							body: requestBody,
						};

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'enlystApi', options);

					} else if (operation === 'uploadCsv') {
						// For CSV upload, we need to handle file upload differently
						const companyColumn = this.getNodeParameter('companyColumn', i) as string;
						const websiteColumn = this.getNodeParameter('websiteColumn', i) as string;
						const mode = this.getNodeParameter('mode', i) as string;
						const delimiter = this.getNodeParameter('delimiter', i) as string;

						// This is a placeholder - in real implementation, you'd handle the file upload
						const options: IHttpRequestOptions = {
							method: 'POST',
							url: '/projects/upload-csv',
							headers: {
								'Content-Type': 'multipart/form-data',
							},
							body: {
								projectId,
								companyColumn,
								websiteColumn,
								mode,
								delimiter,
								// file: csvFile // This would need proper file handling
							},
						};

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'enlystApi', options);

					} else if (operation === 'downloadCsv') {
						const statusFilter = this.getNodeParameter('downloadStatusFilter', i) as string[];
						const hasEmailFilter = this.getNodeParameter('hasEmailFilter', i) as boolean;

						const requestBody = {
							filters: {
								status: statusFilter,
								hasEmail: hasEmailFilter,
							},
						};

						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `/projects/${projectId}/download-csv`,
							body: requestBody,
						};

						responseData = await this.helpers.httpRequestWithAuthentication.call(this, 'enlystApi', options);
					}
				}

				// If no custom handling above, fall back to default routing
				if (responseData === undefined) {
					// Explicitly handle the routing based on resource and operation
					if (resource === 'project' && operation === 'getAll') {
						// Get the base URL from credentials
						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;
						
						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/projects`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
						};
						responseData = await this.helpers.httpRequest(options);
					} else if (resource === 'project' && operation === 'getById') {
						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;
						const projectId = this.getNodeParameter('projectId', i) as string;
						
						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/projects/${projectId}`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
						};
						responseData = await this.helpers.httpRequest(options);
					} else if (resource === 'project' && operation === 'create') {
						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;
						const name = this.getNodeParameter('name', i) as string;
						
						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/projects`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body: { name },
						};
						responseData = await this.helpers.httpRequest(options);
				} else if (resource === 'project' && operation === 'update') {
					const credentials = await this.getCredentials('enlystApi');
					const baseUrl = credentials.baseUrl as string;
					const projectId = this.getNodeParameter('projectId', i) as string;
					const updateName = this.getNodeParameter('updateName', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;
					const pitchlaneIntegration = this.getNodeParameter('pitchlaneIntegration', i, false) as boolean;
					const customPrompt1 = this.getNodeParameter('customPrompt1', i, '') as string;
					const customPrompt2 = this.getNodeParameter('customPrompt2', i, '') as string;
					const targetLanguage = this.getNodeParameter('targetLanguage', i, 'de') as string;
					const generalWebhooks = this.getNodeParameter('generalWebhooks', i, false) as boolean;
					const enrichmentWebhookUrl = this.getNodeParameter('enrichmentWebhookUrl', i, '') as string;
					
					const body: IDataObject = { name: updateName };
					if (description) body.description = description;
					if (pitchlaneIntegration) body.pitchlaneIntegration = pitchlaneIntegration;
					if (customPrompt1) body.customPrompt1 = customPrompt1;
					if (customPrompt2) body.customPrompt2 = customPrompt2;
					if (targetLanguage) body.targetLanguage = targetLanguage;
					if (generalWebhooks) body.generalWebhooks = generalWebhooks;
					if (enrichmentWebhookUrl) body.enrichmentWebhookUrl = enrichmentWebhookUrl;
					
					const options: IHttpRequestOptions = {
						method: 'PATCH',
						url: `${baseUrl}/projects/${projectId}`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body,
					};
					responseData = await this.helpers.httpRequest(options);
				} else if (resource === 'project' && operation === 'delete') {
						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;
						const projectId = this.getNodeParameter('projectId', i) as string;
						
						const options: IHttpRequestOptions = {
							method: 'DELETE',
							url: `${baseUrl}/projects/${projectId}`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
						};
						responseData = await this.helpers.httpRequest(options);
					} else {
						throw new ApplicationError(`Unknown operation: ${operation} for resource: ${resource}`);
					}
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData || {}),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: error.message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnData);
	}
}
