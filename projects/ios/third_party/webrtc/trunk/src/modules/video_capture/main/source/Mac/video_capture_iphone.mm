/*
 *  Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

/*
 *  video_capture_mac.cc
 *
 */

#include <stdio.h>

// super class stuff
#include "../video_capture_impl.h"
#include "../device_info_impl.h"
#include "../video_capture_config.h"
#include "ref_count.h"

#include "critical_section_wrapper.h"

#include "trace.h"

#include <Foundation/Foundation.h>

#include "video_capture.h"
#include "video_capture_iphone.h"

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>

using namespace webrtc::videocapturemodule;

#pragma mark - ObjC VideoCaptureRecursiveLock

@interface VideoCaptureRecursiveLock : NSRecursiveLock <NSLocking>
{
    BOOL _locked;
}
@property BOOL locked;
- (void)lock;
- (void)unlock;
@end

@implementation VideoCaptureRecursiveLock
@synthesize locked = _locked;
- (id)init
{
    self = [super init];
    if(nil == self)
    {
        return nil;
    }
    
    [self setLocked:NO];
    return self;
}

- (void)lock
{
    [self setLocked:YES];
    [super lock];
}

- (void)unlock
{
    [self setLocked:NO];
    [super unlock];
}
@end

#pragma mark - ObjC Capture class

@interface iOSCaptureInfoClass : NSObject
{
    bool _hasFront;
    bool _hasBack;
    int _deviceCount;
}

-(bool) hasFrontCamera;
-(bool) hasBackCamera;
-(int) getDeviceCount;

@end

@implementation iOSCaptureInfoClass
-(void) infoInit
{
    _deviceCount = 0;
    _hasFront =
    _hasBack = false;
    
    //Grab all possible cameras
	NSArray *devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
	
    //For each camera
    for (AVCaptureDevice *device in devices) 
	{
        if ([device position] == AVCaptureDevicePositionFront) 
        {
            self->_hasFront = true;     //detect prescence
            self->_deviceCount++;       //add to device count
        }
        if ([device position] == AVCaptureDevicePositionBack) 
        {
            self->_hasBack = true;      //detect prescence
            self->_deviceCount++;       //add to device count
        }
	}
}
-(bool) hasFrontCamera
{
    return _hasFront;
}

-(bool) hasBackCamera
{
    return _hasBack;
}

-(int) getDeviceCount
{
    return _deviceCount;
}

@end

@interface iOSCaptureClass : NSObject <AVCaptureVideoDataOutputSampleBufferDelegate>
{
	AVCaptureSession*           captureSession;
	AVCaptureDeviceInput*       videoInput;
	AVCaptureVideoDataOutput*   videoOutput;
    VideoCaptureRecursiveLock*  _rLock;
    VideoCaptureImpl*           _owner;
}

-(void) registerOwner:(VideoCaptureImpl*)newOwner;
-(void) captureInit:(bool)useFrontCamera;
-(void) captureTerminate;
-(void) captureStart;
-(void) captureStop;
-(void) captureFrame:(CMSampleBufferRef)sampleBuffer;
-(void) captureOutput:(AVCaptureOutput *)captureOutput didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection;
@end

@implementation iOSCaptureClass
-(void) registerOwner:(VideoCaptureImpl*)newOwner
{
    self->_owner = newOwner;
}

