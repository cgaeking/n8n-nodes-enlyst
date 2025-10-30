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
				name: 'Create',
				value: 'create',
				description: 'Create a new project',
				action: 'Create a project',
				routing: {
					request: {
						method: 'POST',
						url: '/projects',
					},
				},
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
				description: 'Retrieve many projects',
				action: 'Get many projects',
				routing: {
					request: {
						method: 'GET',
						url: '/projects',
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a project',
				action: 'Update a project',
				routing: {
					request: {
						method: 'PUT',
						url: '=/projects/{{$parameter.projectId}}',
					},
				},
			},
		],
		default: 'getAll',
	},
];

export const projectFields: INodeProperties[] = [
	/* -------------------------------------------------------------------------- */
	/*                                project:create                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['create'],
			},
		},
		default: '',
		required: true,
		description: 'Name of the project',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},

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
				operation: ['getById', 'update', 'delete'],
			},
		},
		default: '',
		required: true,
		description: 'ID of the project',
	},

	/* -------------------------------------------------------------------------- */
	/*                                project:update                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Name',
		name: 'updateName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'New name of the project',
		routing: {
			send: {
				type: 'body',
				property: 'name',
			},
		},
	},
];

export const projectDescription: INodeProperties[] = [
	...projectOperations,
	...projectFields,
];