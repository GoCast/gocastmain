#include "../GCPVideoRenderer.h"
#include "PluginWindowlessWin.h"

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

        //trigger window refresh event
        m_pWin->InvalidateWindow();
        
        return true;
    }

    bool GCPVideoRenderer::OnWindowRefresh(FB::RefreshEvent* pEvt)
    {
		boost::mutex::scoped_lock winLock(m_winMutex);
		int width = m_pWin->getWindowWidth();
		int height = m_pWin->getWindowHeight();
		HDC hdc;

		BITMAPINFO bitmapInfo;
		bitmapInfo.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
		bitmapInfo.bmiHeader.biBitCount = 32;
		bitmapInfo.bmiHeader.biCompression = BI_RGB;
		bitmapInfo.bmiHeader.biPlanes = 1;
		bitmapInfo.bmiHeader.biSizeImage = m_width*m_height*4;
		bitmapInfo.bmiHeader.biWidth = m_width;
		bitmapInfo.bmiHeader.biHeight = m_height;

		FB::PluginWindowlessWin* pWinlessWindowsWin = dynamic_cast<FB::PluginWindowlessWin*>(m_pWin);
		if(NULL != pWinlessWindowsWin && NULL != m_pFrameBuffer.get())
		{
			FB::Rect winRect = m_pWin->getWindowPosition();
			hdc = pWinlessWindowsWin->getHDC();
			SetStretchBltMode(hdc, HALFTONE);
			StretchDIBits(hdc, winRect.left, winRect.bottom-1, width, -height, 0, 0, m_width, m_height, m_pFrameBuffer.get(), &bitmapInfo, DIB_RGB_COLORS, SRCCOPY);
		}

        return true;
    }
}
