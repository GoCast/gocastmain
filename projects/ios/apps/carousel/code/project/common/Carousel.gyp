{
	'includes': [
		'common.gypi',
	], # includes
    'targets': [
#Whiteboard
				{
					'target_name': 'Carousel',
					'product_name': 'Carousel',
					'type': 'executable',
					'mac_bundle': 1,
					
# 					'actions': [
# 						{
# 							'action_name': 'CarouselApp.tgf',
# 							'inputs': [ '../../tgf/Testbed/Carousel/CarouselApp.tgf', ], # inputs
# 							'outputs': [ '../../source/Testbed/Carousel/CarouselApp.h', ], # outputs
# 							'action': [ '/Volumes/Lab/tools/graphcode', '<@(_inputs)', '--machine', 'CarouselApp', '--include-exit', '--update', '--debug', '--basic-stf', '--libtate', '-o', '<@(_outputs)', ], # action
# 						},
# 					],	# actions

					'sources': [
						'../../source/Testbed/Carousel/CarouselApp.mm',
						'../../source/Testbed/Carousel/CarouselApp.h',

						'../../source/Testbed/Carousel/Spot.mm',
						'../../source/Testbed/Carousel/Spot.h',

						'../../source/Testbed/Carousel/WhiteboardSpot.mm',
						'../../source/Testbed/Carousel/WhiteboardSpot.h',

						'../../source/Testbed/Carousel/CallcastEvent.h',
						'../../source/Testbed/Carousel/WhiteboardEvent.h',
						'../../source/Testbed/Carousel/CarouselEventManager.h',

						'../../source/Testbed/Carousel/GCICallcast.mm',
						'../../source/Testbed/Carousel/GCICallcast.h',

						'../../source/Testbed/Carousel/<@(OS)/AppDelegate.h',
						'../../source/Testbed/Carousel/<@(OS)/AppDelegate.mm',
						'../../source/Testbed/Carousel/<@(OS)/ViewController.h',
						'../../source/Testbed/Carousel/<@(OS)/ViewController.mm',

						'../../source/Testbed/Carousel/<@(OS)/AbstractActionSheetPicker.h',
						'../../source/Testbed/Carousel/<@(OS)/AbstractActionSheetPicker.m',
						'../../source/Testbed/Carousel/<@(OS)/ActionSheetStringPicker.h',
						'../../source/Testbed/Carousel/<@(OS)/ActionSheetStringPicker.m',

						'../../source/Base/package.h',
						'../../source/Base/tObserver.h',
						'../../source/Base/tSingleton.h',
						'../../source/Base/tTimer.cpp',
						'../../source/Base/tTimer.h',
						'../../source/Base/<@(OS)/tTimerPeer.mm',
						'../../source/Base/<@(OS)/tTimerPeer.h',

						'../../source/Input/package.h',
						'../../source/Input/tInputManager.h',
						'../../source/Input/tTouchEvent.h',
						'../../source/Io/package.h',
						'../../source/Io/tFile.h',
						'../../source/Io/<@(OS)/tFile.mm',
						'../../source/Math/package.h',
						'../../source/OpenGL/package.h',
						'../../source/OpenGL/tPixelFormat.h',
						'../../source/OpenGL/tPixelFormat.cpp',
						'../../source/OpenGL/tProgram.cpp',
						'../../source/OpenGL/tProgram.h',
						'../../source/OpenGL/tSGView.h',
						'../../source/OpenGL/tShader.cpp',
						'../../source/OpenGL/tShader.h',
						'../../source/OpenGL/tSurface.cpp',
						'../../source/OpenGL/tSurface.h',
						'../../source/OpenGL/<@(OS)/tSurfacePeer.mm',
						'../../source/OpenGL/tTexture.cpp',
						'../../source/OpenGL/tTexture.h',

					],	# sources

					'include_dirs': [
						'../../third-party/CordovaLib/include',
					], # include_dirs

					'mac_bundle_resources': [
						'../../rsrc/<@(OS)/Default.png',
						'../../rsrc/<@(OS)/Default@2x.png',
						'../../rsrc/<@(OS)/Default-568h@2x.png',
						'../../rsrc/<@(OS)/GoToken-114.png',
						'../../rsrc/<@(OS)/GoToken-57.png',
						'../../rsrc/<@(OS)/GoToken.png',
						'../../rsrc/<@(OS)/carouselarrowleft.png',
						'../../rsrc/<@(OS)/carouselarrowright.png',
						'../../rsrc/<@(OS)/10px.png',
						'../../rsrc/<@(OS)/1px.png',
						'../../rsrc/<@(OS)/3px.png',
						'../../rsrc/<@(OS)/5px.png',
						'../../rsrc/<@(OS)/colorblack.png',
						'../../rsrc/<@(OS)/colorblue.png',
						'../../rsrc/<@(OS)/colororange.png',
						'../../rsrc/<@(OS)/colorred.png',
						'../../rsrc/<@(OS)/eraser.png',
						'../../rsrc/<@(OS)/spritesheet.frag',
						'../../rsrc/<@(OS)/spritesheet.vert',
						'../../rsrc/<@(OS)/Cordova.plist',
						'../../rsrc/www',
					],	# mac_bundle_resources

					'xcode_settings': {
						'INFOPLIST_FILE': '../../rsrc/<@(OS)/Carousel.plist',
					},	# xcode_settings

					'conditions': [
						['OS=="ios"', {
							'defines': [
								'PLATFORM_IOS=1',
							], #defines
							
							'sources': [
								'../../source/Bootstrap/<@(OS)/OpenGLView.mm',
								'../../source/Bootstrap/<@(OS)/OpenGLView.h',
								'../../source/Bootstrap/<@(OS)/main.mm',
							],	# sources
	
							'mac_bundle_resources': [
								'../../rsrc/<@(OS)/en.lproj/InfoPlist.strings',
								'../../rsrc/<@(OS)/en.lproj/MainViewController.xib',
							],	# mac_bundle_resources
	
							'link_settings': {
								'libraries': [
									'../../third-party/CordovaLib/lib/$(CURRENT_ARCH)/debug/libCordova.a',
									'$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
									'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
									'$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework',
									'$(SDKROOT)/System/Library/Frameworks/QuartzCore.framework',
									'$(SDKROOT)/System/Library/Frameworks/OpenGLES.framework',

									'$(SDKROOT)/System/Library/Frameworks/AddressBook.framework',
									'$(SDKROOT)/System/Library/Frameworks/AddressBookUI.framework',
									'$(SDKROOT)/System/Library/Frameworks/AudioToolbox.framework',
									'$(SDKROOT)/System/Library/Frameworks/AVFoundation.framework',
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
				},


                ],
}
