import type { INodeProperties } from 'n8n-workflow';

export const referralDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['referral'],
			},
		},
		options: [
			{
				name: 'Get Stats',
				value: 'getStats',
				description: 'Get referral statistics',
				action: 'Get referral statistics',
			},
		],
		default: 'getStats',
		routing: {
			request: {
				method: 'GET',
				url: '/referrals/stats',
			},
		},
	},
];