/**
 * External dependencies
 */
import React from 'react';
import {
	Container,
	Col,
	Text,
	Button,
	Title,
	IconsCard,
	getRedirectUrl,
} from '@automattic/jetpack-components';
import { __ } from '@wordpress/i18n';
import { useProductCheckoutWorkflow } from '@automattic/jetpack-connection';

/**
 * Internal dependencies
 */
import useAnalyticsTracks from '../../hooks/use-analytics-tracks';
import { SECURITY_BUNDLE } from '../admin-page';
import useProtectData from '../../hooks/use-protect-data';

const ProductPromotion = ( { onSecurityAdd, hasCheckoutStarted, hasSecurityBundle } ) => {
	if ( ! hasSecurityBundle ) {
		const getStartedUrl = getRedirectUrl( 'protect-footer-get-started-scan' );

		return (
			<>
				<Title>
					{ __( 'Increase your site protection with Jetpack Scan', 'jetpack-protect' ) }
				</Title>
				<Text mb={ 3 }>
					{ __(
						'With your Jetpack Security bundle you have access to Jetpack Scan. Automatically scan your site from the Cloud, get email notifications and perform one-click fixes.',
						'jetpack-protect'
					) }
				</Text>

				<Button variant="external-link" weight="regular" href={ getStartedUrl }>
					{ __( 'Get Started', 'jetpack-protect' ) }
				</Button>
			</>
		);
	}

	return (
		<>
			<Title>{ __( 'Comprehensive Site Security', 'jetpack-protect' ) }</Title>
			<Text mb={ 3 }>
				{ __(
					'Jetpack Security offers advanced scan tools, including one-click fixes for most threats and malware scanning. Plus, with this bundle you also get real-time cloud backups and spam protection.',
					'jetpack-protect'
				) }
			</Text>

			<Button variant="secondary" onClick={ onSecurityAdd } isLoading={ hasCheckoutStarted }>
				{ __( 'Get Jetpack Security', 'jetpack-protect' ) }
			</Button>
		</>
	);
};

const FooterInfo = () => {
	const learnMoreUrl = getRedirectUrl( 'jetpack-protect-footer-learn-more' );

	return (
		<>
			<Title>{ __( 'Over 22,000 listed vulnerabilities', 'jetpack-protect' ) }</Title>
			<Text mb={ 3 }>
				{ __(
					'Every day we check your plugin, theme, and WordPress versions against our 22,000 listed vulnerabilities powered by WPScan, an Automattic brand.',
					'jetpack-protect'
				) }
			</Text>
			<Button variant="external-link" href={ learnMoreUrl } weight="regular">
				{ __( 'Learn more', 'jetpack-protect' ) }
			</Button>
		</>
	);
};

const Footer = () => {
	const { adminUrl } = window.jetpackProtectInitialState || {};

	const { run, hasCheckoutStarted } = useProductCheckoutWorkflow( {
		productSlug: SECURITY_BUNDLE,
		redirectUrl: adminUrl,
	} );

	const { recordEventHandler } = useAnalyticsTracks();
	const getSecurityBundle = recordEventHandler(
		'jetpack_protect_footer_get_security_link_click',
		run
	);

	const { securityBundle } = useProtectData();
	const { hasRequiredPlan } = securityBundle;

	return (
		<Container horizontalSpacing={ 8 } horizontalGap={ 0 }>
			<Col>
				<IconsCard
					products={ ! hasRequiredPlan ? [ 'backup', 'scan', 'anti-spam' ] : [ 'scan' ] }
				/>
			</Col>
			<Col>
				<Container fluid horizontalSpacing={ 0 } horizontalGap={ 8 }>
					<Col lg={ 6 }>
						<ProductPromotion
							onSecurityAdd={ getSecurityBundle }
							hasCheckoutStarted={ hasCheckoutStarted }
							hasSecurityBundle={ ! hasRequiredPlan }
						/>
					</Col>
					<Col lg={ 6 }>
						<FooterInfo />
					</Col>
				</Container>
			</Col>
		</Container>
	);
};

export default Footer;