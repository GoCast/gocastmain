#ifndef Firebreath_GCPVideoRenderer_h
#define Firebreath_GCPVideoRenderer_h

//-------------- WebRTC headers ----------------------
#include "talk/session/phone/videorenderer.h"
#include "talk/session/phone/videoframe.h"
#include "talk/session/phone/videocommon.h"
#include "talk/base/scoped_ptr.h"

//-------------- Firebreath Headers -------------------
#include <boost/thread/mutex.hpp>
#include "PluginEvents/DrawingEvents.h"
#include "PluginWindow.h"

namespace GoCast
{
    class GCPVideoRenderer: public cricket::VideoRenderer
    {
    public:
        explicit GCPVideoRenderer(FB::PluginWindow* pWin, int width, int height);
        virtual ~GCPVideoRenderer();
        virtual bool SetSize(int width, int height, int reserved);
        virtual bool RenderFrame(const cricket::VideoFrame* pFrame);
        virtual bool OnWindowRefresh(FB::RefreshEvent* pEvt = NULL);

    protected:
        talk_base::scoped_array<uint8> m_pFrameBuffer;
        FB::PluginWindow* m_pWin;
        boost::mutex m_winMutex;
        const int m_width;
        const int m_height;
    };
}

#endif

