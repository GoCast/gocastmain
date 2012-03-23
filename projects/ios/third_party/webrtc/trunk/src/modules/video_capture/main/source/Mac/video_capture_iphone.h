/*
 *  Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

#ifndef VIDEO_CAPTURE_IPHONE_H
#define VIDEO_CAPTURE_IPHONE_H

//#import <QTKit/QTKit.h>
//#import <AVFoundation/AVFoundation.h>

#include <stdio.h>

#include "../video_capture_impl.h"
//#include "video_capture_qtkit_utility.h"
#include "../device_info_impl.h"


// Forward declaraion
//@class VideoCaptureAVCaptureObjC;
//@class VideoCaptureAVCaptureInfoObjC;


#define MAX_NAME_LENGTH                 1024

#define AVCAPTURE_MIN_WIDTH             0
#define AVCAPTURE_MAX_WIDTH             640
#define AVCAPTURE_DEFAULT_WIDTH         288

#define AVCAPTURE_MIN_HEIGHT            0
#define AVCAPTURE_MAX_HEIGHT            480
#define AVCAPTURE_DEFAULT_HEIGHT        352

#define AVCAPTURE_MIN_FRAME_RATE        1
#define AVCAPTURE_MAX_FRAME_RATE        30
#define AVCAPTURE_DEFAULT_FRAME_RATE    30

namespace webrtc
{
    namespace videocapturemodule
    {
        
class VideoCaptureAVCapture : public VideoCaptureImpl
{
public:
    VideoCaptureAVCapture(const WebRtc_Word32 id);
    virtual ~VideoCaptureAVCapture();
    
    /*
     *   Create a video capture module object
     *
     *   id - unique identifier of this video capture module object
     *   deviceUniqueIdUTF8 -  name of the device. Available names can be found
     *       by using GetDeviceName
     *   deviceUniqueIdUTF8Length - length of deviceUniqueIdUTF8
     */
    static void Destroy(VideoCaptureModule* module);
    
    WebRtc_Word32 Init(const WebRtc_Word32 id,
                       const WebRtc_UWord8* deviceUniqueIdUTF8);
    
    
    // Start/Stop
    virtual WebRtc_Word32 StartCapture(const VideoCaptureCapability& capability);
    virtual WebRtc_Word32 StopCapture();
    
    // Properties of the set device
    
    virtual bool CaptureStarted();
    
    WebRtc_Word32 CaptureSettings(VideoCaptureCapability& settings);
    
protected:
    // Help functions
    WebRtc_Word32 SetCameraOutput();
    
private:
    void* _captureDevice;
//    VideoCaptureAVCaptureObjC*        _captureDevice;
//    VideoCaptureAVCaptureInfoObjC*    _captureInfo;
    bool                    _isCapturing;
    WebRtc_Word32           _id;
    WebRtc_Word32           _captureWidth;
    WebRtc_Word32           _captureHeight;
    WebRtc_Word32           _captureFrameRate;
    WebRtc_UWord8           _currentDeviceNameUTF8[MAX_NAME_LENGTH];
    WebRtc_UWord8           _currentDeviceUniqueIdUTF8[MAX_NAME_LENGTH];
    WebRtc_UWord8           _currentDeviceProductUniqueIDUTF8[MAX_NAME_LENGTH];
    WebRtc_Word32           _frameCount;
};

class VideoCaptureAVCaptureInfo: public DeviceInfoImpl
{
public:
    
    VideoCaptureAVCaptureInfo(const WebRtc_Word32 id);
    virtual ~VideoCaptureAVCaptureInfo();
    
    WebRtc_Word32 Init();
    
    virtual WebRtc_UWord32 NumberOfDevices();
    
    /*
     * Returns the available capture devices.
     * deviceNumber   -[in] index of capture device
     * deviceNameUTF8 - friendly name of the capture device
     * deviceUniqueIdUTF8 - unique name of the capture device if it exist.
     *      Otherwise same as deviceNameUTF8
     * productUniqueIdUTF8 - unique product id if it exist. Null terminated
     *      otherwise.
     */
    virtual WebRtc_Word32 GetDeviceName(WebRtc_UWord32 deviceNumber, WebRtc_UWord8* deviceNameUTF8,
                                        WebRtc_UWord32 deviceNameLength, WebRtc_UWord8* deviceUniqueIdUTF8,
                                        WebRtc_UWord32 deviceUniqueIdUTF8Length,
                                        WebRtc_UWord8* productUniqueIdUTF8 = 0,
                                        WebRtc_UWord32 productUniqueIdUTF8Length = 0);
    
    /*
     *   Returns the number of capabilities for this device
     */
    virtual WebRtc_Word32 NumberOfCapabilities(const WebRtc_UWord8* deviceUniqueIdUTF8);
    
    /*
     *   Gets the capabilities of the named device
     */
    virtual WebRtc_Word32 GetCapability(const WebRtc_UWord8* deviceUniqueIdUTF8,
                                        const WebRtc_UWord32 deviceCapabilityNumber,
                                        VideoCaptureCapability& capability);
    
    /*
     *  Gets the capability that best matches the requested width, height and frame rate.
     *  Returns the deviceCapabilityNumber on success.
     */
    virtual WebRtc_Word32 GetBestMatchedCapability(const WebRtc_UWord8*deviceUniqueIdUTF8,
                                                   const VideoCaptureCapability requested,
                                                   VideoCaptureCapability& resulting);
    
    /*
     * Display OS /capture device specific settings dialog
     */
    virtual WebRtc_Word32 DisplayCaptureSettingsDialogBox(const WebRtc_UWord8* deviceUniqueIdUTF8,
                                                          const WebRtc_UWord8* dialogTitleUTF8, void* parentWindow,
                                                          WebRtc_UWord32 positionX, WebRtc_UWord32 positionY);
    
protected:
    virtual WebRtc_Word32 CreateCapabilityMap(const WebRtc_UWord8* deviceUniqueIdUTF8);
    
//    VideoCaptureAVCaptureInfoObjC*    _captureInfo;
};

    };
};

#endif  // VIDEO_CAPTURE_IPHONE_H
