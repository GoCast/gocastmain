{
	'includes': [
		'common.gypi',
	], # includes
    'targets': [
#Whiteboard
				{
					'target_name': 'Whiteboard',
					'product_name': 'Whiteboard',
					'type': 'executable',
					'mac_bundle': 1,
					
# 					'actions': [
# 						{
# 							'action_name': 'CarouselApp.tgf',
# 							'inputs': [ '../../tgf/Testbed/Whiteboard/CarouselApp.tgf', ], # inputs
# 							'outputs': [ '../../source/Testbed/Whiteboard/CarouselApp.h', ], # outputs
# 							'action': [ '/Volumes/Lab/tools/graphcode', '<@(_inputs)', '--machine', 'CarouselApp', '--include-exit', '--update', '--debug', '--basic-stf', '--libtate', '-o', '<@(_outputs)', ], # action
# 						},
# 					],	# actions

					'sources': [
						'../../source/Testbed/Whiteboard/CarouselApp.mm',
						'../../source/Testbed/Whiteboard/CarouselApp.h',

						'../../source/Testbed/Whiteboard/Spot.mm',
						'../../source/Testbed/Whiteboard/Spot.h',

						'../../source/Testbed/Whiteboard/WhiteboardSpot.mm',
						'../../source/Testbed/Whiteboard/WhiteboardSpot.h',

						'../../source/Testbed/Whiteboard/CallcastEvent.h',
						'../../source/Testbed/Whiteboard/WhiteboardEvent.h',
						'../../source/Testbed/Whiteboard/CallcastManager.h',

						'../../source/Testbed/Whiteboard/GCICallcast.mm',
						'../../source/Testbed/Whiteboard/GCICallcast.h',

						'../../source/Testbed/Whiteboard/<@(OS)/AppDelegate.h',
						'../../source/Testbed/Whiteboard/<@(OS)/AppDelegate.mm',
						'../../source/Testbed/Whiteboard/<@(OS)/ViewController.h',
						'../../source/Testbed/Whiteboard/<@(OS)/ViewController.mm',

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
						'INFOPLIST_FILE': '../../rsrc/<@(OS)/Whiteboard.plist',
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