-(void) captureInit:(bool)useFrontCamera
{
    self->_rLock = [[VideoCaptureRecursiveLock alloc] init];

    self->_owner = NULL;

	AVCaptureDevice *targetCamera = nil;

    //Grab all possible cameras
	NSArray *devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
	
    //For each camera
    for (AVCaptureDevice *device in devices) 
	{
        if (useFrontCamera) //Grab the front-facing camera
        {
            //If this is a suitable candidate, grab it
            if ([device position] == AVCaptureDevicePositionFront) 
            {
                targetCamera = device;
                break;
            }
        }
        else                //Grab the back-facing camera
        {
            //If this is a suitable candidate, grab it
            if ([device position] == AVCaptureDevicePositionBack) 
            {
                targetCamera = device;
                break;
            }
        }
	}
	
	// Create the capture session
	captureSession = [[AVCaptureSession alloc] init];
	
	// Add the video input	
	NSError *error = nil;
	videoInput = [[[AVCaptureDeviceInput alloc] initWithDevice:targetCamera error:&error] autorelease];
	if ([captureSession canAddInput:videoInput]) 
	{
		[captureSession addInput:videoInput];
	}
	
	// Add the video frame output	
	videoOutput = [[AVCaptureVideoDataOutput alloc] init];
	[videoOutput setAlwaysDiscardsLateVideoFrames:YES];
	// Use RGB frames instead of YUV to ease color processing
	[videoOutput setVideoSettings:[NSDictionary dictionaryWithObject:[NSNumber numberWithInt:kCVPixelFormatType_32BGRA] forKey:(id)kCVPixelBufferPixelFormatTypeKey]];
    //	dispatch_queue_t videoQueue = dispatch_queue_create("com.sunsetlakesoftware.colortracking.videoqueue", NULL);
    //	[videoOutput setSampleBufferDelegate:self queue:videoQueue];
    
    //	dispatch_queue_t videoQueue = dispatch_queue_create("com.sunsetlakesoftware.colortracking.videoqueue", NULL);
	[videoOutput setSampleBufferDelegate:self queue:dispatch_get_main_queue()];
    
	if ([captureSession canAddOutput:videoOutput])
	{
		[captureSession addOutput:videoOutput];
	}
	else
	{
		NSLog(@"Couldn't add video output");
	}
}

-(void) captureTerminate
{
	[captureSession release];
	[videoOutput release];
	[videoInput release];
    [_rLock release];
}

-(void) captureStart
{
	// Start capturing
    //	[captureSession setSessionPreset:AVCaptureSessionPresetHigh];
	[captureSession setSessionPreset:AVCaptureSessionPreset352x288];
	if (![captureSession isRunning])
	{
		[captureSession startRunning];
	};
}

-(void) captureStop
{
	[captureSession stopRunning];
}

inline int xyToIndex(int x, int y, int width, int height)
{
    return y*width + x;
}

void rotateBufferBy90(unsigned int* outBuf, unsigned int* inBuf, int inWidth, int inHeight)
{
    for (int j = 0; j < inHeight; j++)
    {
        for (int i = 0; i < inWidth; i++)
        {
            outBuf[xyToIndex(j, i, inHeight, inWidth)] = inBuf[xyToIndex(i, j, inWidth, inHeight)];
        }
    }
}

-(void) captureFrame:(CMSampleBufferRef)sampleBuffer
{
    if(YES == [_rLock tryLock])
    {
        [_rLock lock];
    }
    else
    {
        return;
    }

	CVImageBufferRef videoFrame = CMSampleBufferGetImageBuffer(sampleBuffer);

    const int LOCK_FLAGS = 0; // documentation says to pass 0
    
    // get size of the frame
    CVPixelBufferLockBaseAddress(videoFrame, LOCK_FLAGS);
    void* baseAddress = CVPixelBufferGetBaseAddress(videoFrame);
    size_t bytesPerRow = CVPixelBufferGetBytesPerRow(videoFrame);
    int frameWidth = CVPixelBufferGetWidth(videoFrame);
    int frameHeight = CVPixelBufferGetHeight(videoFrame);
    CVPixelBufferUnlockBaseAddress(videoFrame, LOCK_FLAGS);
    
    if(_owner)
    {
        int frameSize = bytesPerRow * frameHeight;    // 32 bit ARGB format
        CVBufferRetain(videoFrame);
        webrtc::VideoCaptureCapability tempCaptureCapability;
        tempCaptureCapability.width = frameWidth;
        tempCaptureCapability.height = frameHeight;
        tempCaptureCapability.maxFPS = 30;
        tempCaptureCapability.rawType = webrtc::kVideoARGB;

        //Convert BGRA -> ARGB
        unsigned char* pBufIter = (unsigned char*)baseAddress;
	    unsigned char* pBufEnd = pBufIter + (frameWidth * frameHeight * 4);
        union
        {
            unsigned int src;
            unsigned char srcdata[4];
        };
	    while(pBufIter < pBufEnd)
	    {
            src     = ((unsigned int*)pBufIter)[0];
		    pBufIter[0] = srcdata[3];   //R
            pBufIter[1] = srcdata[2];   //G
            pBufIter[2] = srcdata[1];   //B
            pBufIter[3] = srcdata[0];   //A
		    pBufIter += 4;
	    }

//TJG - This rotates the buffer properly if uncommented, however it seems that VP8 can't handle an odd sized frame right now.
//        unsigned int* newBuf = new unsigned int[frameWidth * frameHeight * 4];
//        rotateBufferBy90(newBuf, (unsigned int*)baseAddress, frameWidth, frameHeight);
//        _owner->IncomingFrame((unsigned char*)newBuf, frameSize, tempCaptureCapability, 0);
//        delete [] newBuf;

        _owner->IncomingFrame((unsigned char*)baseAddress,
                              frameSize,
                              tempCaptureCapability,
                              0);

        CVBufferRelease(videoFrame);
    }

    if(YES == [_rLock locked])
    {
        [_rLock unlock];
    }
}

