#include "common_video/libyuv/include/libyuv.h"
#include "GCPVideoRenderer.h"

namespace GoCast
{
    GCPVideoRenderer::GCPVideoRenderer(FB::PluginWindow* pWin)
    : m_pWin(pWin)
    , m_width(0)
    , m_height(0)
    , m_bPreview(false)
    {
        m_pFrameBuffer.reset();
        m_pMirrorBuffers[0] = NULL;
        m_pMirrorBuffers[1] = NULL;
    }
    
    GCPVideoRenderer::~GCPVideoRenderer()
    {
		FreeBuffer(m_pMirrorBuffers[0]);
		FreeBuffer(m_pMirrorBuffers[1]);
        m_pFrameBuffer.reset(NULL);
    }
    
    bool GCPVideoRenderer::SetSize(int width, int height, int reserved)
    {
        //resize not implemented yet
        return true;
    }
    
    bool GCPVideoRenderer::RenderFrame(const cricket::VideoFrame* pFrame)
    {
        boost::mutex::scoped_lock winLock(m_winMutex);
        
        if(NULL == m_pFrameBuffer.get())
        {
            m_width = pFrame->GetWidth();
            m_height = pFrame->GetHeight();
            m_pFrameBuffer.reset(new uint8[m_width*m_height*4]);
        }
        
        if(false == MirrorIfPreview(pFrame))
        {
            return false;
        }
        
        if(true == m_bPreview)
        {
            if(0 > webrtc::ConvertI420ToARGB8888(m_pMirrorBuffers[1],
                                                 m_pFrameBuffer.get(),
                                                 m_width,
                                                 m_height))
            {
                return false;
            }
        }
        else
        {
            const int stride = m_width*4;
            const int frameBufferSize = m_height*stride;
            pFrame->ConvertToRgbBuffer(cricket::FOURCC_ARGB,
                                       m_pFrameBuffer.get(),
                                       frameBufferSize,
                                       stride);
        }
        
        //convert to rgba and correct alpha
        ConvertToRGBA();
        
        //trigger window refresh event
        InvalidateWindow();
        
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
        
		if(0 >= m_width || 0 >= m_height)
		{
			return false;
		}

        if(NULL == m_pMirrorBuffers[0])
        {
			m_pMirrorBuffers[0] = AllocBuffer(cricket::VideoFrame::SizeOf(m_width, m_height));
        }
        
        if(NULL == m_pMirrorBuffers[1])
        {
            m_pMirrorBuffers[1] = AllocBuffer(cricket::VideoFrame::SizeOf(m_width, m_height));
        }
        
        if(0 >= pFrame->CopyToBuffer(m_pMirrorBuffers[0], pFrame->SizeOf(m_width, m_height)))
        {
            return false;
        }
        
        if(0 > webrtc::MirrorI420LeftRight(m_pMirrorBuffers[0], m_pMirrorBuffers[1], m_width, m_height))
        {
            return false;
        }
        
        return true;
    }
}