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
}