import type { INodeProperties } from 'n8n-workflow';

export const projectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['project'],
			},
		},
		options: [
			{
				name: 'Create or Update',
				value: 'createOrUpdate',
				description: 'Create a new project or update existing one by name',
				action: 'Create or update a project',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a project',
				action: 'Delete a project',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/projects/{{$parameter.projectId}}',
					},
				},
			},
			{
				name: 'Get by ID',
				value: 'getById',
				description: 'Retrieve a project by ID',
				action: 'Get a project by ID',
				routing: {
					request: {
						method: 'GET',
						url: '=/projects/{{$parameter.projectId}}',
					},
				},
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many projects',
				action: 'Get many projects',
				routing: {
					request: {
						method: 'GET',
						url: '/projects',
					},
				},
			},
		],
		default: 'createOrUpdate',
	},
];

export const projectFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                project:getById                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getById', 'delete'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the project',
	},

	/* -------------------------------------------------------------------------- */
	/*                            project:createOrUpdate                          */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['createOrUpdate'],
			},
		},
		default: '',
		required: true,
		description: 'Name of the project (used to find existing project)',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['createOrUpdate'],
			},
		},
		default: '',
		description: 'Project description',
	},
	{
		displayName: 'Pitchlane Integration',
		name: 'pitchlaneIntegration',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['createOrUpdate'],
			},
		},
		default: false,
		description: 'Whether to enable Pitchlane integration',
	},
	{
		displayName: 'Custom Prompt 1',
		name: 'customPrompt1',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['createOrUpdate'],
			},
		},
		default: '',
		description: 'First custom prompt for AI enrichment',
	},
	{
		displayName: 'Custom Prompt 2',
		name: 'customPrompt2',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['createOrUpdate'],
			},
		},
		default: '',
		description: 'Second custom prompt for AI enrichment',
	},
	{
		displayName: 'Target Language',
		name: 'targetLanguage',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['createOrUpdate'],
			},
		},
		options: [
			{
				name: 'Deutsch',
				value: 'de',
			},
			{
				name: 'English',
				value: 'en',
			},
			{
				name: 'Français',
				value: 'fr',
			},
			{
				name: 'Español',
				value: 'es',
			},
			{
				name: 'Italiano',
				value: 'it',
			},
			{
				name: 'Nederlands',
				value: 'nl',
			},
			{
				name: 'Português',
				value: 'pt',
			},
			{
				name: 'Polski',
				value: 'pl',
			},
		],
		default: 'de',
		description: 'Target language for enrichment',
	},

];

export const projectDescription: INodeProperties[] = [
	...projectOperations,
	...projectFields,
];