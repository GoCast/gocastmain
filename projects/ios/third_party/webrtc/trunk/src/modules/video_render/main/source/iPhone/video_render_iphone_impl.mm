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

//#import "cocoa_render_view.h"
//
#include "video_render_iphone_impl.h"
#include "critical_section_wrapper.h"
#include "event_wrapper.h"
#include "trace.h"
#include "thread_wrapper.h"
#include "vplib.h"

#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreMedia/CoreMedia.h>
#import <UIKit/UIKit.h>

//extern uint textureIDForVieAutoTest;
//extern bool hadTextureVieAutoTest;

void setUpNewTexture()
{
//    if (hadTextureVieAutoTest)
//    {
//        glDeleteTextures(1, &textureIDForVieAutoTest);
//    }
//
//	glGenTextures(1, &textureIDForVieAutoTest);
//	glBindTexture(GL_TEXTURE_2D, textureIDForVieAutoTest);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
//	// This is necessary for non-power-of-two textures
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
//
//    hadTextureVieAutoTest = true;
}

//-(void) captureToTexture:(CMSampleBufferRef)sampleBuffer
//{
//    if (hadTexture)
//    {
//        glDeleteTextures(1, &textureID);
//    }
//    
//	CVImageBufferRef cameraFrame = CMSampleBufferGetImageBuffer(sampleBuffer);
//    
//    //	[self.delegate processNewCameraFrame:pixelBuffer];
//	CVPixelBufferLockBaseAddress(cameraFrame, 0);
//	int bufferHeight = CVPixelBufferGetHeight(cameraFrame);
//	int bufferWidth = CVPixelBufferGetWidth(cameraFrame);
//    
//	// Create a new texture from the camera frame data, display that using the shaders
//	glGenTextures(1, &textureID);
//	glBindTexture(GL_TEXTURE_2D, textureID);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
//	// This is necessary for non-power-of-two textures
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
//	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
//	
//	// Using BGRA extension to pull in video frame data directly
//	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, bufferWidth, bufferHeight, 0, GL_BGRA, GL_UNSIGNED_BYTE, CVPixelBufferGetBaseAddress(cameraFrame));
//    
//	CVPixelBufferUnlockBaseAddress(cameraFrame, 0);    
//    hadTexture = true;
//}

namespace webrtc {

    VideoChannelIPhone::VideoChannelIPhone(int iId, VideoRenderIPhoneImpl* owner) :
    _owner( owner),
    _id( iId),
    _width( 0),
    _height( 0),
    _startWidth( 0.0f),
    _startHeight( 0.0f),
    _stopWidth( 0.0f),
    _stopHeight( 0.0f),
    _stretchedWidth( 0),
    _stretchedHeight( 0),
    _oldStretchedHeight( 0),
    _oldStretchedWidth( 0),
    _xOldWidth( 0),
    _yOldHeight( 0),
    _buffer( 0),
    _bufferSize( 0),
    _incommingBufferSize( 0),
    _bufferIsUpdated( false),
    _numberOfStreams( 0),
    _pixelFormat( GL_RGBA),
    _pixelDataType( GL_UNSIGNED_BYTE ), //TJG
    _texture( 0),
    _bVideoSizeStartedChanging(false)
    
    {
        
    }
    
    VideoChannelIPhone::~VideoChannelIPhone()
    {
        if (_buffer)
        {
            delete [] _buffer;
            _buffer = NULL;
        }
        
        if (_texture != 0)
        {
//            [_nsglContext makeCurrentContext];
            glDeleteTextures(1, (const GLuint*) &_texture);
            _texture = 0;
        }
    }

    WebRtc_Word32 VideoChannelIPhone::GetChannelProperties(float& left,
                                                             float& top,
                                                             float& right,
                                                             float& bottom)
    {
        
//        _owner->LockAGLCntx();
        
        left = _startWidth;
        top = _startHeight;
        right = _stopWidth;
        bottom = _stopHeight;
        
//        _owner->UnlockAGLCntx();
        return 0;
    }
    
    WebRtc_Word32 VideoChannelIPhone::RenderFrame(const WebRtc_UWord32 /*streamId*/, VideoFrame& videoFrame)
    {
        
//        _owner->LockAGLCntx();
        
        if(_width != (int)videoFrame.Width() ||
           _height != (int)videoFrame.Height())
        {
            if(FrameSizeChange(videoFrame.Width(), videoFrame.Height(), 1) == -1)
            {
//                _owner->UnlockAGLCntx();
                return -1;
            }
        }
        
        int ret = DeliverFrame(videoFrame.Buffer(), videoFrame.Length(), videoFrame.TimeStamp());
        
//        _owner->UnlockAGLCntx();
        return ret;
    }
    