#pragma mark AVCaptureVideoDataOutputSampleBufferDelegate

-(void) captureOutput:(AVCaptureOutput *)captureOutput didOutputSampleBuffer:(CMSampleBufferRef)sampleBuffer fromConnection:(AVCaptureConnection *)connection
{
    [self captureFrame:sampleBuffer];
}

@end

#pragma mark - VideoCaptureAVCapture

VideoCaptureAVCapture::VideoCaptureAVCapture(const WebRtc_Word32 id) :
VideoCaptureImpl(id),
_isCapturing(false),
_id(id),
_captureWidth(AVCAPTURE_DEFAULT_WIDTH),
_captureHeight(AVCAPTURE_DEFAULT_HEIGHT),
_captureFrameRate(AVCAPTURE_DEFAULT_FRAME_RATE),
_frameCount(0)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, id,
                 "VideoCaptureAVCapture::VideoCaptureAVCapture() called");
    
    memset(_currentDeviceNameUTF8, 0, MAX_NAME_LENGTH);
    memset(_currentDeviceUniqueIdUTF8, 0, MAX_NAME_LENGTH);
    memset(_currentDeviceProductUniqueIDUTF8, 0, MAX_NAME_LENGTH);
}

VideoCaptureAVCapture::~VideoCaptureAVCapture()
{
    
    WEBRTC_TRACE(webrtc::kTraceDebug, webrtc::kTraceVideoCapture, _id,
                 "~VideoCaptureAVCapture() called");
    if((iOSCaptureClass*)_captureDevice)
    {
        [(iOSCaptureClass*)_captureDevice captureStop];
        [(iOSCaptureClass*)_captureDevice release];
    }
}

WebRtc_Word32 VideoCaptureAVCapture::Init(const WebRtc_Word32 id, const WebRtc_UWord8* iDeviceUniqueIdUTF8)
{
    CriticalSectionScoped cs(_apiCs);

    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, id,
                 "VideoCaptureAVCapture::Init() called with id %d and unique "
                 "device %s", id, iDeviceUniqueIdUTF8);

    const WebRtc_Word32 nameLength =
    (WebRtc_Word32) strlen((char*)iDeviceUniqueIdUTF8);
    if(nameLength > kVideoCaptureUniqueNameLength)
        return -1;

    // Store the device name
    _deviceUniqueId = new WebRtc_UWord8[nameLength+1];
    memcpy(_deviceUniqueId, iDeviceUniqueIdUTF8,nameLength+1);

    _captureDevice = [[iOSCaptureClass alloc] init];
    if(NULL == _captureDevice)
    {
        WEBRTC_TRACE(webrtc::kTraceError, webrtc::kTraceVideoCapture, id,
                     "Failed to create an instance of "
                     "VideoCaptureAVCaptureObjC");
        return -1;
    }

    if(0 == strcmp((char*)iDeviceUniqueIdUTF8, ""))
    {
        // the user doesn't want to set a capture device at this time
        return 0;
    }

    [(iOSCaptureClass*)_captureDevice captureInit:(strcmp((char*)iDeviceUniqueIdUTF8, "front camera") == 0)];
    [(iOSCaptureClass*)_captureDevice registerOwner:this];

    // at this point we know that the user has passed in a valid camera. Let's
    // set it as the current.

    WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, _id,
                 "successfully Init VideoCaptureAVCapture" );
    return 0;
}

WebRtc_Word32 VideoCaptureAVCapture::StartCapture(const VideoCaptureCapability& capability)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, _id,
                 "StartCapture width %d, height %d, frameRate %d",
                 capability.width, capability.height, capability.maxFPS);
    
    _captureWidth = capability.width;
    _captureHeight = capability.height;
    _captureFrameRate = capability.maxFPS;
    
    
    [(iOSCaptureClass*)_captureDevice captureStart];

    _isCapturing = true;
    return 0;
}

