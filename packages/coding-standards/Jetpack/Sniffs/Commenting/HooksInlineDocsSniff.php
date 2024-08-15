<?php
/**
 * This sniff verifies a WordPress hook function has a preceding docblock.
 *
 * @package   automattic/jetpack-coding-standards
 */

// I admit this is weird. This allows the sniff to be named "Jetpack.Commenting.HooksInlineDocs".
namespace Automattic\Jetpack\CodingStandards\Jetpack\Sniffs\Commenting;

use WordPressCS\WordPress\AbstractFunctionRestrictionsSniff;
use PHP_CodeSniffer\Util\Tokens;

/**
 * Class HooksInlineDocsSniff
 *
 * @package WPCS\WordPressCodingStandards
 */
class HooksInlineDocsSniff extends AbstractFunctionRestrictionsSniff {

	/**
	 * Array of WordPress hook execution functions.
	 *
	 * @var array WordPress hook execution function name => filter or action.
	 */
	protected $hook_functions = array(
		'apply_filters'            => 'filter',
		'apply_filters_ref_array'  => 'filter',
		'apply_filters_deprecated' => 'filter',
		'do_action'                => 'action',
		'do_action_ref_array'      => 'action',
		'do_action_deprecated'     => 'action',
	);

	/**
	 * Array of allowed exceptional version numbers.
	 *
	 * By default, X.Y.Z version numbers are required. If there are any exceptions,
	 * they can be passed in the ruleset XML file via:
	 * <rule ref="Jetpack.Commenting.HooksInlineDocs">
	 *  <properties>
	 *   <property name="allowed_extra_versions" type="array">
	 *    <element key="0.71" value="0.71"/>
	 *    <element key="MU (3.0.0)" value="MU (3.0.0)"/>
	 *   </property>
	 * </rule>
	 *
	 * The key values are used to determine if a version is allowed outside of the X.Y.Z scheme. The value is not considered.
	 */
	public $allowed_extra_versions = array();

	/**
	 * Groups of functions to restrict.
	 *
	 * Example: groups => array(
	 *  'lambda' => array(
	 *      'type'      => 'error' | 'warning',
	 *      'message'   => 'Use anonymous functions instead please!',
	 *      'functions' => array( 'file_get_contents', 'create_function' ),
	 *  )
	 * )
	 *
	 * @return array
	 */
	public function getGroups() {
		return array(
			'hooks' => array(
				'functions' => array_keys( $this->hook_functions ),
			),
		);
	}

