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
				'action_name': 'InboxScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/InboxScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'InboxScreen', '-h', '../../source/Testbed/GoCastTalk/InboxScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/InboxScreen.mm', ],
			},
			{
				'action_name': 'InboxMessageScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/InboxMessageScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'InboxMessageScreen', '-h', '../../source/Testbed/GoCastTalk/InboxMessageScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/InboxMessageScreen.mm', ],
			},
		],

		'sources': [
			'../../source/Testbed/GoCastTalk/package.h',

			'../../source/Testbed/GoCastTalk/GCTEvent.h',
			'../../source/Testbed/GoCastTalk/GCTEventManager.h',

			'../../source/Testbed/GoCastTalk/InboxScreen.mm',
			'../../source/Testbed/GoCastTalk/InboxScreen.h',

			'../../source/Testbed/GoCastTalk/InboxMessageScreen.mm',
			'../../source/Testbed/GoCastTalk/InboxMessageScreen.h',

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
			'../../source/Testbed/GoCastTalk/<@(OS)',
		 ],  # include_dirs

		'xcode_settings': {
			'TARGETED_DEVICE_FAMILY': '1',
			'INFOPLIST_FILE': '../../rsrc/Testbed/GoCastTalk/<@(OS)/portrait.plist',
		},	# xcode_settings

		'conditions': [
			['OS=="ios"', {
				'sources': [
					'../../source/Testbed/GoCastTalk/<@(OS)/AppDelegate.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/AppDelegate.mm',
					'../../source/Bootstrap/<@(OS)/main.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/VC/InboxVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/InboxVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/NewMemoVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/NewMemoVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/ContactsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/ContactsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/GroupsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/GroupsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/SettingsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/SettingsVC.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditContactsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditContactsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/GoCastTalkVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/GoCastTalkVC.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/InboxEntryCell.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/InboxEntryCell.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/HeadingSubCell.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/HeadingSubCell.mm',

					'../../third-party/TestFlightSDK2.0.2/TestFlight.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+ManualSessions.h',

				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/InfoPlist.strings',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/MainWindow.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/InboxVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/NewMemoVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/ContactsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/GroupsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/SettingsVC.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/EditContactsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/GoCastTalkVC.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/InboxEntryCell.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/HeadingSubCell.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/banner.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-inbox.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-newmemo.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-contacts.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-groups.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-settings.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-receive.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-sent.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-right.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-pause.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-play.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-record.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Icon.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Default.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Default-568h@2x.png',
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
