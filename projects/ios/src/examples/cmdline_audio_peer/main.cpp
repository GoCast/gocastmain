/*
 *  Copyright (c) 2011 GoCast. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. All contributing project authors may be found in the 
 *  AUTHORS file in the root of the source tree.
 */

// File: main.cpp
// Project: cmdline_audio_peer

#if(defined(GOCAST_ENABLE_VIDEO) && defined(GOCAST_LINUX))
#include <gtk/gtk.h>
#endif

#include <iostream>
#include <sstream>
#include "talk/base/thread.h"
#include "WPLPeerConnectionClient.h"
#include "WPLSocketServer.h"
#include "TestClientShell.h"
#include "TestDefaults.h"

extern bool parsecmd(int argc, char**argv);

GoCast::ThreadSafeMessageQueue mq;

#if defined(MAC_IPHONE)
int cmd_main (int argc, const char * argv[])
#else
int main (int argc, const char * argv[])
#endif
{
    talk_base::AutoThread auto_thread;
    talk_base::Thread* thread = talk_base::Thread::Current();

#if !defined(MAC_IPHONE)
    GoCast::ThreadSafeMessageQueue mq;
#endif

    if (!parsecmd(argc, (char**)argv))
    {
        std::cout << "Error parsing command line arguments." << endl;
        exit(-1);
    }
    
#if(defined(GOCAST_ENABLE_VIDEO) && defined(GOCAST_LINUX))
    gtk_init(&argc, (char***)&argv);
#endif    
    
    GoCast::SocketServer socket_server;
    thread->set_socketserver(&socket_server);
    
    //Declare client only after set_socketserver()
#if(defined(GOCAST_ENABLE_VIDEO) && !defined(GOCAST_WINDOWS))
    GoCast::PeerConnectionClient testClient(&mq, NULL, peername, mainserver, mainserver_port, false);
#else
    GoCast::PeerConnectionClient testClient(&mq, NULL, peername, mainserver, mainserver_port);
#endif
    
    socket_server.SetPeerConnectionClient(&testClient);
    
#if !defined(MAC_IPHONE)
    //Run client shell
    TestClientShell shell(&mq);
    shell.startThread();
#endif
    
    //Run client
    thread->Run();
        
    //Set thread's socket server to NULL before exiting
    thread->set_socketserver(NULL);
    
#if !defined(MAC_IPHONE)
    //Stop shell thread
    shell.stopThread();
#endif
    
    return 0;
}
