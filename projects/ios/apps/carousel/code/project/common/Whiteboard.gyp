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

					'mac_bundle_resources': [
						'../../rsrc/<@(OS)/spritesheet.frag',
						'../../rsrc/<@(OS)/spritesheet.vert',
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
								'../../rsrc/<@(OS)/en.lproj/MainWindow.xib',
							],	# mac_bundle_resources
	
							'link_settings': {
								'libraries': [
									'$(SDKROOT)/System/Library/Frameworks/UIKit.framework',
									'$(SDKROOT)/System/Library/Frameworks/Foundation.framework',
									'$(SDKROOT)/System/Library/Frameworks/CoreGraphics.framework',
									'$(SDKROOT)/System/Library/Frameworks/QuartzCore.framework',
									'$(SDKROOT)/System/Library/Frameworks/OpenGLES.framework',
								],	# libraries
							},	# link_settings
						}],  # OS=="ios"

					],  # conditions
				},


                ],
}
