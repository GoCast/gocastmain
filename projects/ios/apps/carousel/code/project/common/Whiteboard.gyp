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
					
					'actions': [
						{
							'action_name': 'AppFlow.tgf',
							'inputs': [ '../../tgf/Testbed/Whiteboard/AppFlow.tgf', ], # inputs
							'outputs': [ '../../source/Testbed/Whiteboard/AppFlow.h', ], # outputs
							'action': [ '/Volumes/Lab/tools/graphcode', '<@(_inputs)', '--machine', 'AppFlow', '--include-exit', '--update', '--debug', '--basic-stf', '--libtate', '-o', '<@(_outputs)', ], # action
						},
					],	# actions

					'sources': [
						'../../source/Testbed/Whiteboard/AppFlow.mm',
						'../../source/Testbed/Whiteboard/AppFlow.h',

						'../../source/Testbed/Whiteboard/LoginView.mm',
						'../../source/Testbed/Whiteboard/LoginView.h',

						'../../source/Testbed/Whiteboard/Whiteboard.mm',
						'../../source/Testbed/Whiteboard/Whiteboard.h',

						'../../source/Testbed/Whiteboard/CallcastEvent.h',
						'../../source/Testbed/Whiteboard/CallcastManager.h',

						'../../source/Testbed/Whiteboard/GCICallcast.mm',
						'../../source/Testbed/Whiteboard/GCICallcast.h',

						'../../source/Base/package.h',
						'../../source/Base/tObserver.h',
						'../../source/Base/tSingleton.h',
						'../../source/Base/tTimer.cpp',
						'../../source/Base/tTimer.h',
						'../../source/Base/<@(OS)/tTimerPeer.mm',
						'../../source/Base/<@(OS)/tTimerPeer.h',

						'../../source/Input/package.h',
						'../../source/Input/tInputManager.h',
						'../../source/Input/tMouseEvent.h',
						'../../source/Input/tTouchEvent.h',
						'../../source/Io/package.h',
						'../../source/Io/tFile.h',
						'../../source/Io/<@(OS)/tFile.mm',
						'../../source/Math/package.h',
						'../../source/Math/tRect.h',
						'../../source/OpenGL/package.h',
						'../../source/OpenGL/tPixelFormat.h',
						'../../source/OpenGL/tPixelFormat.cpp',
						'../../source/OpenGL/tProgram.cpp',
						'../../source/OpenGL/tProgram.h',
						'../../source/OpenGL/tSGView.cpp',
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
						'../../rsrc/<@(OS)/GoToken.png',
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
								'../../source/Bootstrap/<@(OS)/AppDelegate.h',
								'../../source/Bootstrap/<@(OS)/AppDelegate.mm',
								'../../source/Bootstrap/<@(OS)/main.mm',
								'../../source/Bootstrap/<@(OS)/ViewController.h',
								'../../source/Bootstrap/<@(OS)/ViewController.mm',
							],	# sources
	
							'mac_bundle_resources': [
								'../../rsrc/<@(OS)/en.lproj/InfoPlist.strings',
								'../../rsrc/<@(OS)/en.lproj/MainViewController.xib',
								'../../rsrc/<@(OS)/en.lproj/LoginView.xib',
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