    int VideoChannelIPhone::UpdateSize(int width, int height)
    {
//        _owner->LockAGLCntx();
        _width = width;
        _height = height;
//        _owner->UnlockAGLCntx();
        return 0;
    }
    
    int VideoChannelIPhone::UpdateStretchSize(int stretchHeight, int stretchWidth)
    {
        
//        _owner->LockAGLCntx();
        _stretchedHeight = stretchHeight;
        _stretchedWidth = stretchWidth;
//        _owner->UnlockAGLCntx();
        return 0;
    }
    
    int VideoChannelIPhone::FrameSizeChange(int width, int height, int numberOfStreams)
    {
        //  We got a new frame size from VideoAPI, prepare the buffer
        
//        _owner->LockAGLCntx();
        
        if (width == _width && _height == height)
        {
            // We already have a correct buffer size
            _numberOfStreams = numberOfStreams;
//            _owner->UnlockAGLCntx();
            return 0;
        }
        
        _width = width;
        _height = height;
        
        // Delete the old buffer, create a new one with correct size.
        if (_buffer)
        {
            delete [] _buffer;
            _bufferSize = 0;
        }
        
        _incommingBufferSize = CalcBufferSize(kI420, _width, _height);
        _bufferSize = CalcBufferSize(kARGB, _width, _height);//_width * _height * bytesPerPixel;
        _buffer = new unsigned char [_bufferSize];
        memset(_buffer, 0, _bufferSize * sizeof(unsigned char));
        
//        [_nsglContext makeCurrentContext];
        
        if(glIsTexture(_texture))
        {
            glDeleteTextures(1, (const GLuint*) &_texture);
            _texture = 0;
        }
        
        // Create a new texture
        glGenTextures(1, (GLuint *) &_texture);
        
        GLenum glErr = glGetError();
        
        if (glErr != GL_NO_ERROR)
        {
            
        }
        
//        glBindTexture(GL_TEXTURE_RECTANGLE_EXT, _texture);
        
        GLint texSize;
        glGetIntegerv(GL_MAX_TEXTURE_SIZE, &texSize);
        
        if (texSize < _width || texSize < _height)
        {
//            _owner->UnlockAGLCntx();
            return -1;
        }
        
        // Set up th texture type and size
//RIGHTHERERIGHTNOW
        setUpNewTexture();
        glTexImage2D(GL_TEXTURE_2D,
                     0,
                     GL_RGBA,
                     _width,
                     _height,
                     0,
                     GL_BGRA,
                     GL_UNSIGNED_BYTE,
                     _buffer);

//        glTexImage2D(GL_TEXTURE_RECTANGLE_EXT, // target
//                     0, // level
//                     GL_RGBA, // internal format
//                     _width, // width
//                     _height, // height
//                     0, // border 0/1 = off/on
//                     _pixelFormat, // format, GL_RGBA
//                     _pixelDataType, // data type, GL_UNSIGNED_INT_8_8_8_8
//                     _buffer); // pixel data
        
        glErr = glGetError();
        if (glErr != GL_NO_ERROR)
        {
//            _owner->UnlockAGLCntx();
            return -1;
        }
        
//        _owner->UnlockAGLCntx();
        return 0;
    }
    
