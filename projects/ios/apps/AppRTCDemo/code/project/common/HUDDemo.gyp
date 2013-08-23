{
	'includes': [
		'common.gypi',
	], # includes

	'targets': [{

		'target_name': 'HUDDemo',
		'product_name': 'HUDDemo',
		'type': 'executable',
		'mac_bundle': 1,

		'actions': [
		{
			'action_name': 'HUDDemo.tgf',
			'inputs': [ '../../tgf/Testbed/HUDDemo/HUDDemo.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'HUDDemo', '-h', '../../source/Testbed/HUDDemo/HUDDemo.h', '-cpp', '../../source/Testbed/HUDDemo/HUDDemo.mm', ], # action
		},
		],

		'sources': [
			'../../source/Testbed/HUDDemo/HUDDemo.mm',
			'../../source/Testbed/HUDDemo/HUDDemo.h',

			'../../source/Testbed/HUDDemo/HUDEvent.h',
			'../../source/Testbed/HUDDemo/HUDEventManager.h',

			'../../source/Base/package.h',
			'../../source/Base/tAlert.h',
			'../../source/Base/<@(OS)/tAlert.mm',
			'../../source/Base/tApplication.cpp',
			'../../source/Base/tApplication.h',
			'../../source/Base/tApplicationEvent.h',
			'../../source/Base/tBrowser.h',
			'../../source/Base/<@(OS)/tBrowser.mm',
			'../../source/Base/tBuild.h',
			'../../source/Base/<@(OS)/tBuildPeer.h',
			'../../source/Base/tMealy.cpp',
			'../../source/Base/tMealy.h',
			'../../source/Base/tObserver.h',
			'../../source/Base/tSingleton.h',
			'../../source/Base/tTypes.h',

			'../../source/Input/package.h',
			'../../source/Input/tInputManager.h',
			'../../source/Input/tOrientationEvent.h',
			'../../source/Input/tTouchEvent.h',

		],

		'include_dirs': [
			'../../source',
			'../../source/Base/<@(OS)',
			'../../source/Bootstrap/<@(OS)',
		 ],  # include_dirs

		'xcode_settings': {
			'TARGETED_DEVICE_FAMILY': '1',
			'INFOPLIST_FILE': '../../rsrc/<@(OS)/portrait.plist',
		},	# xcode_settings

		'conditions': [
			['OS=="ios"', {
				'sources': [
					'../../source/Testbed/HUDDemo/<@(OS)/AppDelegate.h',
					'../../source/Testbed/HUDDemo/<@(OS)/AppDelegate.mm',
					'../../source/Bootstrap/<@(OS)/main.mm',
					'../../source/Testbed/HUDDemo/<@(OS)/ViewController.h',
					'../../source/Testbed/HUDDemo/<@(OS)/ViewController.mm',
				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/Testbed/HUDDemo/<@(OS)/en.lproj/InfoPlist.strings',
					'../../rsrc/Testbed/HUDDemo/<@(OS)/en.lproj/ViewController_iPhone.xib',
# 					'../../rsrc/Testbed/HUDDemo/<@(OS)/en.lproj/ViewController_iPhone5.xib',

					'../../rsrc/Testbed/HUDDemo/<@(OS)/blue-gradient.jpg',
					'../../rsrc/Testbed/HUDDemo/<@(OS)/black-button.png',

					'../../rsrc/Testbed/HUDDemo/<@(OS)/button-call.png',
					'../../rsrc/Testbed/HUDDemo/<@(OS)/button-settings.png',

					'../../rsrc/Testbed/HUDDemo/<@(OS)/Icon.png',

					'../../rsrc/Testbed/HUDDemo/<@(OS)/Default.png',
					'../../rsrc/Testbed/HUDDemo/<@(OS)/Default-568h@2x.png',
				],	# mac_bundle_resources

				'link_settings': {
					'libraries': [
						'$(SDKROOT)/System/Library/Frameworks/AVFoundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
						'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework',
						'$(SDKROOT)/System/Library/Frameworks/QuartzCore.framework',
					],	# libraries
				},	# link_settings
			}],  # OS=="ios"

		],  # conditions

	}],  # targets
}
