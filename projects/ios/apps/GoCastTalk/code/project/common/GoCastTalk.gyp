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
				'action_name': 'touch AboutVC.mm for Build Date',
				'inputs': [ '../../source/GoCastTalk/ios/SubVC/AboutVC.mm', ],
				'outputs': [ '../../dummy', ],
				'action': [ 'touch', '<@(_inputs)'],
			},
			{
				'action_name': 'LoginScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/LoginScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'LoginScreen', '-h', '../../source/GoCastTalk/LoginScreen.h', '-cpp', '../../source/GoCastTalk/LoginScreen.mm', ],
			},
			{
				'action_name': 'InboxScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/InboxScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'InboxScreen', '-h', '../../source/GoCastTalk/InboxScreen.h', '-cpp', '../../source/GoCastTalk/InboxScreen.mm', ],
			},
			{
				'action_name': 'InboxMessageScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/InboxMessageScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'InboxMessageScreen', '-h', '../../source/GoCastTalk/InboxMessageScreen.h', '-cpp', '../../source/GoCastTalk/InboxMessageScreen.mm', ],
			},
			{
				'action_name': 'RecordMessageScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/RecordMessageScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'RecordMessageScreen', '-h', '../../source/GoCastTalk/RecordMessageScreen.h', '-cpp', '../../source/GoCastTalk/RecordMessageScreen.mm', ],
			},
			{
				'action_name': 'MessageHistoryScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/MessageHistoryScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'MessageHistoryScreen', '-h', '../../source/GoCastTalk/MessageHistoryScreen.h', '-cpp', '../../source/GoCastTalk/MessageHistoryScreen.mm', ],
			},

			{
				'action_name': 'ContactsScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/ContactsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'ContactsScreen', '-h', '../../source/GoCastTalk/ContactsScreen.h', '-cpp', '../../source/GoCastTalk/ContactsScreen.mm', ],
			},
			{
				'action_name': 'EditContactsScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/EditContactsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'EditContactsScreen', '-h', '../../source/GoCastTalk/EditContactsScreen.h', '-cpp', '../../source/GoCastTalk/EditContactsScreen.mm', ],
			},
			{
				'action_name': 'CreateContactScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/CreateContactScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'CreateContactScreen', '-h', '../../source/GoCastTalk/CreateContactScreen.h', '-cpp', '../../source/GoCastTalk/CreateContactScreen.mm', ],
			},

			{
				'action_name': 'SettingsScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/SettingsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'SettingsScreen', '-h', '../../source/GoCastTalk/SettingsScreen.h', '-cpp', '../../source/GoCastTalk/SettingsScreen.mm', ],
			},
			{
				'action_name': 'ChangeRegisteredNameScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/ChangeRegisteredNameScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'ChangeRegisteredNameScreen', '-h', '../../source/GoCastTalk/ChangeRegisteredNameScreen.h', '-cpp', '../../source/GoCastTalk/ChangeRegisteredNameScreen.mm', ],
			},
			{
				'action_name': 'ChangeLanguageScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/ChangeLanguageScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'ChangeLanguageScreen', '-h', '../../source/GoCastTalk/ChangeLanguageScreen.h', '-cpp', '../../source/GoCastTalk/ChangeLanguageScreen.mm', ],
			},
			{
				'action_name': 'ChangePasswordScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/ChangePasswordScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'ChangePasswordScreen', '-h', '../../source/GoCastTalk/ChangePasswordScreen.h', '-cpp', '../../source/GoCastTalk/ChangePasswordScreen.mm', ],
			},
			{
				'action_name': 'GroupViewScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/GroupViewScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'GroupViewScreen', '-h', '../../source/GoCastTalk/GroupViewScreen.h', '-cpp', '../../source/GoCastTalk/GroupViewScreen.mm', ],
			},
			{
				'action_name': 'EditAllGroupsScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/EditAllGroupsScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'EditAllGroupsScreen', '-h', '../../source/GoCastTalk/EditAllGroupsScreen.h', '-cpp', '../../source/GoCastTalk/EditAllGroupsScreen.mm', ],
			},
			{
				'action_name': 'EditOneGroupScreen.tgf',
				'inputs': [ '../../tgf/GoCastTalk/EditOneGroupScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'EditOneGroupScreen', '-h', '../../source/GoCastTalk/EditOneGroupScreen.h', '-cpp', '../../source/GoCastTalk/EditOneGroupScreen.mm', ],
			},
		],

		'sources': [
			'../../source/GoCastTalk/package.h',

			'../../source/GoCastTalk/GCTEvent.h',
			'../../source/GoCastTalk/GCTEventManager.h',

			'../../source/GoCastTalk/LoginScreen.mm',
			'../../source/GoCastTalk/LoginScreen.h',

			'../../source/GoCastTalk/InboxScreen.mm',
			'../../source/GoCastTalk/InboxScreen.h',

			'../../source/GoCastTalk/InboxMessageScreen.mm',
			'../../source/GoCastTalk/InboxMessageScreen.h',

			'../../source/GoCastTalk/RecordMessageScreen.mm',
			'../../source/GoCastTalk/RecordMessageScreen.h',

			'../../source/GoCastTalk/MessageHistoryScreen.mm',
			'../../source/GoCastTalk/MessageHistoryScreen.h',

			'../../source/GoCastTalk/ContactsScreen.mm',
			'../../source/GoCastTalk/ContactsScreen.h',

			'../../source/GoCastTalk/EditContactsScreen.mm',
			'../../source/GoCastTalk/EditContactsScreen.h',

			'../../source/GoCastTalk/EditAllGroupsScreen.mm',
			'../../source/GoCastTalk/EditAllGroupsScreen.h',

			'../../source/GoCastTalk/EditOneGroupScreen.mm',
			'../../source/GoCastTalk/EditOneGroupScreen.h',

			'../../source/GoCastTalk/CreateContactScreen.mm',
			'../../source/GoCastTalk/CreateContactScreen.h',

			'../../source/GoCastTalk/SettingsScreen.mm',
			'../../source/GoCastTalk/SettingsScreen.h',

			'../../source/GoCastTalk/ChangeRegisteredNameScreen.mm',
			'../../source/GoCastTalk/ChangeRegisteredNameScreen.h',

			'../../source/GoCastTalk/ChangeLanguageScreen.mm',
			'../../source/GoCastTalk/ChangeLanguageScreen.h',

			'../../source/GoCastTalk/ChangePasswordScreen.mm',
			'../../source/GoCastTalk/ChangePasswordScreen.h',

			'../../source/GoCastTalk/GroupViewScreen.mm',
			'../../source/GoCastTalk/GroupViewScreen.h',
#--

			'../../source/GoCastTalk/JSONUtil.mm',
			'../../source/GoCastTalk/JSONUtil.h',
			'../../source/GoCastTalk/URLLoader.mm',
			'../../source/GoCastTalk/URLLoader.h',

#--
			'../../source/GoCastTalk/I18N.h',
			'../../source/GoCastTalk/I18N.mm',

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
			'../../source/GoCastTalk/<@(OS)',
		 ],  # include_dirs

		'xcode_settings': {
			'TARGETED_DEVICE_FAMILY': '1',
			'INFOPLIST_FILE': '../../rsrc/GoCastTalk/<@(OS)/portrait.plist',
		},	# xcode_settings

		'conditions': [
			['OS=="ios"', {
				'sources': [
					'../../source/GoCastTalk/<@(OS)/AppDelegate.h',
					'../../source/GoCastTalk/<@(OS)/AppDelegate.mm',
					'../../source/Bootstrap/<@(OS)/main.mm',

					'../../source/GoCastTalk/<@(OS)/VC/LoginVC.h',
					'../../source/GoCastTalk/<@(OS)/VC/LoginVC.mm',

					'../../source/GoCastTalk/<@(OS)/VC/InboxVC.h',
					'../../source/GoCastTalk/<@(OS)/VC/InboxVC.mm',
					'../../source/GoCastTalk/<@(OS)/VC/ContactsVC.h',
					'../../source/GoCastTalk/<@(OS)/VC/ContactsVC.mm',
					'../../source/GoCastTalk/<@(OS)/VC/SettingsVC.h',
					'../../source/GoCastTalk/<@(OS)/VC/SettingsVC.mm',

					'../../source/GoCastTalk/<@(OS)/SubVC/EditAllGroupsVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/EditAllGroupsVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/EditOneGroupVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/EditOneGroupVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/EditContactsVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/EditContactsVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/CreateContactVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/CreateContactVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/GroupViewVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/GroupViewVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.mm',
					'../../source/GoCastTalk/<@(OS)/SubVC/MessageSentVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/MessageSentVC.mm',

					'../../source/GoCastTalk/<@(OS)/SubVC/AboutVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/AboutVC.mm',

					'../../source/GoCastTalk/<@(OS)/SubVC/ChangeLanguageVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/ChangeLanguageVC.mm',

					'../../source/GoCastTalk/<@(OS)/SubVC/ChangePasswordVC.h',
					'../../source/GoCastTalk/<@(OS)/SubVC/ChangePasswordVC.mm',

					'../../source/GoCastTalk/<@(OS)/InboxEntryCell.h',
					'../../source/GoCastTalk/<@(OS)/InboxEntryCell.mm',

					'../../source/GoCastTalk/<@(OS)/HeadingSubCell.h',
					'../../source/GoCastTalk/<@(OS)/HeadingSubCell.mm',

					'../../source/GoCastTalk/<@(OS)/CCCell.h',
					'../../source/GoCastTalk/<@(OS)/CCCell.mm',

					'../../source/GoCastTalk/<@(OS)/GoogleAnalytics.h',
					'../../source/GoCastTalk/<@(OS)/GoogleAnalytics.mm',

					'../../third-party/TestFlightSDK3.0.0/TestFlight.h',
					'../../third-party/TestFlightSDK3.0.0/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK3.0.0/TestFlight+ManualSessions.h',

					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleAnalytics/Library/GAI.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleAnalytics/Library/GAIDictionaryBuilder.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleAnalytics/Library/GAIFields.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleAnalytics/Library/GAILogger.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleAnalytics/Library/GAITrackedViewController.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleAnalytics/Library/GAITracker.h',

					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleTagManager/Library/TAGContainer.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleTagManager/Library/TAGContainerOpener.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleTagManager/Library/TAGDataLayer.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleTagManager/Library/TAGLogger.h',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleTagManager/Library/TAGManager.h',

				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/GoCastTalk/<@(OS)/en.lproj/InfoPlist.strings',

					'../../rsrc/GoCastTalk/<@(OS)/MainWindow.xib',

					'../../rsrc/GoCastTalk/<@(OS)/VC/LoginVC.xib',

					'../../rsrc/GoCastTalk/<@(OS)/VC/InboxVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/VC/ContactsVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/VC/SettingsVC.xib',

					'../../rsrc/GoCastTalk/<@(OS)/SubVC/CreateContactVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/EditAllGroupsVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/EditOneGroupVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/EditContactsVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/ContactDetailsVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/MessageHistoryVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/RecordMessageVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/ChangeRegisteredNameVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/GroupViewVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/InboxMessageVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/MessageSentVC.xib',

					'../../rsrc/GoCastTalk/<@(OS)/SubVC/AboutVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/ChangeLanguageVC.xib',
					'../../rsrc/GoCastTalk/<@(OS)/SubVC/ChangePasswordVC.xib',

					'../../rsrc/GoCastTalk/<@(OS)/InboxEntryCell.xib',
					'../../rsrc/GoCastTalk/<@(OS)/HeadingSubCell.xib',
					'../../rsrc/GoCastTalk/<@(OS)/CCCell.xib',

					'../../rsrc/GoCastTalk/<@(OS)/newmessage.wav',

					'../../rsrc/GoCastTalk/<@(OS)/lang.en.json',
					'../../rsrc/GoCastTalk/<@(OS)/lang.ja.json',

					'../../rsrc/GoCastTalk/<@(OS)/nuancelogo.png',

					'../../rsrc/GoCastTalk/<@(OS)/bg-login.en.png',
					'../../rsrc/GoCastTalk/<@(OS)/bg-login.ja.png',
					'../../rsrc/GoCastTalk/<@(OS)/bg-button.png',
					'../../rsrc/GoCastTalk/<@(OS)/bg-throbber.png',

					'../../rsrc/GoCastTalk/<@(OS)/banner.png',
					'../../rsrc/GoCastTalk/<@(OS)/banner2.png',

					'../../rsrc/GoCastTalk/<@(OS)/tab-inbox.png',
					'../../rsrc/GoCastTalk/<@(OS)/tab-newmemo.png',
					'../../rsrc/GoCastTalk/<@(OS)/tab-contacts.png',
					'../../rsrc/GoCastTalk/<@(OS)/tab-settings.png',

					'../../rsrc/GoCastTalk/<@(OS)/icon-receive.en.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon-receive.ja.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon-sent.en.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon-sent.ja.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon-right.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon-check.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon-nocheck.png',

					'../../rsrc/GoCastTalk/<@(OS)/icon-tri-down.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon-tri-right.png',

					'../../rsrc/GoCastTalk/<@(OS)/button-add.png',
					'../../rsrc/GoCastTalk/<@(OS)/button-del.png',

					'../../rsrc/GoCastTalk/<@(OS)/button-pause.png',
					'../../rsrc/GoCastTalk/<@(OS)/button-play.png',
					'../../rsrc/GoCastTalk/<@(OS)/button-record.png',
					'../../rsrc/GoCastTalk/<@(OS)/button-stop.png',

					'../../rsrc/GoCastTalk/<@(OS)/button-pause-white.png',
					'../../rsrc/GoCastTalk/<@(OS)/button-play-white.png',

					'../../rsrc/GoCastTalk/<@(OS)/Icon.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon_29.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon_57.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon_58.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon_80.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon_114.png',
					'../../rsrc/GoCastTalk/<@(OS)/icon_120.png',

					'../../rsrc/GoCastTalk/<@(OS)/Default.png',
					'../../rsrc/GoCastTalk/<@(OS)/Default@2x.png',
					'../../rsrc/GoCastTalk/<@(OS)/Default-568h@2x.png',
				],	# mac_bundle_resources

                'mac_framework_dirs': [
					'../../third-party/DragonMobileSDK_1.4.9',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06',
					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleAnalytics/Library',
# 					'../../third-party/GoogleAnalyticsServicesiOS_3.06/GoogleTagManager/Library',
                ],

				'link_settings': {
					'libraries': [
						'../../third-party/TestFlightSDK3.0.0/libTestFlight.a',
						'libz.dylib',
						'../../third-party/DragonMobileSDK_1.4.9/SpeechKit.framework',
						'../../third-party/GoogleAnalyticsServicesiOS_3.06/libAdIdAccess.a',
						'../../third-party/GoogleAnalyticsServicesiOS_3.06/libGoogleAnalyticsServices.a',
						'libsqlite3.dylib',
						'$(SDKROOT)/System/Library/Frameworks/AddressBook.framework',
						'$(SDKROOT)/System/Library/Frameworks/AddressBookUI.framework',
# 						'$(SDKROOT)/System/Library/Frameworks/AdSupport.framework',
						'$(SDKROOT)/System/Library/Frameworks/AudioToolbox.framework',
						'$(SDKROOT)/System/Library/Frameworks/AVFoundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/CoreData.framework',
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
