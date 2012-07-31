#include "common_video/libyuv/include/libyuv.h"
#include "../GCPVideoRenderer.h"

namespace GoCast
{
    bool GCPVideoRenderer::RenderFrame(const cricket::VideoFrame* pFrame)
    {
        boost::mutex::scoped_lock winLock(m_winMutex);
        
        if(NULL == m_pFrameBuffer.get())
        {
            m_width = pFrame->GetWidth();
            m_height = pFrame->GetHeight();
            m_pFrameBuffer.reset(new uint8[m_width*m_height*4]);
            m_pMirrorBuffers[0].reset(new uint8[pFrame->SizeOf(m_width, m_height)+4]);
            m_pMirrorBuffers[1].reset(new uint8[pFrame->SizeOf(m_width, m_height)+4]);
        }
        
        const int stride = m_width*4;
        const int frameBufferSize = m_height*stride;
        
        if(false == MirrorIfPreview(pFrame))
        {
            return false;
        }
        
        if(true == m_bPreview)
        {
            if(0 > webrtc::ConvertI420ToARGB8888(m_pMirrorBuffers[1].get(),
                                                 m_pFrameBuffer.get(),
                                                 m_width,
                                                 m_height))
            {
                return false;
            }
        }
        else
        {
            pFrame->ConvertToRgbBuffer(cricket::FOURCC_ARGB,
                                       m_pFrameBuffer.get(),
                                       frameBufferSize,
                                       stride);
        }
        
        //convert to rgba and correct alpha
        uint8* pBufIter = m_pFrameBuffer.get();
        uint8* pBufEnd = pBufIter + frameBufferSize;
        while(pBufIter < pBufEnd)
        {
            pBufIter[3] = pBufIter[0];
            pBufIter[0] = pBufIter[2];
            pBufIter[2] = pBufIter[3];
            pBufIter[3] = 0xff;
            pBufIter += 4;
        }
        
        //trigger window refresh event
        m_pWin->InvalidateWindow();
        
        return true;
    }
    
    bool GCPVideoRenderer::OnWindowRefresh(FB::RefreshEvent* pEvt)
    {
        FB::CoreGraphicsDraw* pCgDrawEvt(static_cast<FB::CoreGraphicsDraw*>(pEvt));
        CGContextRef pContext = pCgDrawEvt->context;
        boost::mutex::scoped_lock winLock(m_winMutex);

        const int stride = m_width*4;    
        const int frameBufferSize = m_height*stride;
        
        if(NULL == pContext || NULL == m_pFrameBuffer.get())
        {
            return false;
        }
        
        int winWidth = pCgDrawEvt->bounds.right - pCgDrawEvt->bounds.left;
        int winHeight = pCgDrawEvt->bounds.bottom - pCgDrawEvt->bounds.top;
        
        if(winWidth<=1 || winHeight<=1)
            return false;
        
        CGContextSaveGState(pContext);        
        CGContextSetShouldAntialias(pContext, false);
        CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
        CGImageRef cgImage = CGImageCreate(m_width, m_height, 8, 32, stride, colorSpace, 
                                           kCGImageAlphaNoneSkipLast,
                                           CGDataProviderCreateWithData(NULL,
                                                                        m_pFrameBuffer.get(),
                                                                        frameBufferSize,
                                                                        NULL),
                                           NULL, false, kCGRenderingIntentDefault);
        if(NULL == cgImage)
        {
            CGColorSpaceRelease(colorSpace);
            CGContextRestoreGState(pContext);
            return false;
        }
        
        CGContextSetInterpolationQuality(pContext, kCGInterpolationDefault);
        CGContextTranslateCTM(pContext, 0, winHeight);
        CGContextScaleCTM(pContext, 1, -1);
        CGContextDrawImage(pContext, CGRectMake(0, 0, winWidth, winHeight), cgImage);
        
        CGImageRelease(cgImage);
        CGColorSpaceRelease(colorSpace);
        CGContextRestoreGState(pContext);
        
        return true;
    }
    
    bool GCPVideoRenderer::MirrorIfPreview(const cricket::VideoFrame* pFrame)
    {
        if(NULL == pFrame)
        {
            return false;
        }
        
        if(false == m_bPreview)
        {
            return true;
        }
        
        if(0 >= pFrame->CopyToBuffer(m_pMirrorBuffers[0].get(), pFrame->SizeOf(m_width, m_height)))
        {
            return false;
        }
        
        if(0 > webrtc::MirrorI420LeftRight(m_pMirrorBuffers[0].get(), m_pMirrorBuffers[1].get(), m_width, m_height))
        {
            return false;
        }
        
        return true;
    }
}