WebRtc_Word32 VideoCaptureAVCapture::StopCapture()
{
    [(iOSCaptureClass*)_captureDevice captureStop];
    
    _isCapturing = false;
    return 0;
}

bool VideoCaptureAVCapture::CaptureStarted()
{
    return _isCapturing;
}

WebRtc_Word32 VideoCaptureAVCapture::CaptureSettings(VideoCaptureCapability& settings)
{
    settings.width = _captureWidth;
    settings.height = _captureHeight;
    settings.maxFPS = _captureFrameRate;
    return 0;
}

#pragma mark - VideoCaptureAVCaptureInfo 
VideoCaptureAVCaptureInfo::VideoCaptureAVCaptureInfo(const WebRtc_Word32 id) :
DeviceInfoImpl(id),
_captureDeviceInfo(NULL)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);

    _captureDeviceInfo = [[iOSCaptureInfoClass alloc] init];
    [(iOSCaptureInfoClass*)_captureDeviceInfo infoInit];
}

VideoCaptureAVCaptureInfo::~VideoCaptureAVCaptureInfo()
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);

    [(iOSCaptureInfoClass*)_captureDeviceInfo release];
}

WebRtc_Word32 VideoCaptureAVCaptureInfo::Init()
{
    
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);
    return 0;
}

WebRtc_UWord32 VideoCaptureAVCaptureInfo::NumberOfDevices()
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);

    return [(iOSCaptureInfoClass*)_captureDeviceInfo getDeviceCount];
}

// Returns the available capture devices.
// deviceNumber   - Index of capture device.
// deviceNameUTF8 - Friendly name of the capture device.
// deviceUniqueIdUTF8 - Unique name of the capture device if it exist.
//                      Otherwise same as deviceNameUTF8.
// productUniqueIdUTF8 - Unique product id if it exist.
//                       Null terminated otherwise.
WebRtc_Word32 VideoCaptureAVCaptureInfo::GetDeviceName(
                                                      WebRtc_UWord32 deviceNumber, WebRtc_UWord8* deviceNameUTF8,
                                                      WebRtc_UWord32 deviceNameLength, WebRtc_UWord8* deviceUniqueIdUTF8,
                                                      WebRtc_UWord32 deviceUniqueIdUTF8Length, WebRtc_UWord8* productUniqueIdUTF8,
                                                      WebRtc_UWord32 productUniqueIdUTF8Length)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);

    bool hasFront       = [(iOSCaptureInfoClass*)_captureDeviceInfo hasFrontCamera];
    bool hasBack        = [(iOSCaptureInfoClass*)_captureDeviceInfo hasBackCamera];

    const char* devName = NULL;
    
    if (hasFront)
    {
        if (hasBack)    //front & back camera
        {
            switch (deviceNumber)
            {
                case 0: devName = "front camera"; break;            
                case 1: devName = "back camera"; break;
            }
        }
        else            //front camera only
        {
            switch (deviceNumber)
            {
                case 0: devName = "front camera"; break;            
            }
        }
    }
    else
    {
        if (hasBack)    //back camera only
        {
            switch (deviceNumber)
            {
                case 0: devName = "back camera"; break;            
            }
        }
    }
    
    if (devName)    //Had at least one camera (index 0 or 1), and found it
    {
        sprintf((char*)deviceNameUTF8, "%s", devName);
        sprintf((char*)deviceUniqueIdUTF8, "%s", devName);
        
        return 0;
    }

    return -1;
}

WebRtc_Word32 VideoCaptureAVCaptureInfo::NumberOfCapabilities(const WebRtc_UWord8* deviceUniqueIdUTF8)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);
    WEBRTC_TRACE(webrtc::kTraceError, webrtc::kTraceVideoCapture, _id,
                 "NumberOfCapabilities is not supported on the iPhone platform.");
    return -1;
}


WebRtc_Word32 VideoCaptureAVCaptureInfo::GetCapability(const WebRtc_UWord8* deviceUniqueIdUTF8,
                                                       const WebRtc_UWord32 deviceCapabilityNumber,
                                                       VideoCaptureCapability& capability)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);
    WEBRTC_TRACE(webrtc::kTraceError, webrtc::kTraceVideoCapture, _id,
                 "NumberOfCapabilities is not supported on the iPhone platform.");
    return -1;
}


