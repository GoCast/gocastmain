{
	'includes': [
		'common.gypi',
	], # includes
    'targets': [
#Basic2D
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
						'../../source/Io/mac/tFile.mm',
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
						'../../source/OpenGL/mac/tSurfacePeer.mm',
						'../../source/OpenGL/tTexture.cpp',
						'../../source/OpenGL/tTexture.h',

						'../../source/Bootstrap/mac/MacOpenGLView.mm',
						'../../source/Bootstrap/mac/MacOpenGLView.h',
						'../../source/Bootstrap/mac/main.mm',
						'../../source/Bootstrap/mac/MacWindow.mm',
						'../../source/Bootstrap/mac/MacWindow.h',
						'../../source/Bootstrap/mac/MacApplication.mm',
						'../../source/Bootstrap/mac/MacApplication.h',
					],	# sources
					'mac_bundle_resources': [
						'../../rsrc/common/spritesheet.frag',
						'../../rsrc/common/spritesheet.vert',

						'../../rsrc/mac/English.lproj/InfoPlist.strings',
						'../../rsrc/mac/Credits.rtf',
						'../../rsrc/mac/iPhoneStyle.xib',
					],	# mac_bundle_resources

					'link_settings': {
						'libraries': [
							'$(SDKROOT)/System/Library/Frameworks/Cocoa.framework',
							'$(SDKROOT)/System/Library/Frameworks/CoreVideo.framework',
							'$(SDKROOT)/System/Library/Frameworks/OpenGL.framework',
						],	# libraries
					},	# link_settings
					'xcode_settings': {
						'INFOPLIST_FILE': '../../rsrc/mac/Whiteboard.plist',
					},	# xcode_settings
				},


                ],
}
