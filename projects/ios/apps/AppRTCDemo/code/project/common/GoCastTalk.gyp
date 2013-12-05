{
	'includes': [
		'common.gypi',
	], # includes

	'targets': [{

		'target_name': 'GoCastTalk',
		'product_name': 'GoCastTalk',
		'type': 'executable',
		'mac_bundle': 1,

		'actions': [
			{
				'action_name': 'GoCastTalkApp.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/GoCastTalkApp.tgf', ], # inputs
				'outputs': [ '../../dummy', ], # outputs
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'GoCastTalkApp', '-h', '../../source/Testbed/GoCastTalk/GoCastTalkApp.h', '-cpp', '../../source/Testbed/GoCastTalk/GoCastTalkApp.mm', ], # action
			},

			{
				'action_name': 'InboxScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/InboxScreen.tgf', ], # inputs
				'outputs': [ '../../dummy', ], # outputs
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'InboxScreen', '-h', '../../source/Testbed/GoCastTalk/InboxScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/InboxScreen.mm', ], # action
			},

			{
				'action_name': 'NewMemoScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/NewMemoScreen.tgf', ], # inputs
				'outputs': [ '../../dummy', ], # outputs
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'NewMemoScreen', '-h', '../../source/Testbed/GoCastTalk/NewMemoScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/NewMemoScreen.mm', ], # action
			},

			{
				'action_name': 'ContactsScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/ContactsScreen.tgf', ], # inputs
				'outputs': [ '../../dummy', ], # outputs
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'ContactsScreen', '-h', '../../source/Testbed/GoCastTalk/ContactsScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/ContactsScreen.mm', ], # action
			},

			{
				'action_name': 'GroupsScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/GroupsScreen.tgf', ], # inputs
				'outputs': [ '../../dummy', ], # outputs
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'GroupsScreen', '-h', '../../source/Testbed/GoCastTalk/GroupsScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/GroupsScreen.mm', ], # action
			},

			{
				'action_name': 'SettingsScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/SettingsScreen.tgf', ], # inputs
				'outputs': [ '../../dummy', ], # outputs
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'SettingsScreen', '-h', '../../source/Testbed/GoCastTalk/SettingsScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/SettingsScreen.mm', ], # action
			},
		],

		'sources': [
			'../../source/Testbed/GoCastTalk/package.h',

			'../../source/Testbed/GoCastTalk/GoCastTalkApp.mm',
			'../../source/Testbed/GoCastTalk/GoCastTalkApp.h',

			'../../source/Testbed/GoCastTalk/GCTEvent.h',
			'../../source/Testbed/GoCastTalk/GCTEventManager.h',

			'../../source/Testbed/GoCastTalk/Screen.h',

			'../../source/Testbed/GoCastTalk/InboxScreen.h',
			'../../source/Testbed/GoCastTalk/InboxScreen.mm',
			'../../source/Testbed/GoCastTalk/NewMemoScreen.h',
			'../../source/Testbed/GoCastTalk/NewMemoScreen.mm',
			'../../source/Testbed/GoCastTalk/ContactsScreen.h',
			'../../source/Testbed/GoCastTalk/ContactsScreen.mm',
			'../../source/Testbed/GoCastTalk/GroupsScreen.h',
			'../../source/Testbed/GoCastTalk/GroupsScreen.mm',
			'../../source/Testbed/GoCastTalk/SettingsScreen.h',
			'../../source/Testbed/GoCastTalk/SettingsScreen.mm',

#--

			'../../source/Testbed/GoCastTalk/JSONUtil.mm',
			'../../source/Testbed/GoCastTalk/JSONUtil.h',
			'../../source/Testbed/GoCastTalk/URLLoader.mm',
			'../../source/Testbed/GoCastTalk/URLLoader.h',

#--

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
		 ],  # include_dirs

		'xcode_settings': {
			'TARGETED_DEVICE_FAMILY': '1',
			'INFOPLIST_FILE': '../../rsrc/<@(OS)/portrait.plist',
		},	# xcode_settings

		'conditions': [
			['OS=="ios"', {
				'sources': [
					'../../source/Testbed/GoCastTalk/<@(OS)/AppDelegate.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/AppDelegate.mm',
					'../../source/Bootstrap/<@(OS)/main.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/ViewController.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/ViewController.mm',

					'../../third-party/TestFlightSDK2.0.2/TestFlight.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+ManualSessions.h',

				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/InfoPlist.strings',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/ViewController_iPhone.xib',
# 					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/ViewController_iPhone5.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/banner.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Icon.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Default.png',
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
