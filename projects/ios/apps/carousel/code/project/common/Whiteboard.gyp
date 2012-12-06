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
						'../../source/Whiteboard/Whiteboard.cpp',
						'../../source/Whiteboard/Whiteboard.h',

						'../../source/Whiteboard/package.h',
						'../../source/Whiteboard/tFile.h',
						'../../source/Whiteboard/tFile.mm',
						'../../source/Whiteboard/tInputManager.h',
						'../../source/Whiteboard/tMouseEvent.h',
						'../../source/Whiteboard/tObserver.h',
						'../../source/Whiteboard/tPixelFormat.h',
						'../../source/Whiteboard/tPixelFormat.cpp',
						'../../source/Whiteboard/tProgram.cpp',
						'../../source/Whiteboard/tProgram.h',
						'../../source/Whiteboard/tRect.h',
						'../../source/Whiteboard/tSGView.cpp',
						'../../source/Whiteboard/tSGView.h',
						'../../source/Whiteboard/tShader.cpp',
						'../../source/Whiteboard/tShader.h',
						'../../source/Whiteboard/tSingleton.h',
						'../../source/Whiteboard/tSurface.cpp',
						'../../source/Whiteboard/tSurface.h',
						'../../source/Whiteboard/tSurfacePeer.mm',
						'../../source/Whiteboard/tTexture.cpp',
						'../../source/Whiteboard/tTexture.h',
						'../../source/Whiteboard/tTouchEvent.h',

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
