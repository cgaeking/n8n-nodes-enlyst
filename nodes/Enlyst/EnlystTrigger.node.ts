import {
	type IHookFunctions,
	type IWebhookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
	type IHttpRequestOptions,
	type IDataObject,
} from 'n8n-workflow';export class EnlystTrigger implements INodeType {
description: INodeTypeDescription = {
displayName: 'Enlyst Trigger',
name: 'enlystTrigger',
icon: { light: 'file:enlyst.svg', dark: 'file:enlyst.dark.svg' },
group: ['trigger'],
version: 1,
description: 'Starts enrichment and receives webhook when complete',
defaults: {
name: 'Enlyst Trigger',
},
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
displayName: 'Project Name',
name: 'projectName',
type: 'string',
default: '',
required: true,
description: 'Name of the project (will be created or updated)',
},
{
displayName: 'Company',
name: 'company',
type: 'string',
default: '',
required: true,
description: 'Company name to enrich',
},
{
displayName: 'Website',
name: 'website',
type: 'string',
default: '',
description: 'Company website to enrich (optional but recommended)',
},
{
displayName: 'Target Language',
name: 'targetLanguage',
type: 'options',
options: [
{ name: 'Deutsch', value: 'de' },
{ name: 'English', value: 'en' },
{ name: 'Français', value: 'fr' },
{ name: 'Español', value: 'es' },
{ name: 'Italiano', value: 'it' },
{ name: 'Nederlands', value: 'nl' },
{ name: 'Português', value: 'pt' },
{ name: 'Polski', value: 'pl' },
],
default: 'de',
description: 'Target language for enrichment',
},
{
displayName: 'Custom Prompt 1',
name: 'customPrompt1',
type: 'string',
default: '',
description: 'First custom prompt for AI enrichment',
},
{
displayName: 'Custom Prompt 2',
name: 'customPrompt2',
type: 'string',
default: '',
description: 'Second custom prompt for AI enrichment',
},
{
displayName: 'Pitchlane Integration',
name: 'pitchlaneIntegration',
type: 'boolean',
default: false,
description: 'Whether to enable Pitchlane integration',
},
],
};

webhookMethods = {
default: {
async checkExists(this: IHookFunctions): Promise<boolean> {
return true;
},
async create(this: IHookFunctions): Promise<boolean> {
const webhookUrl = this.getNodeWebhookUrl('default');
const credentials = await this.getCredentials('enlystApi');
const baseUrl = credentials.baseUrl as string;

const projectName = this.getNodeParameter('projectName') as string;
const company = this.getNodeParameter('company') as string;
const website = this.getNodeParameter('website', '') as string;
const targetLanguage = this.getNodeParameter('targetLanguage', 'de') as string;
const customPrompt1 = this.getNodeParameter('customPrompt1', '') as string;
const customPrompt2 = this.getNodeParameter('customPrompt2', '') as string;
const pitchlaneIntegration = this.getNodeParameter('pitchlaneIntegration', false) as boolean;

// Step 1: Get all projects to find or create
const getProjectsOptions: IHttpRequestOptions = {
method: 'GET',
url: `${baseUrl}/projects`,
headers: {
'Authorization': `Bearer ${credentials.accessToken}`,
'Accept': 'application/json',
'Content-Type': 'application/json',
},
};
const allProjects = await this.helpers.httpRequest(getProjectsOptions) as IDataObject;
const projects = allProjects.projects as IDataObject[];

const existingProject = projects?.find((p: IDataObject) => 
(p.name as string).toLowerCase() === projectName.toLowerCase()
);

// Step 2: Create or update project with webhook URL
const projectBody: IDataObject = {
name: projectName,
targetLanguage,
generalWebhooks: true,
enrichmentWebhookUrl: webhookUrl,
};
if (customPrompt1) projectBody.customPrompt1 = customPrompt1;
if (customPrompt2) projectBody.customPrompt2 = customPrompt2;
if (pitchlaneIntegration) projectBody.pitchlaneIntegration = pitchlaneIntegration;

let projectId: string;
if (existingProject) {
projectId = existingProject.id as string;
const updateOptions: IHttpRequestOptions = {
method: 'PATCH',
url: `${baseUrl}/projects/${projectId}`,
headers: {
'Authorization': `Bearer ${credentials.accessToken}`,
'Accept': 'application/json',
'Content-Type': 'application/json',
},
body: projectBody,
};
await this.helpers.httpRequest(updateOptions);
} else {
const createOptions: IHttpRequestOptions = {
method: 'POST',
url: `${baseUrl}/projects`,
headers: {
'Authorization': `Bearer ${credentials.accessToken}`,
'Accept': 'application/json',
'Content-Type': 'application/json',
},
body: projectBody,
};
const createResponse = await this.helpers.httpRequest(createOptions) as IDataObject;
projectId = createResponse.id as string;
}

// Step 3: Add company row
const addRowOptions: IHttpRequestOptions = {
method: 'POST',
url: `${baseUrl}/projects/${projectId}/add-rows`,
headers: {
'Authorization': `Bearer ${credentials.accessToken}`,
'Accept': 'application/json',
'Content-Type': 'application/json',
},
body: {
rows: [{
company: company || '',
website: website || '',
}]
},
};
await this.helpers.httpRequest(addRowOptions);

// Step 4: Start enrichment
const enrichOptions: IHttpRequestOptions = {
method: 'POST',
url: `${baseUrl}/projects/${projectId}/enrich`,
headers: {
'Authorization': `Bearer ${credentials.accessToken}`,
'Accept': 'application/json',
'Content-Type': 'application/json',
},
body: {},
};
await this.helpers.httpRequest(enrichOptions);

return true;
},
async delete(this: IHookFunctions): Promise<boolean> {
return true;
},
},
};

async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
const bodyData = this.getBodyData();

return {
workflowData: [
this.helpers.returnJsonArray([bodyData]),
],
};
}
}
