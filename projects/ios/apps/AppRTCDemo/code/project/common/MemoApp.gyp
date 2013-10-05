{
	'includes': [
		'common.gypi',
	], # includes

	'targets': [{

		'target_name': 'MemoApp',
		'product_name': 'MemoApp',
		'type': 'executable',
		'mac_bundle': 1,

		'actions': [
		{
			'action_name': 'MemoApp.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/MemoApp.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'MemoApp', '-h', '../../source/Testbed/MemoApp/MemoApp.h', '-cpp', '../../source/Testbed/MemoApp/MemoApp.mm', ], # action
		},
		],

		'sources': [
			'../../source/Testbed/MemoApp/MemoApp.mm',
			'../../source/Testbed/MemoApp/MemoApp.h',

			'../../source/Testbed/MemoApp/MemoEvent.h',
			'../../source/Testbed/MemoApp/MemoEventManager.h',

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
					'../../source/Testbed/MemoApp/<@(OS)/AppDelegate.h',
					'../../source/Testbed/MemoApp/<@(OS)/AppDelegate.mm',
					'../../source/Bootstrap/<@(OS)/main.mm',
					'../../source/Testbed/MemoApp/<@(OS)/ViewController.h',
					'../../source/Testbed/MemoApp/<@(OS)/ViewController.mm',

					'../../third-party/TestFlightSDK2.0.0/TestFlight.h',
					'../../third-party/TestFlightSDK2.0.0/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK2.0.0/TestFlight+ManualSessions.h',

				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/Testbed/MemoApp/<@(OS)/en.lproj/InfoPlist.strings',
					'../../rsrc/Testbed/MemoApp/<@(OS)/en.lproj/ViewController_iPhone.xib',
# 					'../../rsrc/Testbed/MemoApp/<@(OS)/en.lproj/ViewController_iPhone5.xib',

					'../../rsrc/Testbed/MemoApp/<@(OS)/blue-gradient.jpg',

					'../../rsrc/Testbed/MemoApp/<@(OS)/Icon.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/tab-inbox.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/tab-record-audio.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/tab-recordings.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/Default.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/Default-568h@2x.png',
				],	# mac_bundle_resources

				'link_settings': {
					'libraries': [
						'../../third-party/TestFlightSDK2.0.0/libTestFlight.a',
						'libz.dylib',
						'$(SDKROOT)/System/Library/Frameworks/AVFoundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
						'$(SDKROOT)/System/Library/Frameworks/MessageUI.framework',
						'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework',
						'$(SDKROOT)/System/Library/Frameworks/QuartzCore.framework',
					],	# libraries
				},	# link_settings
			}],  # OS=="ios"

		],  # conditions

	}],  # targets
}
