import type { INodeProperties } from 'n8n-workflow';

export const leadDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['lead'],
			},
		},
		options: [
			{
				name: 'Get Leads',
				value: 'getProjectData',
				description: 'Get leads with pagination and filtering',
				action: 'Get leads',
			},
			{
				name: 'Enrich Leads',
				value: 'enrichLeads',
				description: 'Enrich leads (single or bulk enrichment)',
				action: 'Enrich leads',
			},
		{
			name: 'Find Leads',
			value: 'findLeads',
			description: 'Find leads via Google Maps search',
			action: 'Find leads',
		},
		{
			name: 'Add Leads',
			value: 'addLeads',
			description: 'Add leads from other sources to a project',
			action: 'Add leads',
		},
	],
	default: 'getProjectData',
},	// Project ID (required for all lead operations)
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getProjectData', 'enrichLeads', 'addLeads'],
			},
		},
		default: '',
		description: 'ID of the project to work with',
	},

	/* -------------------------------------------------------------------------- */
	/*                            lead:getProjectData                            */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getProjectData'],
			},
		},
		default: 0,
		description: 'Page number for pagination (0 = get all leads)',
		routing: {
			request: {
				method: 'GET',
				url: '=/projects/{{$parameter.projectId}}/data',
				qs: {
					page: '={{$parameter.page}}',
				},
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getProjectData'],
			},
		},
		default: 50,
		description: 'Max number of results to return',
		routing: {
			send: {
				type: 'query',
				property: 'limit',
			},
		},
	},
	{
		displayName: 'Status Filter',
		name: 'status',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getProjectData'],
			},
		},
		options: [
			{
				name: 'All',
				value: 'all',
			},
			{
				name: 'Completed',
				value: 'completed',
			},
			{
				name: 'Failed',
				value: 'failed',
			},
			{
				name: 'Pending',
				value: 'pending',
			},
			{
				name: 'Processing',
				value: 'processing',
			},
			{
				name: 'Stopped',
				value: 'stopped',
			},
		],
		default: [],
		description: 'Filter by processing status (multiple selection possible)',
		routing: {
			send: {
				type: 'query',
				property: 'status',
			},
		},
	},

	/* -------------------------------------------------------------------------- */
	/*                              lead:enrichLeads                             */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Wait for Completion',
		name: 'waitForCompletion',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
			},
		},
		default: false,
		description: 'Whether to wait for enrichment to complete before continuing workflow. When enabled, the node will register a webhook and wait for the enrichment-finished callback.',
	},
	{
		displayName: 'Enrichment Type',
		name: 'enrichmentType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
			},
		},
		options: [
			{
				name: 'All Eligible Rows',
				value: 'all',
				description: 'Enrich all eligible rows in the project',
			},
			{
				name: 'Filtered Enrichment',
				value: 'filtered',
				description: 'Enrich with specific filters and criteria',
			},
			{
				name: 'Dry Run (Estimate)',
				value: 'dryRun',
				description: 'Estimate costs without processing',
			},
		],
		default: 'all',
		routing: {
			request: {
				method: 'POST',
				url: '=/projects/{{$parameter.projectId}}/enrich',
			},
		},
	},

	// Filtered Enrichment Options
	{
		displayName: 'Include Statuses',
		name: 'includeStatuses',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
				enrichmentType: ['filtered'],
			},
		},
		options: [
			{
				name: 'Completed',
				value: 'completed',
				description: 'Successfully enriched rows',
			},
			{
				name: 'Empty/Null Status',
				value: '',
				description: 'Rows with no status set (empty or null)',
			},
			{
				name: 'Failed',
				value: 'failed',
				description: 'Rows that failed enrichment',
			},
			{
				name: 'Pending',
				value: 'pending',
				description: 'Rows waiting to be processed',
			},
			{
				name: 'Processing',
				value: 'processing',
				description: 'Rows currently being processed',
			},
			{
				name: 'Stopped',
				value: 'stopped',
				description: 'Rows that are stopped (default)',
			},
		],
		default: ['stopped'],
		description: 'Which statuses to include in enrichment (default: stopped only)',
		routing: {
			send: {
				type: 'body',
				property: 'includeStatuses',
			},
		},
	},
	{
		displayName: 'Exclude Errors',
		name: 'excludeErrors',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
				enrichmentType: ['filtered'],
			},
		},
		default: true,
		description: 'Whether to skip rows with errors',
		routing: {
			send: {
				type: 'body',
				property: 'excludeErrors',
			},
		},
	},
	{
		displayName: 'Start Row',
		name: 'startRow',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
				enrichmentType: ['filtered'],
			},
		},
		default: 1,
		description: 'Starting row number (1-based)',
		routing: {
			send: {
				type: 'body',
				property: 'startRow',
			},
		},
	},
	{
		displayName: 'Max Rows',
		name: 'maxRows',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
				enrichmentType: ['filtered'],
			},
		},
		default: 100,
		description: 'Maximum number of rows to process',
		routing: {
			send: {
				type: 'body',
				property: 'maxRows',
			},
		},
	},

	// Dry Run
	{
		displayName: 'Dry Run',
		name: 'dryRun',
		type: 'hidden',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
				enrichmentType: ['dryRun'],
			},
		},
		default: true,
		routing: {
			send: {
				type: 'body',
				property: 'dryRun',
			},
		},
	},

	/* -------------------------------------------------------------------------- */
	/*                              lead:findLeads                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Search Term',
		name: 'searchTerm',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
			},
		},
		required: true,
		default: '',
		placeholder: 'e.g., Zahnarzt, Restaurant, Hotel',
		description: 'What type of business to search for',
	},
	{
		displayName: 'Location Type',
		name: 'locationType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
			},
		},
		options: [
			{
				name: 'By City/Location Name',
				value: 'byName',
			},
			{
				name: 'By Coordinates',
				value: 'byCoordinates',
			},
		],
		default: 'byName',
		description: 'How to specify the search location',
	},
	{
		displayName: 'Location',
		name: 'locationName',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
				locationType: ['byName'],
			},
		},
		required: true,
		default: '',
		placeholder: 'e.g., Berlin, Hamburg, Munich',
		description: 'City or location to search in',
	},
	{
		displayName: 'Latitude',
		name: 'latitude',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
				locationType: ['byCoordinates'],
			},
		},
		required: true,
		default: 52.520008,
		description: 'Latitude coordinate for search center',
	},
	{
		displayName: 'Longitude',
		name: 'longitude',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
				locationType: ['byCoordinates'],
			},
		},
		required: true,
		default: 13.404954,
		description: 'Longitude coordinate for search center',
	},
	{
		displayName: 'Zoom Level',
		name: 'zoom',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
			},
		},
		required: true,
		default: 13,
		description: 'Map zoom level (1-21). Higher = smaller area, more precise results. Recommended: 12-15',
		typeOptions: {
			minValue: 1,
			maxValue: 21,
		},
	},
	{
		displayName: 'Add Leads to Project',
		name: 'addToProject',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
			},
		},
		default: true,
		description: 'Whether to automatically add found leads to the project',
	},
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['findLeads'],
				addToProject: [true],
			},
		},
		default: '',
		description: 'ID of the project to add leads to',
	},

	/* -------------------------------------------------------------------------- */
	/*                              lead:addLeads                                */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Company Name',
		name: 'company',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['addLeads'],
			},
		},
		required: true,
		default: '',
		placeholder: 'e.g., {{$json.company}}',
		description: 'Company name from previous node',
	},
	{
		displayName: 'Website',
		name: 'website',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['addLeads'],
			},
		},
		default: '',
		placeholder: 'e.g., {{$json.website}}',
		description: 'Company website URL (optional)',
	},
];