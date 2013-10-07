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

		{
			'action_name': 'RecordAudioScreen.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/RecordAudioScreen.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'RecordAudioScreen', '-h', '../../source/Testbed/MemoApp/RecordAudioScreen.h', '-cpp', '../../source/Testbed/MemoApp/RecordAudioScreen.mm', ], # action
		},

		{
			'action_name': 'PlayAudioScreen.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/PlayAudioScreen.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'PlayAudioScreen', '-h', '../../source/Testbed/MemoApp/PlayAudioScreen.h', '-cpp', '../../source/Testbed/MemoApp/PlayAudioScreen.mm', ], # action
		},
		],

		'sources': [
			'../../source/Testbed/MemoApp/package.h',

			'../../source/Testbed/MemoApp/MemoApp.mm',
			'../../source/Testbed/MemoApp/MemoApp.h',

			'../../source/Testbed/MemoApp/MemoEvent.h',
			'../../source/Testbed/MemoApp/MemoEventManager.h',

			'../../source/Testbed/MemoApp/Screen.h',

			'../../source/Testbed/MemoApp/RecordAudioScreen.mm',
			'../../source/Testbed/MemoApp/RecordAudioScreen.h',

			'../../source/Testbed/MemoApp/PlayAudioScreen.mm',
			'../../source/Testbed/MemoApp/PlayAudioScreen.h',

			'../../source/Audio/package.h',
			'../../source/Audio/<@(OS)/tSound.mm',
			'../../source/Audio/<@(OS)/tSound.h',
			'../../source/Audio/tSoundImp.cpp',
			'../../source/Audio/tSoundImp.h',

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

			'../../source/Io/package.h',
			'../../source/Io/<@(OS)/tFile.mm',
			'../../source/Io/<@(OS)/tFile.h',
			'../../source/Io/tFileImp.cpp',
			'../../source/Io/tFileImp.h',
			'../../source/Io/tFileInputStream.cpp',
			'../../source/Io/tFileInputStream.h',
			'../../source/Io/tFileOutputStream.cpp',
			'../../source/Io/tFileOutputStream.h',
			'../../source/Io/tInputStream.h',
			'../../source/Io/tOutputStream.h',
		],

		'mac_bundle_resources': [
			'../../rsrc/Testbed/MemoApp/example.m4a',
		],	# mac_bundle_resources

		'include_dirs': [
			'../../source',
			'../../source/Audio/<@(OS)',
			'../../source/Base/<@(OS)',
			'../../source/Bootstrap/<@(OS)',
			'../../source/Io/<@(OS)',
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

					'../../third-party/TestFlightSDK2.0.2/TestFlight.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+ManualSessions.h',

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
						'../../third-party/TestFlightSDK2.0.2/libTestFlight.a',
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
