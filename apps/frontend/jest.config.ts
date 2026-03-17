/* eslint-disable */
export default {
	displayName: 'frontend',
	preset: '../../jest.preset.js',
	setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
	coverageDirectory: '../../coverage/apps/frontend',
	transform: {
		'^.+\\.(ts|mjs|js|html)$': [
			'@swc/jest',
			{
				jsc: {
					target: 'es2022',
					parser: {
						syntax: 'typescript',
						decorators: true,
					},
					transform: {
						legacyDecorator: true,
						decoratorMetadata: true,
					},
				},
			},
		],
	},
	transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
	testEnvironment: 'node',
};
