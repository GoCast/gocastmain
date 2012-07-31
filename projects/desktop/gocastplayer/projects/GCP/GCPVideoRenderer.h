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
        explicit GCPVideoRenderer(FB::PluginWindow* pWin);
        virtual ~GCPVideoRenderer();
        
        // cricket::VideoFrame overrides
        virtual bool SetSize(int width, int height, int reserved);
        virtual bool RenderFrame(const cricket::VideoFrame* pFrame);
        
        // Refresh event handler
        virtual bool OnWindowRefresh(FB::RefreshEvent* pEvt = NULL);
        
    public:
        void SetPreviewMode(bool bPreview) { m_bPreview = bPreview; }

    protected:
        bool MirrorIfPreview(const cricket::VideoFrame* pFrame);        
        
    protected:
        talk_base::scoped_array<uint8> m_pFrameBuffer;
        talk_base::scoped_array<uint8> m_pMirrorBuffers[2];
        FB::PluginWindow* m_pWin;
        boost::mutex m_winMutex;
        int m_width;
        int m_height;
        bool m_bPreview;
    };
}

#endif

