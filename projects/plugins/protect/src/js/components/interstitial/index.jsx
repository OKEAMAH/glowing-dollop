/**
 * External dependencies
 */
import React from 'react';
import { Dialog, ProductOffer, useBreakpointMatch } from '@automattic/jetpack-components';

/**
 * Internal dependencies
 */
import ConnectedProductOffer from '../product-offer';
import useProtectData from '../../hooks/use-protect-data';
import styles from './styles.module.scss';

const SecurityBundle = ( { onAdd, redirecting, ...rest } ) => {
	const { securityBundle } = useProtectData();
	const {
		name,
		title,
		longDescription,
		isBundle,
		supportedProducts,
		features,
		pricingForUi,
	} = securityBundle;

	// Compute the price per month.
	const price = Math.ceil( ( pricingForUi.fullPrice / 12 ) * 100 ) / 100;
	const offPrice = Math.ceil( ( pricingForUi.discountPrice / 12 ) * 100 ) / 100;
	const { currencyCode: currency = 'USD' } = pricingForUi;

	return (
		<ProductOffer
			slug="security"
			name={ name }
			title={ title }
			description={ longDescription }
			isBundle={ isBundle }
			supportedProducts={ supportedProducts }
			features={ features }
			pricing={ {
				currency,
				price,
				offPrice,
			} }
			hasRequiredPlan={ false }
			onAdd={ onAdd }
			isLoading={ redirecting }
			{ ...rest }
		/>
	);
};

/**
 * Intersitial Protect component.
 *
 * @param {object} props                   - The props passed to Component.
 * @param {string} props.securityJustAdded - True when the checkout is just added/started.
 * @param {string} props.onSecurityAdd     - Checkout callback handler.
 * @returns {React.Component} Interstitial react component.
 */
const Interstitial = ( { onSecurityAdd, securityJustAdded } ) => {
	const [ isMediumSize ] = useBreakpointMatch( 'md' );
	const mediaClassName = isMediumSize ? styles[ 'is-viewport-medium' ] : null;

	return (
		<Dialog
			primary={ <ConnectedProductOffer className={ mediaClassName } isCard={ true } /> }
			secondary={
				<SecurityBundle
					className={ mediaClassName }
					onAdd={ onSecurityAdd }
					redirecting={ securityJustAdded }
				/>
			}
			isTwoSections={ true }
		/>
	);
};

export default Interstitial;