/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	AdminPage,
	AdminSectionHero,
	AdminSection,
	Container,
	Col,
} from '@automattic/jetpack-components';

import { useSelect } from '@wordpress/data';
import { ConnectScreen, CONNECTION_STORE_ID } from '@automattic/jetpack-connection';
import React from 'react';

/**
 * Internal dependencies
 */
import Summary from '../summary';
import VulnerabilitiesList from '../vulnerabilities-list';

const coreListMock = [
	{
		name: 'WordPress',
		version: '5.4.1',
		vulnerabilities: [
			{
				risk: 'low',
				description: 'Vulnerability Number 1',
			},
			{
				risk: 'high',
				description: 'Vulnerability Number 2',
			},
		],
	},
];

const pluginsListMock = [
	{
		name: 'Jetpack Backup',
		version: '1.0.1',
		vulnerabilities: [
			{
				risk: 'low',
				description: 'Vulnerability Number 1',
			},
			{
				risk: 'high',
				description: 'Vulnerability Number 2',
			},
			{
				risk: 'medium',
				description: 'Vulnerability Number 3',
			},
			{
				risk: 'low',
				description: 'Vulnerability Number 4',
			},
		],
	},
	{
		name: 'Jetpack Boost',
		version: '1.2.1',
		vulnerabilities: [
			{
				risk: 'high',
				description: 'Vulnerability Number 1',
			},
			{
				risk: 'low',
				description: 'Vulnerability Number 2',
			},
			{
				risk: 'medium',
				description: 'Vulnerability Number 3',
			},
			{
				risk: 'low',
				description: 'Vulnerability Number 4',
			},
		],
	},
];

const themeListMock = [
	{
		name: 'Famous Theme',
		version: '1.0.2',
		vulnerabilities: [
			{
				risk: 'low',
				description: 'Vulnerability Number 1',
			},
			{
				risk: 'low',
				description: 'Vulnerability Number 2',
			},
			{
				risk: 'medium',
				description: 'Vulnerability Number 3',
			},
		],
	},
];

const Admin = () => {
	const connectionStatus = useSelect(
		select => select( CONNECTION_STORE_ID ).getConnectionStatus(),
		[]
	);
	const { isRegistered } = connectionStatus;
	const showConnectionCard = ! isRegistered;
	return (
		<AdminPage moduleName={ __( 'Jetpack Protect', 'jetpack-protect' ) }>
			{ showConnectionCard ? (
				<AdminSectionHero>
					<Container horizontalSpacing={ 3 } horizontalGap={ 3 }>
						<Col sm={ 4 } md={ 8 } lg={ 12 }>
							<ConnectionSection />
						</Col>
					</Container>
				</AdminSectionHero>
			) : (
				<>
					<AdminSectionHero>
						<Container horizontalSpacing={ 3 } horizontalGap={ 3 }>
							<Col>
								<Summary />
							</Col>
						</Container>
					</AdminSectionHero>
					<AdminSection>
						<Container horizontalSpacing={ 3 } horizontalGap={ 3 }>
							<Col>
								<VulnerabilitiesList title="WordPress" list={ coreListMock } />
							</Col>
							<Col>
								<VulnerabilitiesList title="Plugins" list={ pluginsListMock } />
							</Col>
							<Col>
								<VulnerabilitiesList title="Themes" list={ themeListMock } />
							</Col>
						</Container>
					</AdminSection>
				</>
			) }
		</AdminPage>
	);
};

export default Admin;

const ConnectionSection = () => {
	const { apiNonce, apiRoot, registrationNonce } = window.jetpackProtectInitialState;
	return (
		<ConnectScreen
			apiNonce={ apiNonce }
			registrationNonce={ registrationNonce }
			apiRoot={ apiRoot }
			// images={ [ '/images/jetpack-protect-connect.png' ] }
			// assetBaseUrl={ assetBaseUrl }
			from={ 'jetpack-protect' }
			title={ __(
				'Security tools that keep your site safe and sound, from posts to plugins.',
				'jetpack-protect'
			) }
			buttonLabel={ __( 'Set up Jetpack Protect', 'jetpack-protect' ) }
			//redirectUri="admin.php?page=jetpack-protect"
			skipUserConnection
		>
			<h3>{ __( 'Jetpack’s security features include', 'jetpack-protect' ) }</h3>
			<ul>
				<li>{ __( 'Scan for known plugin & theme vulnerabilities', 'jetpack-protect' ) }</li>
				<li>{ __( 'Database of vulnerabilities manually updated daily', 'jetpack-protect' ) }</li>
			</ul>
		</ConnectScreen>
	);
};