#include "GCPVideoRenderer.h"

namespace GoCast
{
    GCPVideoRenderer::GCPVideoRenderer(FB::PluginWindow* pWin)
    : m_pWin(pWin)
    , m_width(0)
    , m_height(0)
    
    {
        m_pFrameBuffer.reset();
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
}