	/**
	 * Process a matched token.
	 *
	 * @since 1.0.0 Logic split off from the `process_token()` method.
	 *
	 * @param int    $stack_ptr       The position of the current token in the stack.
	 * @param string $group_name      The name of the group which was matched.
	 * @param string $matched_content The token content (function name) which was matched.
	 *
	 * @return int|void Integer stack pointer to skip forward or void to continue
	 *                  normal file processing.
	 */
	public function process_matched_token( $stack_ptr, $group_name, $matched_content ) {

		if ( ! $this->verify_valid_match( $stack_ptr ) ) {
			return;
		}

		$previous_comment = $this->return_previous_comment( $stack_ptr );

		if ( false !== $previous_comment ) {
			/*
			 * Check to determine if there is a comment immediately preceding the function call.
			 */
			if ( ( $this->tokens[ $previous_comment ]['line'] + 1 ) !== $this->tokens[ $stack_ptr ]['line'] ) {
				$this->phpcsFile->addError(
					'The inline documentation for a hook must be on the line immediately before the function call.',
					$stack_ptr,
					'DocMustBePreceding'
				);
			}

			/*
			 * Check that the comment starts is a docblock.
			 */
			if ( \T_DOC_COMMENT_CLOSE_TAG !== $this->tokens[ $previous_comment ]['code'] ) {
				$this->phpcsFile->addError(
					'Hooks must include a docblock with /** formatting */',
					$stack_ptr,
					'NoDocblockFound'
				);
			}

			/*
			 * Process docblock tags.
			 */
			$comment_end   = $previous_comment;
			$comment_start = $this->return_comment_start( $comment_end );
			$has           = array(
				'since' => false,
			);

			// The comment isn't a docblock or is documented elsewhere, so we're going to stop here.
			if ( ! $comment_start || $this->is_previously_documented( $comment_start, $comment_end ) ) {
				return;
			}

			foreach ( $this->tokens[ $comment_start ]['comment_tags'] as $tag ) {
				// Is the next tag of the docblock the "@since" tag?
				if ( '@since' === $this->tokens[ $tag ]['content'] ) {
					$has['since'] = true;
					// Find the next string, which will be the text after the @since.
					$string = $this->phpcsFile->findNext( T_DOC_COMMENT_STRING, $tag, $comment_end );
					// If it is false, there is no text or if the text is on the another line, error.
					if ( false === $string || $this->tokens[ $string ]['line'] !== $this->tokens[ $tag ]['line'] ) {
						$this->phpcsFile->addError( 'Since tag must have a value.', $tag, 'EmptySince' );
					} elseif ( ! preg_match('/^\d+\.\d+\.\d+/', $this->tokens[ $string ]['content'], $matches ) ) { // Requires X.Y.Z. Trailing 0 is needed for a major release.
						if ( empty( $this->allowed_extra_versions ) || ! $this->array_begins_with( $this->tokens[ $string ]['content'], $this->allowed_extra_versions ) ) {
							$this->phpcsFile->addError( 'Since tag must have a X.Y.Z version number.' . $this->tokens[ $string ]['content'], $tag, 'InvalidSince' );
						}
					}
				}
			}

			foreach ( $has as $name => $present ) {
				if ( ! $present ) {
					$this->phpcsFile->addError( 'Hook documentation is missing a tag: ' . $name, $comment_start, 'No' . ucfirst( $name ) );
				}
			}
		}
	}

	/**
	 * Helper function to identify the comment previous to a pointer reference.
	 *
	 * @param int $stack_ptr       The position of the token in the stack.
	 */
	protected function return_previous_comment( $stack_ptr ) {
		return $this->phpcsFile->findPrevious( Tokens::$commentTokens, ( $stack_ptr - 1 ) );
	}

	/**
	 * Returns the starting comment reference when passed an end reference.
	 *
	 * Used to help set bounds for searching through a docblock.
	 *
	 * @param int $end       The position of the ending token in the stack.
	 */
	protected function return_comment_start( $end ) {
		return ( isset( $this->tokens[ $end ]['comment_opener'] ) ) ? $this->tokens[ $end ]['comment_opener'] : false;
	}

	/**
	 * Determines if a filter docblock is referencing a complete docblock elsewhere.
	 *
	 * @param int $start       The position of the starting token in the stack.
	 * @param int $end       The position of the ending token in the stack.
	 *
	 * @return bool If docblock matches the previously documented convention.
	 */
	protected function is_previously_documented( $start, $end ) {
		$string = $this->phpcsFile->findNext( T_DOC_COMMENT_STRING, $start, $end );

		$content = $this->tokens[ $string ]['content'];
		// If the call is documented elsewhere, stop here.
		if ( 0 === strpos( $content, 'This filter is documented' ) ) {
			return true;
		}

		if ( 0 === strpos( $content, 'This action is documented' ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Verifies the match is valid and worthy of continued processing.
	 *
	 * @param int $stack_ptr       The position of the token in the stack.
	 *
	 * @return bool True for valid.
	 */
	protected function verify_valid_match( $stack_ptr ) {
		$func_open_paren_token = $this->phpcsFile->findNext( Tokens::$emptyTokens, ( $stack_ptr + 1 ), null, true );
		if ( false === $func_open_paren_token
		     || \T_OPEN_PARENTHESIS !== $this->tokens[ $func_open_paren_token ]['code']
		     || ! isset( $this->tokens[ $func_open_paren_token ]['parenthesis_closer'] )
		) {
			// Live coding, parse error or not a function call.
			return false;
		}

		return true;
	}

	protected function array_begins_with( $string, $array ){
		foreach ( $array as $value ) {
			if ( 0 === strpos( $string, $value ) ) {
				return true;
			}
		}
		return false;
	}
}