    int VideoChannelIPhone::DeliverFrame(unsigned char* buffer, int bufferSize, unsigned int /*timeStamp90kHz*/)
    {
        
//        _owner->LockAGLCntx();
        
        if (_texture == 0)
        {
//            _owner->UnlockAGLCntx();
            return 0;
        }
        
        if (bufferSize != _incommingBufferSize)
        {
//            _owner->UnlockAGLCntx();
            return -1;
        }
        
        int rgbLength = ConvertFromI420(kRGBAMac, buffer, _width, _height, _buffer);
        if (rgbLength == -1)
        {
//            _owner->UnlockAGLCntx();
            return -1;
        }
        
//        [_nsglContext makeCurrentContext];
        
        WEBRTC_TRACE(kTraceModuleCall, kTraceVideoRenderer, _id, "bufferSize=%d _width=%d _height=%d", bufferSize, _width, _height);
        
//        glBindTexture(GL_TEXTURE_RECTANGLE_EXT, _texture); // Make sure this texture is the active one
        GLenum glErr = glGetError();
        if (glErr != GL_NO_ERROR)
        {
            WEBRTC_TRACE(kTraceError, kTraceVideoRenderer, _id, "ERROR %d while calling glBindTexture", glErr);
//            _owner->UnlockAGLCntx();
            return -1;
        }
//RIGHTHERERIGHTNOW

        setUpNewTexture();
        glTexSubImage2D(GL_TEXTURE_2D,
                     0,
                     0,
                     0,
                     _width,
                     _height,
                     GL_BGRA,
                     GL_UNSIGNED_BYTE,
                     _buffer);

//        glTexSubImage2D(GL_TEXTURE_RECTANGLE_EXT,
//                        0, // Level, not use
//                        0, // start point x, (low left of pic)
//                        0, // start point y,
//                        _width, // width
//                        _height, // height
//                        _pixelFormat, // pictue format for _buffer
//                        _pixelDataType, // data type of _buffer
//                        (const GLvoid*) _buffer); // the pixel data
        
        glErr = glGetError();
        if (glErr != GL_NO_ERROR)
        {
            WEBRTC_TRACE(kTraceError, kTraceVideoRenderer, _id, "ERROR %d while calling glTexSubImage2d", glErr);
//            _owner->UnlockAGLCntx();
            return -1;
        }
        
        _bufferIsUpdated = true;
        
//        _owner->UnlockAGLCntx();
        return 0;
    }
    
    int VideoChannelIPhone::RenderOffScreenBuffer()
    {
        
//        _owner->LockAGLCntx();
        
        if (_texture == 0)
        {
//            _owner->UnlockAGLCntx();
            return 0;
        }
        
        //	if(_fullscreen)
        //	{
//        NSRect mainDisplayRect = [[NSScreen mainScreen] frame];
        //		_width = mainDisplayRect.size.width;
        //		_height = mainDisplayRect.size.height;
        //		glViewport(0, 0, mainDisplayRect.size.width, mainDisplayRect.size.height);
        //		float newX = mainDisplayRect.size.width/_width;
        //		float newY = mainDisplayRect.size.height/_height;
        
        // convert from 0.0 <= size <= 1.0 to
        // open gl world -1.0 < size < 1.0
//        GLfloat xStart = 2.0f * _startWidth - 1.0f;
//        GLfloat xStop = 2.0f * _stopWidth - 1.0f;
//        GLfloat yStart = 1.0f - 2.0f * _stopHeight;
//        GLfloat yStop = 1.0f - 2.0f * _startHeight;
        
//        [_nsglContext makeCurrentContext];
        
//        glBindTexture(GL_TEXTURE_RECTANGLE_EXT, _texture);
        _oldStretchedHeight = _stretchedHeight;
        _oldStretchedWidth = _stretchedWidth;
        
//        glLoadIdentity();
//        glEnable(GL_TEXTURE_RECTANGLE_EXT);
//        glBegin(GL_POLYGON);
        {
//            glTexCoord2f(0.0, 0.0); glVertex2f(xStart, yStop);
//            glTexCoord2f(_width, 0.0); glVertex2f(xStop, yStop);
//            glTexCoord2f(_width, _height); glVertex2f(xStop, yStart);
//            glTexCoord2f(0.0, _height); glVertex2f(xStart, yStart);
        }
//        glEnd();
        
//        glDisable(GL_TEXTURE_RECTANGLE_EXT);
        
        _bufferIsUpdated = false;
        
//        _owner->UnlockAGLCntx();
        return 0;
    }
    
    int VideoChannelIPhone::IsUpdated(bool& isUpdated)
    {
//        _owner->LockAGLCntx();
        
        isUpdated = _bufferIsUpdated;
        
//        _owner->UnlockAGLCntx();
        return 0;
    }
    
    int VideoChannelIPhone::SetStreamSettings(int /*streamId*/, float startWidth, float startHeight, float stopWidth, float stopHeight)
    {
//        _owner->LockAGLCntx();
        
        _startWidth = startWidth;
        _stopWidth = stopWidth;
        _startHeight = startHeight;
        _stopHeight = stopHeight;
        
        int oldWidth = _width;
        int oldHeight = _height;
        int oldNumberOfStreams = _numberOfStreams;
        
        _width = 0;
        _height = 0;
        
        int retVal = FrameSizeChange(oldWidth, oldHeight, oldNumberOfStreams);
        
//        _owner->UnlockAGLCntx();
        return retVal;
    }
    
