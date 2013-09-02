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
			'../../third-party/webrtc/include/objc',
			'../../third-party/webrtc/include/objc/public',
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

					'../../third-party/webrtc/include/objc/RTCAudioTrack+Internal.h',
					'../../third-party/webrtc/include/objc/RTCEnumConverter.h',
					'../../third-party/webrtc/include/objc/RTCICECandidate+Internal.h',
					'../../third-party/webrtc/include/objc/RTCICEServer+Internal.h',
					'../../third-party/webrtc/include/objc/RTCMediaConstraints+Internal.h',
					'../../third-party/webrtc/include/objc/RTCMediaConstraintsNative.h',
					'../../third-party/webrtc/include/objc/RTCMediaSource+Internal.h',
					'../../third-party/webrtc/include/objc/RTCMediaStream+Internal.h',
					'../../third-party/webrtc/include/objc/RTCMediaStreamTrack+Internal.h',
					'../../third-party/webrtc/include/objc/RTCPeerConnection+Internal.h',
					'../../third-party/webrtc/include/objc/RTCPeerConnectionObserver.h',
					'../../third-party/webrtc/include/objc/RTCSessionDescription+Internal.h',
					'../../third-party/webrtc/include/objc/RTCVideoCapturer+Internal.h',
					'../../third-party/webrtc/include/objc/RTCVideoRenderer+Internal.h',
					'../../third-party/webrtc/include/objc/RTCVideoSource+Internal.h',
					'../../third-party/webrtc/include/objc/RTCVideoTrack+Internal.h',

					'../../third-party/webrtc/include/objc/public/RTCAudioSource.h',
					'../../third-party/webrtc/include/objc/public/RTCAudioTrack.h',
					'../../third-party/webrtc/include/objc/public/RTCI420Frame.h',
					'../../third-party/webrtc/include/objc/public/RTCICECandidate.h',
					'../../third-party/webrtc/include/objc/public/RTCICEServer.h',
					'../../third-party/webrtc/include/objc/public/RTCMediaConstraints.h',
					'../../third-party/webrtc/include/objc/public/RTCMediaSource.h',
					'../../third-party/webrtc/include/objc/public/RTCMediaStream.h',
					'../../third-party/webrtc/include/objc/public/RTCMediaStreamTrack.h',
					'../../third-party/webrtc/include/objc/public/RTCPair.h',
					'../../third-party/webrtc/include/objc/public/RTCPeerConnection.h',
					'../../third-party/webrtc/include/objc/public/RTCPeerConnectionDelegate.h',
					'../../third-party/webrtc/include/objc/public/RTCPeerConnectionFactory.h',
					'../../third-party/webrtc/include/objc/public/RTCSessionDescription.h',
					'../../third-party/webrtc/include/objc/public/RTCSessionDescriptonDelegate.h',
					'../../third-party/webrtc/include/objc/public/RTCTypes.h',
					'../../third-party/webrtc/include/objc/public/RTCVideoCapturer.h',
					'../../third-party/webrtc/include/objc/public/RTCVideoRenderer.h',
					'../../third-party/webrtc/include/objc/public/RTCVideoRendererDelegate.h',
					'../../third-party/webrtc/include/objc/public/RTCVideoSource.h',
					'../../third-party/webrtc/include/objc/public/RTCVideoTrack.h',

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

						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libCNG.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libG711.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libG722.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libNetEq.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libPCM16B.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libaudio_coding_module.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libaudio_conference_mixer.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libaudio_device.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libaudio_processing.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libaudio_processing_sse2.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libbitrate_controller.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libcommon_audio.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libcommon_audio_sse2.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libcommon_video.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libcrnspr.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libcrnss.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libcrnssckbi.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libcrssl.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libexpat.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libiLBC.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libiSAC.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libiSACFix.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libicudata.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libicui18n.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libicuuc.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libjingle.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libjingle_media.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libjingle_p2p.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libjingle_peerconnection.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libjingle_peerconnection_objc.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libjingle_sound.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libjsoncpp.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libmedia_file.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libnss_static.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libopus.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libpaced_sender.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/librbe_components.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libremote_bitrate_estimator.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/librtp_rtcp.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libsqlite_regexp.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libsrtp.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libsystem_wrappers.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvideo_capture_module.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvideo_coding_utility.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvideo_engine_core.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvideo_processing.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvideo_processing_sse2.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvideo_render_module.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvoice_engine.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvpx.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvpx_asm_offsets_vp8.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvpx_intrinsics_mmx.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvpx_intrinsics_sse2.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libvpx_intrinsics_ssse3.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libwebrtc_i420.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libwebrtc_opus.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libwebrtc_utility.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libwebrtc_video_coding.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libwebrtc_vp8.a',
						'../../third-party/webrtc/lib/$(CURRENT_ARCH)/$(CONFIGURATION)/libyuv.a',
						'libstdc++.dylib',
						'libsqlite3.dylib',
						'$(SDKROOT)/System/Library/Frameworks/CoreAudio.framework',

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
