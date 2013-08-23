{
	'graphcode': '../../project/common/graphcode.sh',

	# This is set globally for "project" level, which is required for "actions", rather than target level
	'xcode_settings': {
		'SYMROOT': '../../build/<@(OS)',
	}, # xcode_settings

	'conditions': [
		['OS=="ios"', {
			'xcode_settings': {
				'SDKROOT': 'iphoneos',
			}, # xcode_settings
		}],  # OS=="ios"
	],  # conditions

	'target_defaults': {

		'configurations': {

			'debug': {

				'defines': [
					'DEBUG=1',
				], #defines

				'xcode_settings': {
					'ONLY_ACTIVE_ARCH': 'YES',
					'DEAD_CODE_STRIPPING': 'NO',
					'GCC_DYNAMIC_NO_PIC': 'NO',
					'GCC_FAST_MATH': 'NO',
					'GCC_GENERATE_DEBUGGING_SYMBOLS': 'YES',
					'GCC_OPTIMIZATION_LEVEL': '0',
					'GCC_STRICT_ALIASING': 'NO',
					'GCC_UNROLL_LOOPS': 'NO',
					'LD_NO_PIE': 'NO',
				}, # xcode_settings

			}, # debug

			'release': {

				'defines': [
					'DEBUG=0',
					'NDEBUG=1',
				], #defines

				'xcode_settings': {
					'COPY_PHASE_STRIP': 'YES',
					'DEPLOYMENT_POSTPROCESSING': 'YES',
					'SEPARATE_STRIP': 'YES',
					'STRIP_INSTALLED_PRODUCT': 'YES',
					'ONLY_ACTIVE_ARCH': 'NO',
					'DEAD_CODE_STRIPPING': 'YES',
					'GCC_DYNAMIC_NO_PIC': 'YES',
					'GCC_FAST_MATH': 'YES',
					'GCC_GENERATE_DEBUGGING_SYMBOLS': 'NO',
					'GCC_OPTIMIZATION_LEVEL': '3',
					'GCC_STRICT_ALIASING': 'YES',
					'GCC_UNROLL_LOOPS': 'YES',
					'LD_NO_PIE': 'YES',
				}, # xcode_settings

			}, # release

		}, # configurations

		'conditions': [
			['OS=="ios"', {
				'xcode_settings': {
					'TARGETED_DEVICE_FAMILY': '1,2',
					'CODE_SIGN_IDENTITY': 'iPhone Developer',
					'IPHONEOS_DEPLOYMENT_TARGET': '5.0',
					'COMBINE_HIDPI_IMAGES': 'NO',
					'LLVM_LTO': 'NO',
					'ALWAYS_SEARCH_USER_PATHS': 'NO',
					'ARCHS': 'armv7',
					'COPY_PHASE_STRIP': 'NO',
					'GCC_C_LANGUAGE_STANDARD': 'gnu99',
					'GCC_ENABLE_OBJC_EXCEPTIONS': 'YES',
					'GCC_SYMBOLS_PRIVATE_EXTERN': 'YES',
					'GCC_VERSION': 'com.apple.compilers.llvm.clang.1_0',
					'GCC_WARN_64_TO_32_BIT_CONVERSION': 'YES',
					'GCC_WARN_UNUSED_VARIABLE': 'YES',
					'MACOSX_DEPLOYMENT_TARGET': '10.7',
					'GCC_ENABLE_CPP_EXCEPTIONS': 'NO',
					'GCC_ENABLE_CPP_RTTI': 'NO',
					'RUN_CLANG_STATIC_ANALYZER': 'YES',
					'VALIDATE_PRODUCT': 'YES',

					'GCC_WARN_SHADOW': 'YES',
					'CLANG_WARN_IMPLICIT_SIGN_CONVERSION': 'YES',
					'CLANG_WARN_EMPTY_BODY': 'YES',
					'CLANG_WARN_SUSPICIOUS_IMPLICIT_CONVERSION': 'YES',
					'GCC_TREAT_IMPLICIT_FUNCTION_DECLARATIONS_AS_ERRORS': 'YES',
					'GCC_TREAT_INCOMPATIBLE_POINTER_TYPE_WARNINGS_AS_ERRORS': 'YES',
					'GCC_WARN_ABOUT_MISSING_FIELD_INITIALIZERS': 'YES',
					'GCC_WARN_ABOUT_MISSING_NEWLINE': 'YES',
					'GCC_WARN_ABOUT_MISSING_PROTOTYPES': 'YES',
					'GCC_WARN_ABOUT_RETURN_TYPE': 'YES',
					'GCC_WARN_FOUR_CHARACTER_CONSTANTS': 'YES',
					'GCC_WARN_INITIALIZER_NOT_FULLY_BRACKETED': 'YES',
					'GCC_WARN_SIGN_COMPARE': 'YES',
					'GCC_WARN_UNINITIALIZED_AUTOS': 'YES',
					'GCC_WARN_UNKNOWN_PRAGMAS': 'YES',
					'GCC_WARN_UNUSED_FUNCTION': 'YES',
					'GCC_WARN_UNUSED_LABEL': 'YES',
					'GCC_WARN_UNUSED_PARAMETER': 'YES',

					'WARNING_CFLAGS': [
						'-Wall',
						'-Werror',
						'-Wextra',
						'-Wbad-function-cast',
						'-Wdeclaration-after-statement',
						'-Wmissing-format-attribute',
#						'-Wmissing-noreturn',
						'-Wnested-externs',
						'-Wnewline-eof',
						'-Wold-style-definition',
						'-Wredundant-decls',
						'-Wsequence-point',
						'-Wstrict-prototypes',
						'-Wswitch-default',

						'-Wwrite-strings',
						'-Winit-self',
						'-Wcast-align',
						'-Wcast-qual',
						'-Wold-style-cast',
						'-Wpointer-arith',
						'-Wstrict-aliasing',
						'-Wformat=2',
						'-Wuninitialized',
						'-Wmissing-declarations',
						'-Woverloaded-virtual',
						'-Wnon-virtual-dtor',
						'-Wctor-dtor-privacy',
						],
				},
			}], # OS=="mac"
		],   # conditions
	}, # target_defaults
}
