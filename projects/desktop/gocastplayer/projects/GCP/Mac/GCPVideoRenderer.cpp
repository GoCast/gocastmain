//
//  WebrtcVideoRenderer.cpp
//  FireBreath
//
//  Created by Manjesh Malavalli on 1/23/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#include "GCPVideoRenderer.h"

namespace GoCast
{
    GCPVideoRenderer::GCPVideoRenderer(FB::PluginWindow* pWin,
                                       int width,
                                       int height)
    : m_pWin(pWin)
    , m_width(width)
    , m_height(height)

    {
        m_pFrameBuffer.reset(new uint8[m_width*m_height*4]);
    }

    GCPVideoRenderer::~GCPVideoRenderer()
    {
        m_pFrameBuffer.reset(NULL);
    }

    bool GCPVideoRenderer::SetSize(int width, int height, int reserved)
    {
        //resize not implemented yet
        return true;
    }

    bool GCPVideoRenderer::RenderFrame(const cricket::VideoFrame* pFrame)
    {
        static const int stride = m_width*4;
        static const int frameBufferSize = m_height*stride;
        boost::mutex::scoped_lock winLock(m_winMutex);

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

        //trigger window refresh event
        m_pWin->InvalidateWindow();
        
        return true;
    }

    bool GCPVideoRenderer::OnWindowRefresh(FB::RefreshEvent* pEvt,
                                           FB::PluginWindow* pWin)
    {
        static const int stride = m_width*4;    
        static const int frameBufferSize = m_height*stride;
        FB::CoreGraphicsDraw* pCgDrawEvt(static_cast<FB::CoreGraphicsDraw*>(pEvt));
        CGContextRef pContext = pCgDrawEvt->context;
        boost::mutex::scoped_lock winLock(m_winMutex);
        
        if(NULL == pContext)
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
        
        CGContextSetInterpolationQuality(pContext, kCGInterpolationNone);
        CGContextTranslateCTM(pContext, 0, winHeight);
        CGContextScaleCTM(pContext, 1, -1);
        CGContextDrawImage(pContext, CGRectMake(0, 0, m_width, m_height), cgImage);
        
        CGImageRelease(cgImage);
        CGColorSpaceRelease(colorSpace);
        CGContextRestoreGState(pContext);

        return false;
    }
}
