//
//  WebrtcVideoRenderer.h
//  FireBreath
//
//  Created by Manjesh Malavalli on 1/23/12.
//  Copyright (c) 2012 XVDTH. All rights reserved.
//

#ifndef FireBreath_WebrtcVideoRenderer_h
#define FireBreath_WebrtcVideoRenderer_h

//-------------- WebRTC headers ----------------------
#include "talk/session/phone/videorenderer.h"
#include "talk/session/phone/videoframe.h"
#include "talk/session/phone/videocommon.h"
#include "talk/base/scoped_ptr.h"

//-------------- Firebreath Headers-------------------
#include <boost/thread/mutex.hpp>
#include "PluginEvents/DrawingEvents.h"
#include "PluginWindow.h"

#define GOCAST_DEFAULT_RENDER_WIDTH     352
#define GOCAST_DEFAULT_RENDER_HEIGHT    288

namespace GoCast
{
    class GCPVideoRenderer : public cricket::VideoRenderer
    {
    public:
        explicit GCPVideoRenderer(FB::PluginWindow* pWin, int width, int height);
        virtual ~GCPVideoRenderer();
        virtual bool SetSize(int width, int height, int reserved);
        virtual bool RenderFrame(const cricket::VideoFrame* pFrame);
        virtual bool OnWindowRefresh(FB::RefreshEvent* pEvt, FB::PluginWindow* pWin);
        
    protected:
        talk_base::scoped_array<uint8> m_pFrameBuffer;
        FB::PluginWindow* m_pWin;
        boost::mutex m_winMutex;
        const int m_width;
        const int m_height;
    };
}

#endif
