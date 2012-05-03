/*
 *  Copyright (c) 2011 GoCast. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may be found in the 
 *  AUTHORS file in the root of the source tree.
 */

//  File: GCPSocketServer.h
//  Project: GoCastPlayer

#ifndef GoCastPlayer_GCPSocketServer_h
#define GoCastPlayer_GCPSocketServer_h

#include "talk/base/thread.h"
#include "talk/base/physicalsocketserver.h"

namespace GoCast
{
    class SocketServer : public talk_base::PhysicalSocketServer
    {
    protected:        
        talk_base::Thread* m_pThread;
        
    public:
        SocketServer();
        virtual ~SocketServer();
        virtual bool Wait(int cms, bool process_io);
    };
}

#endif