WebRtc_Word32 VideoCaptureAVCaptureInfo::GetBestMatchedCapability(const WebRtc_UWord8*deviceUniqueIdUTF8,
                                                                  const VideoCaptureCapability requested, VideoCaptureCapability& resulting)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);
    WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, _id,
                 "NumberOfCapabilities is not supported on the iPhone platform.");
    return -1;
}

WebRtc_Word32 VideoCaptureAVCaptureInfo::DisplayCaptureSettingsDialogBox(const WebRtc_UWord8* deviceUniqueIdUTF8,
                                                                         const WebRtc_UWord8* dialogTitleUTF8, void* parentWindow,
                                                                         WebRtc_UWord32 positionX, WebRtc_UWord32 positionY)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);
    WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, _id,
                 "DisplayCaptureSettingsDialogBox is not supported on the iPhone platform.");
    return 0;   //TJG - Return success because that's what happens on the Mac platform-- can we return failure though?
}

WebRtc_Word32 VideoCaptureAVCaptureInfo::CreateCapabilityMap(
                                                            const WebRtc_UWord8* deviceUniqueIdUTF8)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, 0,
                 "%s:%d", __FUNCTION__, __LINE__);
    WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, _id,
                 "NumberOfCapabilities is not supported on the iPhone platform.");
    return -1;
}

//--

#pragma mark - VideoCaptureImpl

namespace webrtc
{
    namespace videocapturemodule
    {

/**************************************************************************
 *
 *    Create/Destroy a VideoCaptureModule
 *
 ***************************************************************************/

/*
 *   Returns version of the module and its components
 *
 *   version                 - buffer to which the version will be written
 *   remainingBufferInBytes  - remaining number of WebRtc_Word8 in the version
 *                             buffer
 *   position                - position of the next empty WebRtc_Word8 in the
 *                             version buffer
 */

VideoCaptureModule* VideoCaptureImpl::Create(
    const WebRtc_Word32 id, const WebRtc_UWord8* deviceUniqueIdUTF8)
{
    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, id,
                 "Create %s", deviceUniqueIdUTF8);

    WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, id,
                 "Using AVCapture framework to capture video", id);

    RefCountImpl<videocapturemodule::VideoCaptureAVCapture>* newCaptureModule =
        new RefCountImpl<videocapturemodule::VideoCaptureAVCapture>(id);

    if(!newCaptureModule)
    {
        WEBRTC_TRACE(webrtc::kTraceDebug, webrtc::kTraceVideoCapture, id,
                     "could not Create for unique device %s, !newCaptureModule",
                     deviceUniqueIdUTF8);
        return NULL;
    }
    if(newCaptureModule->Init(id, deviceUniqueIdUTF8) != 0)
    {
        WEBRTC_TRACE(webrtc::kTraceDebug, webrtc::kTraceVideoCapture, id,
                     "could not Create for unique device %s, "
                     "newCaptureModule->Init()!=0", deviceUniqueIdUTF8);
        delete newCaptureModule;
        return NULL;
    }

    // Successfully created VideoCaptureMacQuicktime. Return it
    WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, id,
                 "Module created for unique device %s, will use AVCapture "
                 "framework",deviceUniqueIdUTF8);
    return newCaptureModule;
}

/**************************************************************************
 *
 *    Create/Destroy a DeviceInfo
 *
 ***************************************************************************/

VideoCaptureModule::DeviceInfo*
VideoCaptureImpl::CreateDeviceInfo(const WebRtc_Word32 id)
{

    WEBRTC_TRACE(webrtc::kTraceModuleCall, webrtc::kTraceVideoCapture, id,
                 "Create %d", id);

    webrtc::videocapturemodule::VideoCaptureAVCaptureInfo* newCaptureInfoModule =
        new webrtc::videocapturemodule::VideoCaptureAVCaptureInfo(id);

    if(!newCaptureInfoModule || newCaptureInfoModule->Init() != 0)
    {
        //Destroy(newCaptureInfoModule);
        delete newCaptureInfoModule;
        newCaptureInfoModule = NULL;
        WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, id,
                     "Failed to Init newCaptureInfoModule created with id %d "
                     "and device \"\" ", id);
        return NULL;
    }
    WEBRTC_TRACE(webrtc::kTraceInfo, webrtc::kTraceVideoCapture, id,
                 "VideoCaptureModule created for id", id);
    return newCaptureInfoModule;
}

/**************************************************************************
 *
 *    End Create/Destroy VideoCaptureModule
 *
 ***************************************************************************/
}  // namespace videocapturemodule
}  // namespace webrtc

