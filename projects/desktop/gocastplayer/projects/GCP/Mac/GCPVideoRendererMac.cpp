#include "../GCPVideoRenderer.h"
#include <iostream>

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
        }
        
        const int stride = m_width*4;
        const int frameBufferSize = m_height*stride;
        pFrame->ConvertToRgbBuffer(cricket::FOURCC_ARGB,
                                   m_pFrameBuffer.get(),
                                   frameBufferSize,
                                   stride);
        
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
        
        static int frameNumber = 0;
        std::cout << "RenderFrame: " << frameNumber++ << std::endl;
        
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
        static int frameNumber = 0;
        std::cout << "RenderFrame[1]: " << frameNumber++ << std::endl;
        
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
}