#if(defined(GOCAST_ENABLE_VIDEO) && defined(MAC_IPHONE))

#include <assert.h>
#include <unistd.h>
#include "WPLVideoRenderer.h"
#include "rtc_common.h"
//#include "Mac/PluginWindowMac.h"
#import "CLAPViewController.h"
#include "GlErrors.h"

extern CLAPViewController* gInstance;

static pthread_mutex_t pluginWinMutex;
void* pThePluginWindow;
GoCast::VideoRenderer* GoCast::VideoRenderer::s_pHead = NULL;
int GoCast::VideoRenderer::s_numRenderers = 0;
std::deque<GoCast::VideoRenderer*> GoCast::VideoRenderer::s_refreshQueue;

//extern unsigned int textureID;
//extern bool hadTexture;

@interface genTextureHelperParams : NSObject
{
    @public
    GoCast::VideoRenderer* parent;
    void* buf;
    int width, height;
}
@end
@implementation genTextureHelperParams : NSObject
@end

@implementation genTextureHelperObject

-(void) _genTextureHelper:(genTextureHelperParams*)params//xxy
{
    [EAGLContext setCurrentContext:gInstance->glContext];
    //--
    [gInstance->renderViewLocal bind];
    //        openGLGenFakeTexture();
    if (params->parent->hadTexture)
    {
        glDeleteTextures(1, &params->parent->textureID);
        CHECK_GL_ERRORS();
    }
    
    // Create a new texture from the camera frame data, display that using the shaders
    glGenTextures(1, &params->parent->textureID);
    CHECK_GL_ERRORS();
    glBindTexture(GL_TEXTURE_2D, params->parent->textureID);
    CHECK_GL_ERRORS();
    
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
    
    // This is necessary for non-power-of-two textures
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
    
    // Using BGRA extension to pull in video frame data directly
    glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, params->width, params->height, 0, GL_RGBA, GL_UNSIGNED_BYTE, params->buf);
    CHECK_GL_ERRORS();
    
    params->parent->hadTexture = true;
}
@end

namespace GoCast
{
    VideoRenderer* VideoRenderer::Create(const std::string& peerName,
                                         const int width,
                                         const int height,
                                         ThreadSafeMessageQueue* pEvtQ)
    {
	    return new VideoRenderer(peerName, width, height, pEvtQ);
    }

    void VideoRenderer::Destroy(VideoRenderer* pRenderer)
    {
	    delete pRenderer;
    }

    bool VideoRenderer::OnRefreshRenderArea(void* pEvt,
                                            void* pWin)
    {        
	    if(0 < s_numRenderers)
	    {
            while(false == s_refreshQueue.empty())
            {
                VideoRenderer* pRenderer = s_refreshQueue.front();
                s_refreshQueue.pop_front();
                pRenderer->RedrawRenderArea(pEvt, pWin);
            }
	    }
	    
	    return false;
    }

    bool VideoRenderer::Init()
    {
        pthread_mutex_lock(&pluginWinMutex);
        
        if(NULL != s_pHead)
        {
            s_pHead->SetPrev(this);
        }
        
        m_rendererIndex = s_numRenderers;
        s_pHead = this;     
        s_numRenderers++;
        
        pthread_mutex_unlock(&pluginWinMutex);
        
	    return true;
    }

    void VideoRenderer::Deinit()
    {
        pthread_mutex_lock(&pluginWinMutex);
        
        s_refreshQueue.clear();
        
        if(NULL != m_pPrev)
        {
            m_pPrev->SetNext(m_pNext);
            m_pPrev->DecRendererIndex();
        }
        else
        {
            s_pHead = m_pNext;
        }
        
        if(NULL != m_pNext)
        {
            m_pNext->SetPrev(m_pPrev);
        }

        s_numRenderers--;
        
        pthread_mutex_unlock(&pluginWinMutex);
    }