    int VideoChannelIPhone::SetStreamCropSettings(int /*streamId*/, float /*startWidth*/, float /*startHeight*/, float /*stopWidth*/, float /*stopHeight*/)
    {
        return -1;
    }

#pragma mark -
    
VideoRenderIPhoneImpl::VideoRenderIPhoneImpl(const WebRtc_Word32 id,
        const VideoRenderType videoRenderType,
        void* window,
        const bool fullscreen) :
_id(id),
_renderMacCocoaCritsect(*CriticalSectionWrapper::CreateCriticalSection()),
_nsglContextCritSec(*CriticalSectionWrapper::CreateCriticalSection()),
_renderingIsPaused(true)
{

    WEBRTC_TRACE(kTraceInfo, kTraceVideoRenderer, _id, "Constructor %s:%d", __FUNCTION__, __LINE__);
}

VideoRenderIPhoneImpl::~VideoRenderIPhoneImpl()
{
    WEBRTC_TRACE(kTraceInfo, kTraceVideoRenderer, _id, "Destructor %s:%d", __FUNCTION__, __LINE__);
    delete &_renderMacCocoaCritsect;
//    if (_ptrCocoaRender)
//    {
//        delete _ptrCocoaRender;
//        _ptrCocoaRender = NULL;
//    }
}

WebRtc_Word32
VideoRenderIPhoneImpl::Init()
{

    CriticalSectionScoped cs(_renderMacCocoaCritsect);
    WEBRTC_TRACE(kTraceInfo, kTraceVideoRenderer, _id, "%s:%d", __FUNCTION__, __LINE__);

    // cast ptrWindow from void* to CocoaRenderer. Void* was once NSOpenGLView, and CocoaRenderer is NSOpenGLView.
//    _ptrCocoaRender = new VideoRenderNSOpenGL((CocoaRenderView*)_ptrWindow, _fullScreen, _id);
//    if (!_ptrWindow)
//    {
//        WEBRTC_TRACE(kTraceWarning, kTraceVideoRenderer, _id, "Constructor %s:%d", __FUNCTION__, __LINE__);
//        return -1;
//    }
//    int retVal = _ptrCocoaRender->Init();
//    if (retVal == -1)
//    {
//        WEBRTC_TRACE(kTraceInfo, kTraceVideoRenderer, _id, "Failed to init %s:%d", __FUNCTION__, __LINE__);
//        return -1;
//    }
//
//    return 0;
    return -1;
}

#pragma mark - No relevant logic

WebRtc_Word32
VideoRenderIPhoneImpl::ChangeUniqueId(const WebRtc_Word32 id)
{
    CriticalSectionScoped cs(_renderMacCocoaCritsect);
    WEBRTC_TRACE(kTraceInfo, kTraceVideoRenderer, _id, "%s", __FUNCTION__);
    _id = id;

    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::ChangeWindow(void* window)
{
    
    CriticalSectionScoped cs(_renderMacCocoaCritsect);
    WEBRTC_TRACE(kTraceInfo, kTraceVideoRenderer, _id, "%s changing ID to ", __FUNCTION__, window);
    
    if (window == NULL)
    {
        return -1;
    }
    _ptrWindow = window;
    
    WEBRTC_TRACE(kTraceModuleCall, kTraceVideoRenderer, _id, "%s:%d", __FUNCTION__, __LINE__);
    
    _ptrWindow = window;
    
    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::GetScreenResolution(WebRtc_UWord32& screenWidth,
                                           WebRtc_UWord32& screenHeight) const
{
    screenWidth = 360;
    screenHeight = 480;
    
    return 0;
}

VideoRenderType
VideoRenderIPhoneImpl::RenderType()
{
    return kRenderiPhone;
}

RawVideoType
VideoRenderIPhoneImpl::PerferedVideoType()
{
    return kVideoI420;
}

#pragma mark - Simple

bool VideoRenderIPhoneImpl::HasChannel(int channel)
{
    
    CriticalSectionScoped cs(_nsglContextCritSec);
    
    std::map<int, VideoChannelIPhone*>::iterator it = _channels.find(channel);
    
    if (it != _channels.end())
    {
        return true;
    }
    return false;
}

VideoRenderCallback*
VideoRenderIPhoneImpl::AddIncomingRenderStream(const WebRtc_UWord32 streamId,
        const WebRtc_UWord32 zOrder,
        const float left,
        const float top,
        const float right,
        const float bottom)
{
    CriticalSectionScoped cs(_renderMacCocoaCritsect);
    WEBRTC_TRACE(kTraceDebug, kTraceVideoRenderer, _id, "%s", __FUNCTION__);

    VideoChannelIPhone* nsOpenGLChannel = NULL;

    if(!_ptrWindow)
    {
        WEBRTC_TRACE(kTraceModuleCall, kTraceVideoRenderer, _id, "%s, no window", __FUNCTION__);
    }

    if(!nsOpenGLChannel)
    {
        CriticalSectionScoped cs(_nsglContextCritSec);
        
        if (HasChannel(streamId))
        {
            return NULL;
        }
        
        VideoChannelIPhone* newChannel = new VideoChannelIPhone(_id, this);
        if (newChannel->SetStreamSettings(0, 360, 480, 360, 480) == -1)
        {
            if (newChannel)
            {
                delete newChannel;
                newChannel = NULL;
            }
            
            return NULL;
        }
        
        _channels[streamId] = newChannel;
        _zOrderToChannel.insert(std::pair<int, int>(zOrder, streamId));
        
        WEBRTC_TRACE(kTraceInfo, kTraceVideoRenderer, _id, "%s successfully created channel number %d", __FUNCTION__, streamId);
        
        return newChannel;
    }

    return nsOpenGLChannel;
}

WebRtc_Word32
VideoRenderIPhoneImpl::DeleteIncomingRenderStream(const WebRtc_UWord32 streamId)
{
    WEBRTC_TRACE(kTraceDebug, kTraceVideoRenderer, _id, "Constructor %s:%d", __FUNCTION__, __LINE__);
//    CriticalSectionScoped cs(_renderMacCocoaCritsect);
//    _ptrCocoaRender->DeleteNSGLChannel(streamId);

    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::GetIncomingRenderStreamProperties(const WebRtc_UWord32 streamId,
        WebRtc_UWord32& zOrder,
        float& left,
        float& top,
        float& right,
        float& bottom) const
{
    left = top  = 0;
    right       = 360;
    bottom      = 480;
    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::StartRender()
{
    _renderingIsPaused = false;
    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::StopRender()
{
    _renderingIsPaused = true;
    return 0;
}

#pragma mark - Fake

WebRtc_Word32 VideoRenderIPhoneImpl::SetText(const WebRtc_UWord8 textId,
                                             const WebRtc_UWord8* text,
                                             const WebRtc_Word32 textLength,
                                             const WebRtc_UWord32 textColorRef,
                                             const WebRtc_UWord32 backgroundColorRef,
                                             const float left,
                                             const float top,
                                             const float right,
                                             const float bottom)
{
    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::GetGraphicsMemory(WebRtc_UWord64& totalGraphicsMemory,
        WebRtc_UWord64& availableGraphicsMemory) const
{
    totalGraphicsMemory = 0;
    availableGraphicsMemory = 0;
    return 0;
}

WebRtc_UWord32
VideoRenderIPhoneImpl::RenderFrameRate(const WebRtc_UWord32 streamId)
{
    CriticalSectionScoped cs(_renderMacCocoaCritsect);
    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::SetStreamCropping(const WebRtc_UWord32 streamId,
        const float left,
        const float top,
        const float right,
        const float bottom)
{
    return 0;
}

WebRtc_Word32 VideoRenderIPhoneImpl::ConfigureRenderer(const WebRtc_UWord32 streamId,
        const unsigned int zOrder,
        const float left,
        const float top,
        const float right,
        const float bottom)
{
    return 0;
}

WebRtc_Word32
VideoRenderIPhoneImpl::SetTransparentBackground(const bool enable)
{
    return 0;
}

WebRtc_Word32 VideoRenderIPhoneImpl::SetBitmap(const void* bitMap,
        const WebRtc_UWord8 pictureId,
        const void* colorKey,
        const float left,
        const float top,
        const float right,
        const float bottom)
{
    return 0;
}

#pragma mark - Not Implemented
bool
VideoRenderIPhoneImpl::FullScreen()
{
    return false;
}

WebRtc_Word32 VideoRenderIPhoneImpl::FullScreenRender(void* window, const bool enable)
{
    return -1;
}

} //namespace webrtc

