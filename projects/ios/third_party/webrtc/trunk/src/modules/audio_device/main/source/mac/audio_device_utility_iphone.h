/*
 *  Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

#ifndef WEBRTC_AUDIO_DEVICE_AUDIO_DEVICE_UTILITY_IPHONE_H
#define WEBRTC_AUDIO_DEVICE_AUDIO_DEVICE_UTILITY_IPHONE_H

#include "audio_device_utility.h"
#include "audio_device.h"

namespace webrtc
{
class CriticalSectionWrapper;

class AudioDeviceUtilityIPhone: public AudioDeviceUtility
{
public:
    AudioDeviceUtilityIPhone(const WebRtc_Word32 id);
    AudioDeviceUtilityIPhone();
    virtual ~AudioDeviceUtilityIPhone();

    virtual WebRtc_Word32 Init();

private:
    CriticalSectionWrapper& _critSect;
    WebRtc_Word32 _id;
    AudioDeviceModule::ErrorCode _lastError;
};

} //  namespace webrtc

#endif  // WEBRTC_AUDIO_DEVICE_AUDIO_DEVICE_UTILITY_IPHONE_H