    void VideoRenderer::RedrawRenderArea(void* pEvt,
                                         void* pWin)
    {

//        FB::CoreGraphicsDraw* pCgDrawEvt(static_cast<FB::CoreGraphicsDraw*>(pEvt));
//        CGContextRef pContext = pCgDrawEvt->context;
//        CGContextSetShouldAntialias(pContext, false);
//        
//        if(NULL == pContext)
//        {
//            return;
//        }
//        
//        int winWidth = pCgDrawEvt->bounds.right - pCgDrawEvt->bounds.left;
//        int winHeight = pCgDrawEvt->bounds.bottom - pCgDrawEvt->bounds.top;
//        
//        if(winWidth<=1 || winHeight<=1)
//            return;
//        
//        CGContextSaveGState(pContext);
//        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
//        CGImageRef cgImage = CGImageCreate(m_width, m_height, 8, 32, 4*m_width, colorSpace, 
//                                           kCGImageAlphaNoneSkipLast,
//                                           CGDataProviderCreateWithData(NULL,
//                                                                        m_spFrmBuf.get(),
//                                                                        m_width*m_height*4,
//                                                                        NULL),
//                                           NULL, false, kCGRenderingIntentDefault);
//        if(NULL == cgImage)
//        {
//            CGColorSpaceRelease(colorSpace);
//            CGContextRestoreGState(pContext);
//            return;
//        }
//        
//        CGContextSetInterpolationQuality(pContext, kCGInterpolationNone);
//        CGContextTranslateCTM(pContext, 0, winHeight);
//        CGContextScaleCTM(pContext, 1, -1);
//        CGContextDrawImage(pContext, CGRectMake(m_rendererIndex*m_width, 0, m_width, m_height), cgImage);
//        
//        CGImageRelease(cgImage);
//        CGColorSpaceRelease(colorSpace);
//        CGContextRestoreGState(pContext);        
    }

    bool VideoRenderer::SetSize(int width, int height, int reserved)
    {
	    return true;
    }
    
    bool VideoRenderer::RenderFrame(const cricket::VideoFrame* pFrame)
    {
        pthread_mutex_lock(&pluginWinMutex);

	    int frmBufSize = m_width*m_height*4;
        
	    pFrame->ConvertToRgbBuffer(
	      cricket::FOURCC_ARGB,
	      m_spFrmBuf.get(),
	      frmBufSize,
	      m_width*4
	    );

        //Convert ABGR -> ARGB
        uint8* pBufIter = m_spFrmBuf.get();
	    uint8* pBufEnd = pBufIter + frmBufSize;
        union
        {
            unsigned int src;
            unsigned char srcdata[4];
        };
	    while(pBufIter < pBufEnd)
	    {
            src     = ((unsigned int*)pBufIter)[0];
		    pBufIter[0] = srcdata[2];   //R
            pBufIter[1] = srcdata[1];   //G
            pBufIter[2] = srcdata[0];   //B
            pBufIter[3] = srcdata[3];   //A
		    pBufIter += 4;
	    }

        this->_genTexture(m_spFrmBuf.get(), m_width, m_height);

        pthread_mutex_unlock(&pluginWinMutex);
	        
	    return true;
    }

    void VideoRenderer::_genTexture(void* buf, int width, int height)
    {
        genTextureHelperParams* params = [[genTextureHelperParams alloc] init];
        params->parent = this;
        params->buf = buf;
        params->width = width;
        params->height = height;

        genTextureHelperObject* obj = [[genTextureHelperObject alloc] init];
        [obj performSelectorOnMainThread:@selector(_genTextureHelper:) withObject:params waitUntilDone:YES];
        [obj release];
        //    [obj _genTextureHelper:params];
    }

    VideoRenderer::VideoRenderer(const std::string& peerName,
                                 const int width,
                                 const int height,
                                 ThreadSafeMessageQueue* pEvtQ)
    : m_peerName(peerName)
    , m_width(width)
    , m_height(height)    
    , m_rendererIndex(0)
    , m_pNext(s_pHead)
    , m_pPrev(NULL)
    , m_pEvtQ(pEvtQ)
    , hadTexture(false)
    {
	    m_spFrmBuf.reset(new uint8[m_width*m_height*4]);
	            
	    if(NULL != m_pEvtQ)
	    {
	        ThreadSafeMessageQueue::ParsedMessage event;
	        event["type"] = "RendererAdd";
	        event["message"] = ToString(m_width);
	        event["message"] += ":";
	        event["message"] += ToString(m_height);
	        m_pEvtQ->PostMessage(event);
	    }        
    }

    VideoRenderer::~VideoRenderer()
    {
	    m_spFrmBuf.reset(NULL);

	    if(NULL != m_pEvtQ)
	    {
	        ThreadSafeMessageQueue::ParsedMessage event;
	        event["type"] = "RendererRemove";
	        event["message"] = ToString(m_width);
	        event["message"] += ":";
	        event["message"] += ToString(m_height);
	        m_pEvtQ->PostMessage(event);
	    }
    }
}

#endif

