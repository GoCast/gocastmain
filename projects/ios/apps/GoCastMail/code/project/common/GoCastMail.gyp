{
	'includes': [
		'common.gypi',
	], # includes

	'targets': [{

		'target_name': 'GoCastMail',
		'product_name': 'GoCastMail',
		'type': 'executable',
		'mac_bundle': 1,

		'defines': [
			'ENGLISH_ONLY=0',
		], #defines

		'actions': [
			{
				'action_name': 'RecordMessageScreen.tgf',
				'inputs': [ '../../tgf/GoCastMail/RecordMessageScreen.tgf', ],
				'outputs': [ '../../dummy', ],
				'action': [ '<@(_graphcode)', '<@(_inputs)', '--machine', 'RecordMessageScreen', '-h', '../../source/GoCastMail/RecordMessageScreen.h', '-cpp', '../../source/GoCastMail/RecordMessageScreen.mm', ],
			},
		],

		'sources': [
			'../../source/GoCastMail/package.h',

			'../../source/GoCastMail/GCTEvent.h',
			'../../source/GoCastMail/GCTEventManager.h',

			'../../source/GoCastMail/RecordMessageScreen.mm',
			'../../source/GoCastMail/RecordMessageScreen.h',
#--
			'../../source/GoCastMail/JSONUtil.mm',
			'../../source/GoCastMail/JSONUtil.h',
			'../../source/GoCastMail/URLLoader.mm',
			'../../source/GoCastMail/URLLoader.h',
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
			'../../source/GoCastMail/<@(OS)',
		 ],  # include_dirs

		'xcode_settings': {
			'TARGETED_DEVICE_FAMILY': '1',
			'INFOPLIST_FILE': '../../rsrc/GoCastMail/<@(OS)/portrait.plist',
		},	# xcode_settings

		'conditions': [
			['OS=="ios"', {
				'sources': [
					'../../source/GoCastMail/<@(OS)/AppDelegate.h',
					'../../source/GoCastMail/<@(OS)/AppDelegate.mm',
					'../../source/Bootstrap/<@(OS)/main.mm',

					'../../source/GoCastMail/<@(OS)/SubVC/RecordMessageVC.h',
					'../../source/GoCastMail/<@(OS)/SubVC/RecordMessageVC.mm',

					'../../source/GoCastMail/<@(OS)/InboxEntryCell.h',
					'../../source/GoCastMail/<@(OS)/InboxEntryCell.mm',

					'../../source/GoCastMail/<@(OS)/HeadingSubCell.h',
					'../../source/GoCastMail/<@(OS)/HeadingSubCell.mm',

					'../../source/GoCastMail/<@(OS)/CCCell.h',
					'../../source/GoCastMail/<@(OS)/CCCell.mm',

					'../../third-party/TestFlightSDK3.0.0/TestFlight.h',
					'../../third-party/TestFlightSDK3.0.0/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK3.0.0/TestFlight+ManualSessions.h',

				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/GoCastMail/<@(OS)/en.lproj/InfoPlist.strings',

					'../../rsrc/GoCastMail/<@(OS)/MainWindow.xib',


					'../../rsrc/GoCastMail/<@(OS)/SubVC/RecordMessageVC.xib',

					'../../rsrc/GoCastMail/<@(OS)/InboxEntryCell.xib',
					'../../rsrc/GoCastMail/<@(OS)/HeadingSubCell.xib',
					'../../rsrc/GoCastMail/<@(OS)/CCCell.xib',

					'../../rsrc/GoCastMail/<@(OS)/newmessage.wav',

					'../../rsrc/GoCastMail/<@(OS)/begin_record.caf',
					'../../rsrc/GoCastMail/<@(OS)/end_record.caf',

					'../../rsrc/GoCastMail/<@(OS)/nuancelogo.png',

					'../../rsrc/GoCastMail/<@(OS)/bg-login.en.png',
					'../../rsrc/GoCastMail/<@(OS)/bg-login.ja.png',
					'../../rsrc/GoCastMail/<@(OS)/bg-button.png',
					'../../rsrc/GoCastMail/<@(OS)/bg-throbber.png',

					'../../rsrc/GoCastMail/<@(OS)/banner.png',
					'../../rsrc/GoCastMail/<@(OS)/banner2.png',

					'../../rsrc/GoCastMail/<@(OS)/tab-inbox.png',
					'../../rsrc/GoCastMail/<@(OS)/tab-newmemo.png',
					'../../rsrc/GoCastMail/<@(OS)/tab-contacts.png',
					'../../rsrc/GoCastMail/<@(OS)/tab-settings.png',

					'../../rsrc/GoCastMail/<@(OS)/icon-receive.en.png',
					'../../rsrc/GoCastMail/<@(OS)/icon-receive.ja.png',
					'../../rsrc/GoCastMail/<@(OS)/icon-sent.en.png',
					'../../rsrc/GoCastMail/<@(OS)/icon-sent.ja.png',
					'../../rsrc/GoCastMail/<@(OS)/icon-right.png',
					'../../rsrc/GoCastMail/<@(OS)/icon-check.png',
					'../../rsrc/GoCastMail/<@(OS)/icon-nocheck.png',

					'../../rsrc/GoCastMail/<@(OS)/icon-tri-down.png',
					'../../rsrc/GoCastMail/<@(OS)/icon-tri-right.png',

					'../../rsrc/GoCastMail/<@(OS)/button-add.png',
					'../../rsrc/GoCastMail/<@(OS)/button-del.png',

					'../../rsrc/GoCastMail/<@(OS)/button-pause.png',
					'../../rsrc/GoCastMail/<@(OS)/button-play.png',
					'../../rsrc/GoCastMail/<@(OS)/button-record.png',
					'../../rsrc/GoCastMail/<@(OS)/button-stop.png',

					'../../rsrc/GoCastMail/<@(OS)/button-pause-white.png',
					'../../rsrc/GoCastMail/<@(OS)/button-play-white.png',

					'../../rsrc/GoCastMail/<@(OS)/Icon.png',
					'../../rsrc/GoCastMail/<@(OS)/icon_29.png',
					'../../rsrc/GoCastMail/<@(OS)/icon_57.png',
					'../../rsrc/GoCastMail/<@(OS)/icon_58.png',
					'../../rsrc/GoCastMail/<@(OS)/icon_80.png',
					'../../rsrc/GoCastMail/<@(OS)/icon_114.png',
					'../../rsrc/GoCastMail/<@(OS)/icon_120.png',

					'../../rsrc/GoCastMail/<@(OS)/Default.png',
					'../../rsrc/GoCastMail/<@(OS)/Default@2x.png',
					'../../rsrc/GoCastMail/<@(OS)/Default-568h@2x.png',
				],	# mac_bundle_resources

                'mac_framework_dirs': [
					'../../third-party/DragonMobileSDK_1.4.9',
                ],

				'link_settings': {
					'libraries': [
						'../../third-party/TestFlightSDK3.0.0/libTestFlight.a',
						'libz.dylib',
						'../../third-party/DragonMobileSDK_1.4.9/SpeechKit.framework',
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
