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

		{
			'action_name': 'SettingsScreen.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/SettingsScreen.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'SettingsScreen', '-h', '../../source/Testbed/MemoApp/SettingsScreen.h', '-cpp', '../../source/Testbed/MemoApp/SettingsScreen.mm', ], # action
		},

		{
			'action_name': 'StartScreen.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/StartScreen.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'StartScreen', '-h', '../../source/Testbed/MemoApp/StartScreen.h', '-cpp', '../../source/Testbed/MemoApp/StartScreen.mm', ], # action
		},

		{
			'action_name': 'SendToGroupScreen.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/SendToGroupScreen.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'SendToGroupScreen', '-h', '../../source/Testbed/MemoApp/SendToGroupScreen.h', '-cpp', '../../source/Testbed/MemoApp/SendToGroupScreen.mm', ], # action
		},

		{
			'action_name': 'MyInboxScreen.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/MyInboxScreen.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'MyInboxScreen', '-h', '../../source/Testbed/MemoApp/MyInboxScreen.h', '-cpp', '../../source/Testbed/MemoApp/MyInboxScreen.mm', ], # action
		},

		{
			'action_name': 'VersionCheckScreen.tgf',
			'inputs': [ '../../tgf/Testbed/MemoApp/VersionCheckScreen.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'VersionCheckScreen', '-h', '../../source/Testbed/MemoApp/VersionCheckScreen.h', '-cpp', '../../source/Testbed/MemoApp/VersionCheckScreen.mm', ], # action
		},

		],

		'sources': [
			'../../source/Testbed/MemoApp/package.h',

			'../../source/Testbed/MemoApp/MemoApp.mm',
			'../../source/Testbed/MemoApp/MemoApp.h',

			'../../source/Testbed/MemoApp/MemoEvent.h',
			'../../source/Testbed/MemoApp/MemoEventManager.h',

			'../../source/Testbed/MemoApp/Screen.h',

			'../../source/Testbed/MemoApp/MyInboxScreen.mm',
			'../../source/Testbed/MemoApp/MyInboxScreen.h',

			'../../source/Testbed/MemoApp/RecordAudioScreen.mm',
			'../../source/Testbed/MemoApp/RecordAudioScreen.h',

			'../../source/Testbed/MemoApp/PlayAudioScreen.mm',
			'../../source/Testbed/MemoApp/PlayAudioScreen.h',

			'../../source/Testbed/MemoApp/SettingsScreen.mm',
			'../../source/Testbed/MemoApp/SettingsScreen.h',

			'../../source/Testbed/MemoApp/StartScreen.mm',
			'../../source/Testbed/MemoApp/StartScreen.h',

			'../../source/Testbed/MemoApp/SendToGroupScreen.mm',
			'../../source/Testbed/MemoApp/SendToGroupScreen.h',

			'../../source/Testbed/MemoApp/VersionCheckScreen.mm',
			'../../source/Testbed/MemoApp/VersionCheckScreen.h',

			'../../source/Testbed/MemoApp/JSONUtil.mm',
			'../../source/Testbed/MemoApp/JSONUtil.h',
			'../../source/Testbed/MemoApp/URLLoader.mm',
			'../../source/Testbed/MemoApp/URLLoader.h',

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
			'../../source/Base/tTimer.cpp',
			'../../source/Base/tTimer.h',
			'../../source/Base/<@(OS)/tTimerPeer.mm',
			'../../source/Base/<@(OS)/tTimerPeer.h',
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

		'include_dirs': [
			'../../source',
			'../../source/Audio/<@(OS)',
			'../../source/Base/<@(OS)',
			'../../source/Bootstrap/<@(OS)',
			'../../source/Io/<@(OS)',

			'../../third-party/libjson/',
			'../../third-party/libjson/_internal/Source/',
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

					'../../source/Testbed/MemoApp/<@(OS)/InboxCell.h',
					'../../source/Testbed/MemoApp/<@(OS)/InboxCell.mm',

					'../../third-party/TestFlightSDK2.0.2/TestFlight.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+ManualSessions.h',

					'../../third-party/libjson/JSONOptions.h',
					'../../third-party/libjson/libjson.h',

					'../../third-party/libjson/_internal/Source/internalJSONNode.cpp',
					'../../third-party/libjson/_internal/Source/JSONAllocator.cpp',
					'../../third-party/libjson/_internal/Source/JSONChildren.cpp',
					'../../third-party/libjson/_internal/Source/JSONDebug.cpp',
					'../../third-party/libjson/_internal/Source/JSONIterators.cpp',
					'../../third-party/libjson/_internal/Source/JSONMemory.cpp',
					'../../third-party/libjson/_internal/Source/JSONNode_Mutex.cpp',
					'../../third-party/libjson/_internal/Source/JSONNode.cpp',
					'../../third-party/libjson/_internal/Source/JSONPreparse.cpp',
					'../../third-party/libjson/_internal/Source/JSONStream.cpp',
					'../../third-party/libjson/_internal/Source/JSONValidator.cpp',
					'../../third-party/libjson/_internal/Source/JSONWorker.cpp',
					'../../third-party/libjson/_internal/Source/JSONWriter.cpp',
					'../../third-party/libjson/_internal/Source/libjson.cpp',

				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/Testbed/MemoApp/<@(OS)/en.lproj/InfoPlist.strings',
					'../../rsrc/Testbed/MemoApp/<@(OS)/en.lproj/ViewController_iPhone.xib',
# 					'../../rsrc/Testbed/MemoApp/<@(OS)/en.lproj/ViewController_iPhone5.xib',

					'../../rsrc/Testbed/MemoApp/<@(OS)/en.lproj/InboxCell.xib',

					'../../rsrc/Testbed/MemoApp/<@(OS)/blue-gradient.jpg',

					'../../rsrc/Testbed/MemoApp/<@(OS)/Icon.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/tab-inbox.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/tab-record-audio.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/tab-recordings.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/tab-settings.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/person32.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/voicemail_16_border.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/inbox_star_off.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/inbox_star_on.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/inbox_star_pressed.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/play-background-onpress.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/play-background.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/play-button.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/pause-button.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/playhead.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/scrubber-background.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/play-details-button.png',
					'../../rsrc/Testbed/MemoApp/<@(OS)/play-translation-bg.png',

					'../../rsrc/Testbed/MemoApp/<@(OS)/Default.png',
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
