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
					
					'sources': [
						'../../source/Testbed/Whiteboard/Whiteboard.cpp',
						'../../source/Testbed/Whiteboard/Whiteboard.h',

						'../../source/Testbed/Whiteboard/GCIWhiteboard.mm',
						'../../source/Testbed/Whiteboard/GCIWhiteboard.h',

						'../../source/Base/package.h',
						'../../source/Base/tObserver.h',
						'../../source/Base/tSingleton.h',
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
							],	# mac_bundle_resources
	
							'link_settings': {
								'libraries': [
									'../../third-party/CordovaLib/lib/simulator/debug/libCordova.a',
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
