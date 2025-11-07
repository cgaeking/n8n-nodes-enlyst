import { 
	NodeConnectionTypes, 
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType, 
	type INodeTypeDescription,
	type IHttpRequestOptions,
	type IDataObject,
	type IWebhookFunctions,
	type IWebhookResponseData,
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
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
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
					const enrichmentType = operation === 'enrichLeads' ? this.getNodeParameter('enrichmentType', i) as string : '';
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
						const requestBody: IDataObject = {};
						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;
						const waitForCompletion = this.getNodeParameter('waitForCompletion', i, false) as boolean;

						// Build request body based on enrichment type
						if (enrichmentType === 'filtered') {
							requestBody.includeStatuses = this.getNodeParameter('includeStatuses', i);
							requestBody.excludeErrors = this.getNodeParameter('excludeErrors', i);
							requestBody.startRow = this.getNodeParameter('startRow', i);
							requestBody.maxRows = this.getNodeParameter('maxRows', i);
						} else if (enrichmentType === 'dryRun') {
							requestBody.dryRun = true;
						}
						// 'all' enrichment type needs no additional parameters

						const enrichOptions: IHttpRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/projects/${projectId}/enrich`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body: requestBody,
						};

						responseData = await this.helpers.httpRequest(enrichOptions);
						
						// If waiting for completion, poll for status until done
						if (waitForCompletion) {
							const maxWaitTime = 3600000; // 1 hour max
							const pollInterval = 10000; // Check every 10 seconds
							const startTime = Date.now();
							
							let isComplete = false;
							while (!isComplete && (Date.now() - startTime) < maxWaitTime) {
								// Wait before polling
								await new Promise(resolve => setTimeout(resolve, pollInterval));
								
								// Get project data to check status
								const dataOptions: IHttpRequestOptions = {
									method: 'GET',
									url: `${baseUrl}/projects/${projectId}/data?page=1&limit=1`,
									headers: {
										'Authorization': `Bearer ${credentials.accessToken}`,
										'Accept': 'application/json',
										'Content-Type': 'application/json',
									},
								};
								
								const dataResponse = await this.helpers.httpRequest(dataOptions) as IDataObject;
								const data = dataResponse.data as IDataObject[];
								
								// Check if there are any processing/pending items
								const hasProcessing = data?.some((item: IDataObject) => 
									item.status === 'processing' || item.status === 'pending'
								);
								
								if (!hasProcessing) {
									isComplete = true;
									// Return all completed data
									const allDataOptions: IHttpRequestOptions = {
										method: 'GET',
										url: `${baseUrl}/projects/${projectId}/data?page=0`,
										headers: {
											'Authorization': `Bearer ${credentials.accessToken}`,
											'Accept': 'application/json',
											'Content-Type': 'application/json',
										},
									};
									responseData = await this.helpers.httpRequest(allDataOptions);
								}
							}
							
							if (!isComplete) {
								throw new ApplicationError('Enrichment timeout: Process did not complete within 1 hour');
							}
						}					} else if (operation === 'uploadCsv') {
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

						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;

						const requestBody = {
							filters: {
								status: statusFilter,
								hasEmail: hasEmailFilter,
							},
						};

						const options: IHttpRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/projects/${projectId}/download-csv`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body: requestBody,
						};

						responseData = await this.helpers.httpRequest(options);
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
						const response = await this.helpers.httpRequest(options) as IDataObject;
						// API returns { project: {...} }, extract the project
						responseData = (response.project as IDataObject) || response;
					} else if (resource === 'project' && operation === 'getByName') {
						const credentials = await this.getCredentials('enlystApi');
						const baseUrl = credentials.baseUrl as string;
						const projectName = this.getNodeParameter('projectName', i) as string;
						
						// Get all projects and find by name (case-insensitive)
						const options: IHttpRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/projects`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
						};
						const response = await this.helpers.httpRequest(options) as IDataObject;
						const projects = response.projects as IDataObject[];
						
						// Find first project matching name (case-insensitive)
						const project = projects?.find((p: IDataObject) => 
							(p.name as string).toLowerCase() === projectName.toLowerCase()
						);
						
						if (!project) {
							throw new ApplicationError(`Project with name "${projectName}" not found`);
						}
						
						responseData = project;
				} else if (resource === 'project' && operation === 'createOrUpdate') {
					const credentials = await this.getCredentials('enlystApi');
					const baseUrl = credentials.baseUrl as string;
					const name = this.getNodeParameter('name', i) as string;
					const description = this.getNodeParameter('description', i, '') as string;
					const pitchlaneIntegration = this.getNodeParameter('pitchlaneIntegration', i, false) as boolean;
					const customPrompt1 = this.getNodeParameter('customPrompt1', i, '') as string;
					const customPrompt2 = this.getNodeParameter('customPrompt2', i, '') as string;
					const targetLanguage = this.getNodeParameter('targetLanguage', i, 'de') as string;
					
					// STEP 1: Get all projects to search by name
					const getOptions: IHttpRequestOptions = {
						method: 'GET',
						url: `${baseUrl}/projects`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
					};
					const allProjects = await this.helpers.httpRequest(getOptions) as IDataObject;
					const projects = allProjects.projects as IDataObject[];
					
					// Find project by name (case-insensitive)
					const existingProject = projects?.find((p: IDataObject) => 
						(p.name as string).toLowerCase() === name.toLowerCase()
					);
					
					// Build body WITHOUT webhook URL first
					const body: IDataObject = { 
						name,
						generalWebhooks: true, // Always enable webhooks
					};
					if (description) body.description = description;
					if (pitchlaneIntegration) body.pitchlaneIntegration = pitchlaneIntegration;
					if (customPrompt1) body.customPrompt1 = customPrompt1;
					if (customPrompt2) body.customPrompt2 = customPrompt2;
					if (targetLanguage) body.targetLanguage = targetLanguage;
					
					let projectId: string;
					
					if (existingProject) {
						// Update existing project
						projectId = existingProject.id as string;
						const updateOptions: IHttpRequestOptions = {
							method: 'PATCH',
							url: `${baseUrl}/projects/${projectId}`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body,
						};
						responseData = await this.helpers.httpRequest(updateOptions);
					} else {
						// Create new project
						const createOptions: IHttpRequestOptions = {
							method: 'POST',
							url: `${baseUrl}/projects`,
							headers: {
								'Authorization': `Bearer ${credentials.accessToken}`,
								'Accept': 'application/json',
								'Content-Type': 'application/json',
							},
							body,
						};
						const createResponse = await this.helpers.httpRequest(createOptions) as IDataObject;
						// API returns { project: {...} } so we need to extract it
						const projectObj = createResponse.project as IDataObject;
						projectId = projectObj.id as string;
					}
					
					// STEP 2: Now we have projectId - calculate webhook URL and update project
					// Webhook URL format: {baseUrl}/webhooks/n8n/{projectId}
					const enrichmentWebhookUrl = `${baseUrl}/webhooks/n8n/${projectId}`;
					
					// Update project with webhook URL (must include 'name' as it's required by API)
					const webhookUpdateOptions: IHttpRequestOptions = {
						method: 'PATCH',
						url: `${baseUrl}/projects/${projectId}`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body: {
							name, // Required by API
							generalWebhooks: true, // Ensure webhooks are enabled
							enrichmentWebhookUrl,
						},
					};
					responseData = await this.helpers.httpRequest(webhookUpdateOptions);
					
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

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const bodyData = req.body as IDataObject;

		// Return the webhook data
		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}
