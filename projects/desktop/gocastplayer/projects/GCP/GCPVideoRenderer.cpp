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
        m_pMirrorBuffers[0].reset();
        m_pMirrorBuffers[1].reset();
    }
    
    GCPVideoRenderer::~GCPVideoRenderer()
    {
        m_pMirrorBuffers[0].reset(NULL);
        m_pMirrorBuffers[1].reset(NULL);
        m_pFrameBuffer.reset(NULL);
    }
    
    bool GCPVideoRenderer::SetSize(int width, int height, int reserved)
    {
        //resize not implemented yet
        return true;
    }
}