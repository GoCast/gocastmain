{
	'includes': [
		'common.gypi',
	], # includes

	'targets': [{

		'target_name': 'AudioDemo',
		'product_name': 'AudioDemo',
		'type': 'executable',
		'mac_bundle': 1,

		'actions': [
		{
			'action_name': 'AudioDemo.tgf',
			'inputs': [ '../../tgf/Testbed/AudioDemo/AudioDemo.tgf', ], # inputs
			'outputs': [ '../../dummy', ], # outputs
			'action': [ '<@(_graphcode)', '<@(_inputs)',  '--force-update', '--machine', 'AudioDemo', '-h', '../../source/Testbed/AudioDemo/AudioDemo.h', '-cpp', '../../source/Testbed/AudioDemo/AudioDemo.mm', ], # action
		},
		],

		'sources': [
			'../../source/Testbed/AudioDemo/AudioDemo.mm',
			'../../source/Testbed/AudioDemo/AudioDemo.h',

			'../../source/Testbed/AudioDemo/HUDEvent.h',
			'../../source/Testbed/AudioDemo/HUDEventManager.h',

			'../../source/Testbed/AudioDemo/GCICallcast.mm',
			'../../source/Testbed/AudioDemo/GCICallcast.h',

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
			'../../third-party/CordovaLib/include',
		],  # include_dirs

		'xcode_settings': {
			'TARGETED_DEVICE_FAMILY': '1',
			'INFOPLIST_FILE': '../../rsrc/<@(OS)/portrait.plist',
		},	# xcode_settings

		'conditions': [
			['OS=="ios"', {
				'sources': [
					'../../source/Testbed/AudioDemo/<@(OS)/AppDelegate.h',
					'../../source/Testbed/AudioDemo/<@(OS)/AppDelegate.mm',
					'../../source/Bootstrap/<@(OS)/main.mm',
					'../../source/Testbed/AudioDemo/<@(OS)/ViewController.h',
					'../../source/Testbed/AudioDemo/<@(OS)/ViewController.mm',

					'../../third-party/TestFlightSDK2.0.0/TestFlight.h',
					'../../third-party/TestFlightSDK2.0.0/TestFlight+AsyncLogging.h',
					'../../third-party/TestFlightSDK2.0.0/TestFlight+ManualSessions.h',

					'../../third-party/CordovaLib/include/Cordova/CDV.h',
					'../../third-party/CordovaLib/include/Cordova/CDVAccelerometer.h',
					'../../third-party/CordovaLib/include/Cordova/CDVAvailability.h',
					'../../third-party/CordovaLib/include/Cordova/CDVBattery.h',
					'../../third-party/CordovaLib/include/Cordova/CDVCamera.h',
					'../../third-party/CordovaLib/include/Cordova/CDVCapture.h',
					'../../third-party/CordovaLib/include/Cordova/CDVCommandDelegate.h',
					'../../third-party/CordovaLib/include/Cordova/CDVConnection.h',
					'../../third-party/CordovaLib/include/Cordova/CDVContact.h',
					'../../third-party/CordovaLib/include/Cordova/CDVContacts.h',
					'../../third-party/CordovaLib/include/Cordova/CDVCordovaView.h',
					'../../third-party/CordovaLib/include/Cordova/CDVDebug.h',
					'../../third-party/CordovaLib/include/Cordova/CDVDebugConsole.h',
					'../../third-party/CordovaLib/include/Cordova/CDVDevice.h',
					'../../third-party/CordovaLib/include/Cordova/CDVFile.h',
					'../../third-party/CordovaLib/include/Cordova/CDVFileTransfer.h',
					'../../third-party/CordovaLib/include/Cordova/CDVInvokedUrlCommand.h',
					'../../third-party/CordovaLib/include/Cordova/CDVLocalStorage.h',
					'../../third-party/CordovaLib/include/Cordova/CDVLocation.h',
					'../../third-party/CordovaLib/include/Cordova/CDVLogger.h',
					'../../third-party/CordovaLib/include/Cordova/CDVNotification.h',
					'../../third-party/CordovaLib/include/Cordova/CDVPlugin.h',
					'../../third-party/CordovaLib/include/Cordova/CDVPluginResult.h',
					'../../third-party/CordovaLib/include/Cordova/CDVReachability.h',
					'../../third-party/CordovaLib/include/Cordova/CDVSound.h',
					'../../third-party/CordovaLib/include/Cordova/CDVSplashScreen.h',
					'../../third-party/CordovaLib/include/Cordova/CDVURLProtocol.h',
					'../../third-party/CordovaLib/include/Cordova/CDVViewController.h',
					'../../third-party/CordovaLib/include/Cordova/CDVWhitelist.h',
					'../../third-party/CordovaLib/include/Cordova/JSONKit.h',
					'../../third-party/CordovaLib/include/Cordova/NSArray+Comparisons.h',
					'../../third-party/CordovaLib/include/Cordova/NSData+Base64.h',
					'../../third-party/CordovaLib/include/Cordova/NSDictionary+Extensions.h',
					'../../third-party/CordovaLib/include/Cordova/NSMutableArray+QueueAdditions.h',
					'../../third-party/CordovaLib/include/Cordova/UIDevice+Extensions.h',
				],	# sources

				'mac_bundle_resources': [
					'../../rsrc/Testbed/AudioDemo/<@(OS)/en.lproj/InfoPlist.strings',
					'../../rsrc/Testbed/AudioDemo/<@(OS)/en.lproj/MainViewController.xib',

					'../../rsrc/Testbed/AudioDemo/<@(OS)/Icon.png',

					'../../rsrc/Testbed/AudioDemo/<@(OS)/Default.png',
					'../../rsrc/Testbed/AudioDemo/<@(OS)/Default-568h@2x.png',

					'../../rsrc/Testbed/AudioDemo/<@(OS)/Cordova.plist',
					'../../rsrc/Testbed/AudioDemo/www',
				],	# mac_bundle_resources

				'link_settings': {
					'libraries': [
						'../../third-party/TestFlightSDK2.0.0/libTestFlight.a',
						'../../third-party/CordovaLib/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libCordova.a',
						'libz.dylib',
						'$(SDKROOT)/System/Library/Frameworks/AVFoundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
						'$(SDKROOT)/System/Library/Frameworks/MessageUI.framework',
						'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
						'$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework',
						'$(SDKROOT)/System/Library/Frameworks/QuartzCore.framework',

						'$(SDKROOT)/System/Library/Frameworks/AddressBook.framework',
						'$(SDKROOT)/System/Library/Frameworks/AddressBookUI.framework',
						'$(SDKROOT)/System/Library/Frameworks/AudioToolbox.framework',
						'$(SDKROOT)/System/Library/Frameworks/CFNetwork.framework',
						'$(SDKROOT)/System/Library/Frameworks/CoreLocation.framework',
						'$(SDKROOT)/System/Library/Frameworks/MediaPlayer.framework',
						'$(SDKROOT)/System/Library/Frameworks/SystemConfiguration.framework',
						'$(SDKROOT)/System/Library/Frameworks/MobileCoreServices.framework',
						'$(SDKROOT)/System/Library/Frameworks/CoreMedia.framework',
					],	# libraries
				},	# link_settings
			}],  # OS=="ios"

		],  # conditions

	}],  # targets
}
