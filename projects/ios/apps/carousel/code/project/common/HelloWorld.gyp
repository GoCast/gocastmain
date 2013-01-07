{
	'includes': [
		'common.gypi',
	], # includes
    'targets': [
#Basic2D
				{
					'target_name': 'HelloWorld',
					'product_name': 'HelloWorld',
					'type': 'executable',
					'mac_bundle': 1,
					
					'sources': [
						'../../source/Testbed/HelloWorld/AppDelegate.h',
						'../../source/Testbed/HelloWorld/AppDelegate.m',
						'../../source/Testbed/HelloWorld/main.m',
						'../../source/Testbed/HelloWorld/MainViewController.h',
						'../../source/Testbed/HelloWorld/MainViewController.m',

					],	# sources

					'include_dirs': [
						'../../source/Cordova-ios/CordovaLib/build/Release-iphonesimulator/include',
					],  # include_dirs

					'mac_bundle_resources': [
						'../../source/Testbed/HelloWorld/MainViewController.xib',
#						'../../rsrc/www',
#						'../../rsrc/<@(OS)/Cordova.plist',
					],	# mac_bundle_resources

					'xcode_settings': {
						'INFOPLIST_FILE': '../../rsrc/<@(OS)/HelloWorld-Info.plist',
					},	# xcode_settings

					'conditions': [
						['OS=="ios"', {
							'defines': [
								'PLATFORM_IOS=1',
							], #defines
								
							'mac_bundle_resources': [
								'../../rsrc/<@(OS)/en.lproj/InfoPlist.strings',
							],	# mac_bundle_resources
	
							'link_settings': {
								'libraries': [
									'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
									'$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
									'$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework',
									'$(SDKROOT)/System/Library/Frameworks/AddressBook.framework',
									'$(SDKROOT)/System/Library/Frameworks/AddressBookUI.framework',
									'$(SDKROOT)/System/Library/Frameworks/AudioToolbox.framework',
									'$(SDKROOT)/System/Library/Frameworks/AVFoundation.framework',
									'$(SDKROOT)/System/Library/Frameworks/CFNetwork.framework',
									'$(SDKROOT)/System/Library/Frameworks/CoreLocation.framework',
									'$(SDKROOT)/System/Library/Frameworks/MediaPlayer.framework',
									'$(SDKROOT)/System/Library/Frameworks/QuartzCore.framework',
									'$(SDKROOT)/System/Library/Frameworks/SystemConfiguration.framework',
									'$(SDKROOT)/System/Library/Frameworks/MobileCoreServices.framework',
									'$(SDKROOT)/System/Library/Frameworks/CoreMedia.framework',
									'../../source/Cordova-ios/CordovaLib/build/Release-iphonesimulator/libCordova.a',
								],	# libraries
							},	# link_settings
						}],  # OS=="ios"

					],  # conditions
				},


                ],
}
