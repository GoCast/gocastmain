# Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
#
# Use of this source code is governed by a BSD-style license
# that can be found in the LICENSE file in the root of the source
# tree. An additional intellectual property rights grant can be found
# in the file PATENTS.  All contributing project authors may
# be found in the AUTHORS file in the root of the source tree.

{
  'includes': [
    '../deps/webrtc/trunk/src/build/common.gypi',
  ],
  'targets': [
    {
      'target_name': 'peerconnection_server',
      'type': 'executable',
      'sources': [
        '../deps/webrtc/trunk/peerconnection/samples/server/data_socket.cc',
        '../deps/webrtc/trunk/peerconnection/samples/server/data_socket.h',
        '../deps/webrtc/trunk/peerconnection/samples/server/main.cc',
        '../deps/webrtc/trunk/peerconnection/samples/server/peer_channel.cc',
        '../deps/webrtc/trunk/peerconnection/samples/server/peer_channel.h',
        '../deps/webrtc/trunk/peerconnection/samples/server/utils.cc',
        '../deps/webrtc/trunk/peerconnection/samples/server/utils.h',
      ],
    },
  ],
  'conditions': [
      ['OS=="linux"', {
          'targets': [
          {
            'target_name': 'stubby1',
            'type': 'executable',
            'sources': [
                'main.cpp',
                'parsecmd.cpp',
                'shell.cpp',
                'shell.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.cpp',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.cpp',
                'TestDefaults.h',
                'TestDefaults.cpp',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.h',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.cpp',
                'TestClientShell.h',
                'include/ThreadSingle.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.cpp',
                'js_api/projects/WebrtcPlugin/WPLCall.h',
                'js_api/projects/WebrtcPlugin/WPLCall.cpp',
                'include/rtc_common.h',
                'include/anyoption/anyoption.h',
                'include/anyoption/anyoption.cpp',
            ],
           'dependencies': [
                '../deps/webrtc/trunk/third_party_mods/libjingle/libjingle.gyp:libjingle_app',
            ],
            'include_dirs': [
                '../deps/webrtc/trunk/third_party/libjingle/source',
                '../deps/webrtc/trunk/third_party_mods/libjingle/source',
		'include',
		'js_api/projects/WebrtcPlugin'
            ],
		'link_settings': {
			'libraries': [
				'-lX11',
				'-lXext',
			],
		},
         },        
          {
	# Now for the version which doesn't use gyp's monster deps, but instead links the monolithic libwebrtc.a
            'target_name': 'stubby1_monolithic',
            'type': 'executable',
            'sources': [
                'main.cpp',
                'parsecmd.cpp',
                'shell.cpp',
                'shell.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.cpp',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.cpp',
                'TestDefaults.h',
                'TestDefaults.cpp',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.h',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.cpp',
                'TestClientShell.h',
                'include/ThreadSingle.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.cpp',
                'js_api/projects/WebrtcPlugin/WPLCall.h',
                'js_api/projects/WebrtcPlugin/WPLCall.cpp',
                'include/rtc_common.h',
                'include/anyoption/anyoption.h',
                'include/anyoption/anyoption.cpp',
            ],
		'defines': [
			'POSIX',
			'WEBRTC_LINUX',
		],
            'include_dirs': [
                '../deps/webrtc/trunk/third_party/libjingle/source',
                '../deps/webrtc/trunk/third_party_mods/libjingle/source',
		'include',
		'js_api/projects/WebrtcPlugin',
            ],
		'link_settings': {
			'libraries': [
# TODO - use _Release here if release build.
				'../deps/webrtc/trunk/out/Release/libwebrtc_Release.a',
				'-lexpat',
				'-lX11',
				'-lXext',
				'-ldl',
				'-lrt',
				'-lpthread',
				'-lGL',
			],
		},
          }, 
	], #targets
      }, ], #OS=="linux"
      ['OS=="mac"', {
        'targets': [
        {
            'target_name': 'stubby1',
            'type': 'executable',
            'sources': [
                'main.cpp',
                'parsecmd.cpp',
                'shell.cpp',
                'shell.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.cpp',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.cpp',
                'TestDefaults.h',
                'TestDefaults.cpp',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.h',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.cpp',
                'TestClientShell.h',
                'include/ThreadSingle.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.cpp',
                'js_api/projects/WebrtcPlugin/WPLCall.h',
                'js_api/projects/WebrtcPlugin/WPLCall.cpp',
                'include/rtc_common.h',
                'include/anyoption/anyoption.h',
                'include/anyoption/anyoption.cpp',
            ],
            'dependencies': [
                '../deps/webrtc/trunk/third_party_mods/libjingle/libjingle.gyp:libjingle_app',
            ],
            'include_dirs': [
                '../deps/webrtc/trunk/third_party/libjingle/source',
                '../deps/webrtc/trunk/third_party_mods/libjingle/source',
		'include',
		'js_api/projects/WebrtcPlugin'
            ],
            'link_settings': {
                'xcode_settings': {
                  'OTHER_LDFLAGS': [
                    '-L../deps/webrtc/trunk/third_party/libsrtp',
                    '-lsrtp',
                    '-framework CoreServices',
                    '-framework CoreAudio',
                    '-framework CoreVideo',
                    '-framework QtKit',
                    '-framework OpenGL',
                    '-framework AudioToolbox',
                    '-framework ApplicationServices',
                    '-framework Foundation',
                    '-framework AppKit',
                  ],
                },
            },
        }, 
# Now for the monolithic version - links to the libwebrtc_Debug.a big library.
        {
            'target_name': 'stubby1_monolithic',
            'type': 'executable',
            'sources': [
                'main.cpp',
                'parsecmd.cpp',
                'shell.cpp',
                'shell.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionClient.cpp',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.h',
                'js_api/projects/WebrtcPlugin/WPLPeerConnectionObserver.cpp',
                'TestDefaults.h',
                'TestDefaults.cpp',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.h',
                'js_api/projects/WebrtcPlugin/WPLSocketServer.cpp',
                'TestClientShell.h',
                'include/ThreadSingle.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.h',
                'js_api/projects/WebrtcPlugin/WPLThreadSafeMessageQueue.cpp',
                'js_api/projects/WebrtcPlugin/WPLCall.h',
                'js_api/projects/WebrtcPlugin/WPLCall.cpp',
                'include/rtc_common.h',
                'include/anyoption/anyoption.h',
                'include/anyoption/anyoption.cpp',
            ],
		'defines': [
			'POSIX',
			'WEBRTC_MAC',
		],
            'include_dirs': [
                '../deps/webrtc/trunk/third_party/libjingle/source',
                '../deps/webrtc/trunk/third_party_mods/libjingle/source',
		'include',
		'js_api/projects/WebrtcPlugin'
            ],
            'link_settings': {
                'xcode_settings': {
                  'OTHER_LDFLAGS': [
                    '-L../deps/webrtc/trunk/third_party/libsrtp',
			'-L../deps/webrtc/trunk/xcodebuild/Debug',
# TODO - use _Release here if release build.
			'-lwebrtc_Debug',
			'-ldl',
			'-lpthread',
                    '-lsrtp',
                    '-framework CoreServices',
                    '-framework CoreAudio',
                    '-framework CoreVideo',
                    '-framework QtKit',
                    '-framework OpenGL',
                    '-framework AudioToolbox',
                    '-framework ApplicationServices',
                    '-framework Foundation',
                    '-framework AppKit',
                  ],
                },
            },
        }, 
	], #targets
      }, ] #OS=="mac"
  ], #conditions
}
