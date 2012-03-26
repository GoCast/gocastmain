/*
 *  Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

#include "engine_configurations.h"

//#if defined(COCOA_RENDERING)

#ifndef VIDEO_RENDER_IPHONE_IMPL_H
#define VIDEO_RENDER_IPHONE_IMPL_H

#include "i_video_render.h"

#include <map>

namespace webrtc {
class CriticalSectionWrapper;
//class VideoRenderNSOpenGL;

class VideoRenderIPhoneImpl;
    
class VideoChannelIPhone : public VideoRenderCallback
{
    
public:
    
    VideoChannelIPhone(int iId, VideoRenderIPhoneImpl* owner);
    virtual ~VideoChannelIPhone();
    
    // A new frame is delivered
    virtual int DeliverFrame(unsigned char* buffer, int bufferSize, unsigned int timeStame90kHz);
    
    // Called when the incomming frame size and/or number of streams in mix changes
    virtual int FrameSizeChange(int width, int height, int numberOfStreams);
    
    virtual int UpdateSize(int width, int height);
    
    // Setup 
    int SetStreamSettings(int streamId, float startWidth, float startHeight, float stopWidth, float stopHeight);
    int SetStreamCropSettings(int streamId, float startWidth, float startHeight, float stopWidth, float stopHeight);
    
    // Called when it's time to render the last frame for the channel
    int RenderOffScreenBuffer();
    
    // Returns true if a new buffer has been delivered to the texture
    int IsUpdated(bool& isUpdated);
    virtual int UpdateStretchSize(int stretchHeight, int stretchWidth);
    
    // ********** new module functions ************ //
    virtual WebRtc_Word32 RenderFrame(const WebRtc_UWord32 streamId, VideoFrame& videoFrame);
    
    // ********** new module helper functions ***** //
//    int ChangeContext(NSOpenGLContext *nsglContext);
    WebRtc_Word32 GetChannelProperties(float& left,
                                       float& top,
                                       float& right,
                                       float& bottom);
    
private:
    VideoRenderIPhoneImpl* _owner;
    int _id;
    WebRtc_Word32 _width;
    WebRtc_Word32 _height;
    float _startWidth;
    float _startHeight;
    float _stopWidth;
    float _stopHeight;
    int _stretchedWidth;
    int _stretchedHeight;
    int _oldStretchedHeight;
    int _oldStretchedWidth;
    int _xOldWidth;
    int _yOldHeight;
    unsigned char* _buffer;
    int _bufferSize;
    int _incommingBufferSize;
    bool _bufferIsUpdated;
    int _numberOfStreams;
    int _pixelFormat;
    int _pixelDataType;
    unsigned int _texture;
    bool _bVideoSizeStartedChanging;
};


// Class definitions
class VideoRenderIPhoneImpl : IVideoRender
{
public:
    /*
     *   Constructor/destructor
     */

    VideoRenderIPhoneImpl(const WebRtc_Word32 id,
            const VideoRenderType videoRenderType,
            void* window,
            const bool fullscreen);

    virtual ~VideoRenderIPhoneImpl();

    virtual WebRtc_Word32 Init();

    virtual WebRtc_Word32 ChangeUniqueId(const WebRtc_Word32 id);

    virtual WebRtc_Word32 ChangeWindow(void* window);

    /**************************************************************************
     *
     *   Incoming Streams
     *
     ***************************************************************************/
    virtual VideoRenderCallback* AddIncomingRenderStream(const WebRtc_UWord32 streamId,
            const WebRtc_UWord32 zOrder,
            const float left,
            const float top,
            const float right,
            const float bottom);

    virtual WebRtc_Word32 DeleteIncomingRenderStream(const WebRtc_UWord32 streamId);

    virtual WebRtc_Word32 GetIncomingRenderStreamProperties(const WebRtc_UWord32 streamId,
            WebRtc_UWord32& zOrder,
            float& left,
            float& top,
            float& right,
            float& bottom) const;

    /**************************************************************************
     *
     *   Start/Stop
     *
     ***************************************************************************/

    virtual WebRtc_Word32 StartRender();

    virtual WebRtc_Word32 StopRender();

    /**************************************************************************
     *
     *   Properties
     *
     ***************************************************************************/

    virtual VideoRenderType RenderType();

    virtual RawVideoType PerferedVideoType();

    virtual bool FullScreen();

    virtual WebRtc_Word32 GetGraphicsMemory(WebRtc_UWord64& totalGraphicsMemory,
            WebRtc_UWord64& availableGraphicsMemory) const;

    virtual WebRtc_Word32 GetScreenResolution(WebRtc_UWord32& screenWidth,
            WebRtc_UWord32& screenHeight) const;

    virtual WebRtc_UWord32 RenderFrameRate(const WebRtc_UWord32 streamId);

    virtual WebRtc_Word32 SetStreamCropping(const WebRtc_UWord32 streamId,
            const float left,
            const float top,
            const float right,
            const float bottom);

    virtual WebRtc_Word32 ConfigureRenderer(const WebRtc_UWord32 streamId,
            const unsigned int zOrder,
            const float left,
            const float top,
            const float right,
            const float bottom);

    virtual WebRtc_Word32 SetTransparentBackground(const bool enable);

    virtual WebRtc_Word32 SetText(const WebRtc_UWord8 textId,
            const WebRtc_UWord8* text,
            const WebRtc_Word32 textLength,
            const WebRtc_UWord32 textColorRef,
            const WebRtc_UWord32 backgroundColorRef,
            const float left,
            const float top,
            const float right,
            const float bottom);

    virtual WebRtc_Word32 SetBitmap(const void* bitMap,
            const WebRtc_UWord8 pictureId,
            const void* colorKey,
            const float left,
            const float top,
            const float right,
            const float bottom);

    virtual WebRtc_Word32 FullScreenRender(void* window, const bool enable);
    
    bool HasChannel(int channel);

private:
    WebRtc_Word32 _id;
    CriticalSectionWrapper& _renderMacCocoaCritsect;
    CriticalSectionWrapper& _nsglContextCritSec;
    std::map<int, VideoChannelIPhone*> _channels;
    std::multimap<int, int> _zOrderToChannel;
    void* _ptrWindow;
    bool _renderingIsPaused;
};

} //namespace webrtc

#endif  // WEBRTC_MODULES_VIDEO_RENDER_MAIN_SOURCE_MAC_VIDEO_RENDER_MAC_COCOA_IMPL_H_
//#endif	// COCOA_RENDERING
