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
				'action_name': 'LoginScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/LoginScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'LoginScreen', '-h', '../../source/Testbed/GoCastTalk/LoginScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/LoginScreen.mm', ],
			},
			{
				'action_name': 'InboxScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/InboxScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'InboxScreen', '-h', '../../source/Testbed/GoCastTalk/InboxScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/InboxScreen.mm', ],
			},
			{
				'action_name': 'InboxMessageScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/InboxMessageScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'InboxMessageScreen', '-h', '../../source/Testbed/GoCastTalk/InboxMessageScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/InboxMessageScreen.mm', ],
			},
			{
				'action_name': 'RecordMessageScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/RecordMessageScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'RecordMessageScreen', '-h', '../../source/Testbed/GoCastTalk/RecordMessageScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/RecordMessageScreen.mm', ],
			},
			{
				'action_name': 'MessageHistoryScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/MessageHistoryScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'MessageHistoryScreen', '-h', '../../source/Testbed/GoCastTalk/MessageHistoryScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/MessageHistoryScreen.mm', ],
			},

			{
				'action_name': 'ContactsScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/ContactsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'ContactsScreen', '-h', '../../source/Testbed/GoCastTalk/ContactsScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/ContactsScreen.mm', ],
			},
			{
				'action_name': 'EditContactsScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/EditContactsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'EditContactsScreen', '-h', '../../source/Testbed/GoCastTalk/EditContactsScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/EditContactsScreen.mm', ],
			},
			{
				'action_name': 'CreateContactScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/CreateContactScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'CreateContactScreen', '-h', '../../source/Testbed/GoCastTalk/CreateContactScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/CreateContactScreen.mm', ],
			},

			{
				'action_name': 'SettingsScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/SettingsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'SettingsScreen', '-h', '../../source/Testbed/GoCastTalk/SettingsScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/SettingsScreen.mm', ],
			},
			{
				'action_name': 'ChangeRegisteredNameScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/ChangeRegisteredNameScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'ChangeRegisteredNameScreen', '-h', '../../source/Testbed/GoCastTalk/ChangeRegisteredNameScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/ChangeRegisteredNameScreen.mm', ],
			},
			{
				'action_name': 'GroupViewScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/GroupViewScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'GroupViewScreen', '-h', '../../source/Testbed/GoCastTalk/GroupViewScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/GroupViewScreen.mm', ],
			},
			{
				'action_name': 'EditAllGroupsScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/EditAllGroupsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'EditAllGroupsScreen', '-h', '../../source/Testbed/GoCastTalk/EditAllGroupsScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/EditAllGroupsScreen.mm', ],
			},
			{
				'action_name': 'EditOneGroupScreen.tgf',
				'inputs': [ '../../tgf/Testbed/GoCastTalk/EditOneGroupScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'EditOneGroupScreen', '-h', '../../source/Testbed/GoCastTalk/EditOneGroupScreen.h', '-cpp', '../../source/Testbed/GoCastTalk/EditOneGroupScreen.mm', ],
			},
		],

		'sources': [
			'../../source/Testbed/GoCastTalk/package.h',

			'../../source/Testbed/GoCastTalk/GCTEvent.h',
			'../../source/Testbed/GoCastTalk/GCTEventManager.h',

			'../../source/Testbed/GoCastTalk/LoginScreen.mm',
			'../../source/Testbed/GoCastTalk/LoginScreen.h',

			'../../source/Testbed/GoCastTalk/InboxScreen.mm',
			'../../source/Testbed/GoCastTalk/InboxScreen.h',

			'../../source/Testbed/GoCastTalk/InboxMessageScreen.mm',
			'../../source/Testbed/GoCastTalk/InboxMessageScreen.h',

			'../../source/Testbed/GoCastTalk/RecordMessageScreen.mm',
			'../../source/Testbed/GoCastTalk/RecordMessageScreen.h',

			'../../source/Testbed/GoCastTalk/MessageHistoryScreen.mm',
			'../../source/Testbed/GoCastTalk/MessageHistoryScreen.h',

			'../../source/Testbed/GoCastTalk/ContactsScreen.mm',
			'../../source/Testbed/GoCastTalk/ContactsScreen.h',

			'../../source/Testbed/GoCastTalk/EditContactsScreen.mm',
			'../../source/Testbed/GoCastTalk/EditContactsScreen.h',

			'../../source/Testbed/GoCastTalk/EditAllGroupsScreen.mm',
			'../../source/Testbed/GoCastTalk/EditAllGroupsScreen.h',

			'../../source/Testbed/GoCastTalk/EditOneGroupScreen.mm',
			'../../source/Testbed/GoCastTalk/EditOneGroupScreen.h',

			'../../source/Testbed/GoCastTalk/CreateContactScreen.mm',
			'../../source/Testbed/GoCastTalk/CreateContactScreen.h',

			'../../source/Testbed/GoCastTalk/SettingsScreen.mm',
			'../../source/Testbed/GoCastTalk/SettingsScreen.h',

			'../../source/Testbed/GoCastTalk/ChangeRegisteredNameScreen.mm',
			'../../source/Testbed/GoCastTalk/ChangeRegisteredNameScreen.h',

			'../../source/Testbed/GoCastTalk/GroupViewScreen.mm',
			'../../source/Testbed/GoCastTalk/GroupViewScreen.h',
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

					'../../source/Testbed/GoCastTalk/<@(OS)/VC/LoginVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/LoginVC.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/VC/InboxVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/InboxVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/ContactsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/ContactsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/SettingsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/VC/SettingsVC.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditAllGroupsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditAllGroupsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditOneGroupVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditOneGroupVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditContactsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/EditContactsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/CreateContactVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/CreateContactVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/GroupViewVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/GroupViewVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.mm',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/MessageSentVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/MessageSentVC.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/AboutVC.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/SubVC/AboutVC.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/InboxEntryCell.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/InboxEntryCell.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/HeadingSubCell.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/HeadingSubCell.mm',

					'../../source/Testbed/GoCastTalk/<@(OS)/CCCell.h',
					'../../source/Testbed/GoCastTalk/<@(OS)/CCCell.mm',

					'../../third-party/TestFlightSDK2.0.2/TestFlight.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK2.0.2/TestFlight+ManualSessions.h',

				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/InfoPlist.strings',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/MainWindow.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/LoginVC.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/InboxVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/ContactsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/VC/SettingsVC.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/CreateContactVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/EditAllGroupsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/EditOneGroupVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/EditContactsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/GroupViewVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/MessageSentVC.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/SubVC/AboutVC.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/InboxEntryCell.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/HeadingSubCell.xib',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/en.lproj/CCCell.xib',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/bg-login.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/bg-button.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/banner.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-inbox.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-newmemo.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-contacts.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/tab-settings.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-receive.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-sent.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-right.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-check.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-nocheck.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-tri-down.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/icon-tri-right.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-add.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-del.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-pause.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-play.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-record.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-stop.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-pause-white.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/button-play-white.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Icon.png',

					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Default.png',
					'../../rsrc/Testbed/GoCastTalk/<@(OS)/Default-568h@2x.png',
				],	# mac_bundle_resources

                'mac_framework_dirs': [
                '../../third-party/DragonMobileSDK_1.4.9',
                ],

				'link_settings': {
					'libraries': [
						'../../third-party/TestFlightSDK2.0.2/libTestFlight.a',
						'libz.dylib',
						'../../third-party/DragonMobileSDK_1.4.9/SpeechKit.framework',
						'$(SDKROOT)/System/Library/Frameworks/AddressBook.framework',
						'$(SDKROOT)/System/Library/Frameworks/AddressBookUI.framework',
						'$(SDKROOT)/System/Library/Frameworks/AudioToolbox.framework',
						'$(SDKROOT)/System/Library/Frameworks/AVFoundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/CFNetwork.framework',
						'$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
						'$(SDKROOT)/System/Library/Frameworks/MessageUI.framework',
						'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework',
						'$(SDKROOT)/System/Library/Frameworks/QuartzCore.framework',
						'$(SDKROOT)/System/Library/Frameworks/Security.framework',
						'$(SDKROOT)/System/Library/Frameworks/SystemConfiguration.framework',
					],	# libraries
				},	# link_settings
			}],  # OS=="ios"

		],  # conditions

	}],  # targets
}
