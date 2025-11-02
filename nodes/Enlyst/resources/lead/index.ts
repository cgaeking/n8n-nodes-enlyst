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
				name: 'Upload CSV',
				value: 'uploadCsv',
				description: 'Upload CSV file to project',
				action: 'Upload CSV file',
			},
			{
				name: 'Download CSV',
				value: 'downloadCsv',
				description: 'Download project data as CSV',
				action: 'Download CSV file',
			},
		],
		default: 'getProjectData',
	},

	// Project ID (required for all operations)
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
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
			minValue: 0,
		},
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['getProjectData'],
			},
		},
		default: 0,
		description: 'Max number of results to return (0 = get all leads)',
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
				name: 'Single Row',
				value: 'single',
				description: 'Enrich a specific row by ID',
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

	// Single Row - Company Name
	{
		displayName: 'Company Name',
		name: 'company',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
				enrichmentType: ['single'],
			},
		},
		required: true,
		default: '',
		placeholder: 'Acme Corporation',
		description: 'Name of the company to enrich',
		routing: {
			send: {
				type: 'body',
				property: 'company',
			},
		},
	},
	// Single Row - Website (Optional)
	{
		displayName: 'Website',
		name: 'website',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['enrichLeads'],
				enrichmentType: ['single'],
			},
		},
		default: '',
		placeholder: 'https://example.com',
		description: 'Website of the company (optional, will be auto-discovered if not provided)',
		routing: {
			send: {
				type: 'body',
				property: 'website',
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
				name: 'Pending',
				value: 'pending',
			},
			{
				name: 'Failed',
				value: 'failed',
			},
			{
				name: 'Stopped',
				value: 'stopped',
			},
		],
		default: ['pending'],
		description: 'Which statuses to include in enrichment',
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
	/*                              lead:uploadCsv                               */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'CSV File',
		name: 'csvFile',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['uploadCsv'],
			},
		},
		required: true,
		default: '',
		placeholder: 'binary:data',
		description: 'The CSV file to upload (from binary data)',
		routing: {
			request: {
				method: 'POST',
				url: '/projects/upload-csv',
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			},
		},
	},
	{
		displayName: 'Company Column',
		name: 'companyColumn',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['uploadCsv'],
			},
		},
		required: true,
		default: 'Firmenname',
		description: 'Name of the column containing company names',
	},
	{
		displayName: 'Website Column',
		name: 'websiteColumn',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['uploadCsv'],
			},
		},
		default: 'Website',
		description: 'Name of the column containing website URLs',
	},
	{
		displayName: 'Import Mode',
		name: 'mode',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['uploadCsv'],
			},
		},
		options: [
			{
				name: 'Append',
				value: 'append',
				description: 'Add rows to existing data',
			},
			{
				name: 'Replace',
				value: 'replace',
				description: 'Replace all existing data',
			},
		],
		default: 'append',
		description: 'How to handle existing project data',
	},
	{
		displayName: 'Delimiter',
		name: 'delimiter',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['uploadCsv'],
			},
		},
		options: [
			{
				name: 'Comma (,)',
				value: ',',
			},
			{
				name: 'Semicolon (;)',
				value: ';',
			},
		],
		default: ',',
		description: 'CSV delimiter character',
	},

	/* -------------------------------------------------------------------------- */
	/*                             lead:downloadCsv                              */
	/* -------------------------------------------------------------------------- */
	{
		displayName: 'Filter by Status',
		name: 'downloadStatusFilter',
		type: 'multiOptions',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['downloadCsv'],
			},
		},
		options: [
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
		default: ['completed'],
		description: 'Which statuses to include in the export',
		routing: {
			request: {
				method: 'POST',
				url: '=/projects/{{$parameter.projectId}}/download-csv',
			},
			send: {
				type: 'body',
				property: 'filters.status',
			},
		},
	},
	{
		displayName: 'Has Email Filter',
		name: 'hasEmailFilter',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['downloadCsv'],
			},
		},
		default: false,
		description: 'Whether to include only rows that have an email address',
		routing: {
			send: {
				type: 'body',
				property: 'filters.hasEmail',
			},
		},
	},
];