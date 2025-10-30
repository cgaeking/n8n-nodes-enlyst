import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class EnlystApi implements ICredentialType {
	name = 'enlystApi';

	displayName = 'Enlyst API';

	// Link to your Enlyst documentation
	documentationUrl = 'https://enlyst.app/docs/api';

	icon: Icon = 'file:enlyst.dark.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			required: true,
			default: 'https://enlyst.app/api',
			description: 'The base URL of your Enlyst instance',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'Your Enlyst API access token',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/projects',
			method: 'GET',
		},
	};
}
